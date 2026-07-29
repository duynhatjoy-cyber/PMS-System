import { NIGHTLY_RATE } from "../data/frontDeskData";
import { startOfDay, formatDMYShort, formatTime } from "./format";

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

function formatRange(from, to) {
  return `${formatDMYShort(from)} ${formatTime(from)} - ${formatDMYShort(to)} ${formatTime(to)}`;
}

// Room charges bill at one flat nightly rate, so consecutive nights collapse
// into a single "Giá ngày (from - to)" line.
function buildRoomLines(booking, asOf) {
  const effectiveEnd = effectiveEndDate(booking, asOf);
  const nights = countNights(booking.checkIn, effectiveEnd);
  const amount = nights * NIGHTLY_RATE;
  return { nights, lines: [{ label: `Giá ngày (${formatRange(booking.checkIn, effectiveEnd)})`, amount }] };
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
