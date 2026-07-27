import { NIGHTLY_RATE } from "../data/frontDeskData";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Effective end of the stay for billing purposes: the full checkout date,
// or "now" if that falls earlier (mid-stay bill / partial-stay invoice).
export function effectiveEndDate(booking, asOf) {
  if (asOf !== "now") return booking.checkOut;
  const now = new Date();
  return now < booking.checkOut ? now : booking.checkOut;
}

export function countNights(checkIn, effectiveEnd) {
  let cursor = startOfDay(checkIn);
  const endDay = startOfDay(effectiveEnd);
  let nights = 0;
  while (cursor < endDay) {
    nights += 1;
    cursor = addDays(cursor, 1);
  }
  return Math.max(1, nights);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatShort(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatRange(from, to) {
  return `${formatShort(from)} - ${formatShort(to)}`;
}

// Room charges bill at one flat nightly rate, so consecutive nights collapse
// into a single "Giá ngày (from - to)" line.
export function buildRoomLines(booking, asOf) {
  const effectiveEnd = effectiveEndDate(booking, asOf);
  const nights = countNights(booking.checkIn, effectiveEnd);
  const amount = nights * NIGHTLY_RATE;
  return { nights, lines: [{ label: `Giá ngày (${formatRange(booking.checkIn, effectiveEnd)})`, amount }] };
}

export function buildServiceLines(booking) {
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
