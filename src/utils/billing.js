import { NIGHTLY_RATE } from "../data/frontDeskData";
import { addDays, startOfDay, formatDMYShort, formatTime } from "./format";

// Effective end of the stay for billing purposes: the full checkout date,
// or "now" if that falls earlier (mid-stay bill / partial-stay invoice).
function effectiveEndDate(booking, asOf) {
  if (asOf !== "now") return booking.checkOut;
  const now = new Date();
  return now < booking.checkOut ? now : booking.checkOut;
}

function countNights(checkIn, effectiveEnd) {
  const nights = Math.round((startOfDay(effectiveEnd) - startOfDay(checkIn)) / 86400000);
  return Math.max(1, nights);
}

function buildRoomLines(booking, asOf) {
  const effectiveEnd = effectiveEndDate(booking, asOf);
  const nights = countNights(booking.checkIn, effectiveEnd);
  const rates = booking.nightlyRates || [];
  const nightlyAmounts = Array.from({ length: nights }, (_, index) =>
    rates[index] !== undefined && Number(rates[index]) >= 0 ? Number(rates[index]) : NIGHTLY_RATE
  );
  const base = nightlyAmounts.reduce((sum, rate) => sum + rate, 0);
  const percent = Math.min(100, Math.max(0, Number(booking.roomDiscountPercent) || 0));
  const amount = booking.roomFeeWaived ? 0 : Math.max(0, Math.round(base * (1 - percent / 100) - (Number(booking.roomDiscountAmount) || 0)));
  let allocated = 0;
  let cumulativeRate = 0;
  const lines = nightlyAmounts.map((rate, index) => {
    const from = addDays(booking.checkIn, index);
    const to = addDays(from, 1);
    to.setHours(booking.checkOut.getHours(), booking.checkOut.getMinutes(), 0, 0);
    cumulativeRate += rate;
    const cumulativeAmount = index === nights - 1 ? amount : Math.round(amount * cumulativeRate / base) || 0;
    const line = {
      label: `Giá ngày (${formatDMYShort(from)} ${formatTime(from)} - ${formatDMYShort(to)} ${formatTime(to)})`,
      amount: cumulativeAmount - allocated,
    };
    allocated = cumulativeAmount;
    return line;
  });
  return { nights, lines };
}

function buildServiceLines(booking) {
  return booking.services.map((s) => ({
    label: `${s.name}${s.qty > 1 ? ` x${s.qty}` : ""}`,
    amount: s.price * (s.qty || 1),
  }));
}

// Full totals for a booking as of a given cutoff, including discount/VAT.
export function computeBill(booking, { asOf = "checkout", discount = 0, vatEnabled = false } = {}) {
  const { lines: roomLines } = buildRoomLines(booking, asOf);
  const serviceLines = buildServiceLines(booking);

  const roomTotal = roomLines.reduce((sum, l) => sum + l.amount, 0);
  const serviceTotal = serviceLines.reduce((sum, l) => sum + l.amount, 0);
  const subtotal = roomTotal + serviceTotal - discount;
  const vat = vatEnabled ? Math.round((subtotal * 0.08) / 1000) * 1000 : 0;
  const grandTotal = subtotal + vat;

  const paid = (booking.paymentRecords || []).reduce((sum, p) => sum + p.amount, 0);
  const remaining = grandTotal - paid;

  return { roomLines, serviceLines, roomTotal, serviceTotal, subtotal, vat, grandTotal, paid, remaining };
}
