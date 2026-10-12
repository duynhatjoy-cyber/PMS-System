import { ROOMS } from "../data/roomMapData";

export function toRoomMapDetailBooking(booking) {
  const room = ROOMS.find((item) => item.number === booking.room);
  const isInHouse = ["in_house", "overdue"].includes(booking.status);
  return {
    id: booking.id,
    groupId: booking.groupId,
    stage: booking.status === "checked_out" ? "checkedout" : isInHouse ? "inhouse" : "arrival",
    room: booking.room,
    roomType: room?.typeKey || booking.roomType || "",
    bookingCode: booking.code,
    guest: { name: booking.guest || "Khách lưu trú", flag: booking.nationality || "VN" },
    guests: booking.guests || [{ id: `${booking.id}-guest`, name: booking.guest || "Khách lưu trú", flag: booking.nationality || "VN" }],
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    stayCount: booking.stayCount || 0,
    adults: booking.adults ?? 2,
    children: booking.children || 0,
    assigned: Boolean(booking.room),
    confirmed: booking.status !== "booked_future",
    paid: Boolean(booking.paid),
    source: booking.source,
    notes: booking.notes || "",
    services: booking.services || [],
    paymentRecords: booking.paymentRecords || [],
  };
}
