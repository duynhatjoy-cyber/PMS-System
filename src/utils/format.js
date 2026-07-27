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

export function parseDMY(value) {
  const [d, m, y] = value.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}
