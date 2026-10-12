import { AVAILABLE_ROOMS } from "../data/frontDeskData";

export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export function isRoomAvailable(bookings, room, checkIn, checkOut, excludedIds = []) {
  return !bookings.some((booking) =>
    !excludedIds.includes(booking.id) && booking.stage !== "checkedout" && booking.room === room &&
    rangesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)
  );
}

export function searchAvailableRooms(bookings, checkIn, checkOut, query = "", roomOptions = null) {
  if (!(checkIn instanceof Date) || !(checkOut instanceof Date) || !(checkOut > checkIn)) return [];
  const needle = query.trim().toLowerCase();
  const catalog = roomOptions || Object.entries(AVAILABLE_ROOMS).flatMap(([typeId, rooms]) => rooms.map((room) => ({ room, typeId })));
  return catalog.filter(({ room }) => room.toLowerCase().includes(needle) && isRoomAvailable(bookings, room, checkIn, checkOut));
}

export function getGroupBookings(bookings, groupId) {
  return bookings.filter((booking) => booking.groupId === groupId);
}
