import { formatCurrency, formatDMYShort, formatTime } from "./format";

export function guestLabel(booking, fields) {
  if (!booking.guest) return "";
  let label = booking.guest;
  if (fields.guestDisplay === "gender") label += ` (${booking.gender || "—"})`;
  if (fields.showSegment && booking.segment) label += ` - ${booking.segment}`;
  return label;
}

export function timeLabel(booking, fields) {
  if (fields.timeDisplay === "duration") {
    const nights = Math.max(1, Math.ceil((booking.checkOut - booking.checkIn) / 86400000));
    return `${nights} đêm`;
  }
  return `${formatDMYShort(booking.checkIn)} ${formatTime(booking.checkIn)} → ${formatDMYShort(booking.checkOut)} ${formatTime(booking.checkOut)}`;
}

export function priceLabel(booking, room, fields, getRateForDate) {
  const first = getRateForDate(room.typeKey, booking.checkIn);
  const lastDate = new Date(booking.checkOut);
  lastDate.setDate(lastDate.getDate() - 1);
  const last = getRateForDate(room.typeKey, lastDate);
  const nights = Math.max(1, Math.ceil((booking.checkOut - booking.checkIn) / 86400000));
  const value = fields.priceDisplay === "lastNight" ? last : fields.priceDisplay === "total" ? first * nights : first;
  return formatCurrency(value);
}

export function extraLabels(booking, fields) {
  return [
    fields.showSourceGroup ? booking.sourceGroup : null,
    fields.showSegment ? booking.segment : null,
  ].filter(Boolean);
}
