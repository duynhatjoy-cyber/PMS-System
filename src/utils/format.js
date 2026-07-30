const pad2 = (n) => String(n).padStart(2, "0");

export function formatDMY(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDMYShort(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}

export function formatDateTimeDMY(date) {
  return `${formatDMY(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function formatTime(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function formatCurrency(amount) {
  return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
}

export function formatElapsed(fromDate, toDate) {
  let totalMinutes = Math.max(0, Math.floor((toDate - fromDate) / 60000));
  const days = Math.floor(totalMinutes / 1440);
  totalMinutes -= days * 1440;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;

  return `${pad2(days)}:${pad2(hours)}:${pad2(minutes)}`;
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toLocalInputValue(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

const compactVNDFormatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 0 });

export function formatCompactVND(amount) {
  return compactVNDFormatter.format(amount);
}

export function addMonths(date, months) {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeekMonday(date) {
  const next = startOfDay(date);
  const offset = (next.getDay() + 6) % 7;
  return addDays(next, -offset);
}

export function startOfQuarter(date) {
  const quarterMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), quarterMonth, 1);
}

export function endOfQuarter(date) {
  const quarterMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), quarterMonth + 3, 0);
}

export function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

export function endOfYear(date) {
  return new Date(date.getFullYear(), 11, 31);
}
