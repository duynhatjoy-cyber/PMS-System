export default function generateTicketNo(prefix) {
  return `${prefix}${Math.floor(10000 + Math.random() * 8999)}`;
}
