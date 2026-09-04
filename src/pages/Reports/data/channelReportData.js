import { ROOM_TYPES } from "../../../data/roomMapData";

// Kênh OTA đang kết nối — dùng lại tên đã dùng ở SOURCE_META/settingsData
// thay vì bịa thêm kênh mới.
export const CHANNELS = [
  { key: "agoda", label: "Agoda" },
  { key: "tripcom", label: "Trip.com" },
  { key: "bookingcom", label: "Booking.com" },
  { key: "traveloka", label: "Traveloka" },
];

// Trọng số minh hoạ mức bán mỗi hạng phòng theo từng kênh (không ngẫu nhiên,
// để số liệu demo ổn định qua các lần tải trang) — thứ tự khớp ROOM_TYPES.
const CHANNEL_ROOM_WEIGHT = {
  agoda: [5, 4, 3, 2, 1],
  tripcom: [1, 2, 4, 3, 2],
  bookingcom: [1, 1, 2, 2, 3],
  traveloka: [2, 1, 1, 1, 1],
};

function buildRoomTypeRow(roomType, weight, idx) {
  const reservations = weight * 3 + idx;
  // weight giảm dần đều theo idx ở vài kênh (vd Agoda [5,4,3,2,1]) nên
  // "weight + idx" bị triệt tiêu thành hằng số — nhân hệ số khác nhau cho
  // weight/idx để tránh mọi hạng phòng trong 1 kênh ra cùng 1 số.
  const avgLOS = Math.round((1.1 + ((weight + idx * 2) % 4) * 0.35) * 100) / 100;
  const roomNights = Math.max(reservations, Math.round(reservations * avgLOS));
  const adr = Math.round((roomType.basePrice * (0.85 + (weight % 3) * 0.1)) / 1000) * 1000;
  const cancellations = Math.max(0, weight - (idx % 3) - 1);
  const avgLeadTime = Math.round((0.3 + ((weight * 2 + idx * 3) % 5) * 0.08) * 100) / 100;

  return {
    roomTypeKey: roomType.key,
    roomTypeLabel: roomType.label,
    revenue: adr * roomNights,
    reservations,
    roomNights,
    avgLOS,
    avgLeadTime,
    adr,
    cancellations,
  };
}

// { [channelKey]: [ rowPerRoomType, ... ] }
export const CHANNEL_ROOM_STATS = Object.fromEntries(
  CHANNELS.map((c) => [
    c.key,
    ROOM_TYPES.map((rt, i) => buildRoomTypeRow(rt, CHANNEL_ROOM_WEIGHT[c.key][i], i)),
  ])
);

export function aggregateRows(rows) {
  const reservations = rows.reduce((s, r) => s + r.reservations, 0);
  const roomNights = rows.reduce((s, r) => s + r.roomNights, 0);
  const revenue = rows.reduce((s, r) => s + r.revenue, 0);
  const cancellations = rows.reduce((s, r) => s + r.cancellations, 0);

  return {
    revenue,
    reservations,
    roomNights,
    cancellations,
    avgLOS: reservations ? roomNights / reservations : 0,
    adr: roomNights ? revenue / roomNights : 0,
    avgLeadTime: rows.length ? rows.reduce((s, r) => s + r.avgLeadTime, 0) / rows.length : 0,
  };
}

