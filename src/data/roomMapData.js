import { addDays } from "../utils/format";

export const ROOM_TYPES = [
  { key: "C_Std Dbl", label: "C_Std Dbl", basePrice: 700000, maxAdults: 2, maxChildren: 0 },
  { key: "STD DBL", label: "STD DBL", basePrice: 750000, maxAdults: 2, maxChildren: 0 },
  { key: "C_Sup Dbl", label: "C_Sup Dbl", basePrice: 900000, maxAdults: 2, maxChildren: 1 },
  { key: "DELUXE FAM", label: "DELUXE FAM", basePrice: 1250000, maxAdults: 4, maxChildren: 2 },
  { key: "C_VIP", label: "C_VIP", basePrice: 1800000, maxAdults: 2, maxChildren: 2 },
];

const ROOM_TYPE_BY_KEY = Object.fromEntries(ROOM_TYPES.map((t) => [t.key, t]));

// Nguồn đặt phòng — mỗi nguồn có 1 badge tròn (mã 2 ký tự + màu riêng) hiển
// thị trên thanh đặt phòng, thay cho logo thật của từng kênh OTA.
export const SOURCE_META = {
  Traveloka: { code: "TL", color: "#0064d2" },
  Agoda: { code: "AG", color: "#5c2d91" },
  "Booking.com": { code: "BK", color: "#003580" },
  Call: { code: "CL", color: "#6b7280" },
  "Walk-in": { code: "WI", color: "#1e7a4c" },
  ez_be: { code: "EZ", color: "#a8631f" },
};

// Giá cuối tuần (T6-T7) cao hơn ngày thường ~5% — minh hoạ khái niệm giá
// biến động theo ngày mà không cần một bộ máy quản lý giá thật.
export function getRateForDate(typeKey, date) {
  const base = ROOM_TYPE_BY_KEY[typeKey]?.basePrice ?? 0;
  const isWeekend = date.getDay() === 5 || date.getDay() === 6;
  return isWeekend ? Math.round((base * 1.05) / 1000) * 1000 : base;
}

function isRoomOccupied(booking, room, dayStart, dayEnd) {
  return booking.room === room.number && booking.checkIn < dayEnd && booking.checkOut > dayStart;
}

// Phòng trống theo đêm lưu trú (checkIn <= ngày < checkOut), đúng quy ước
// tính công suất phòng của khách sạn — không phải chồng lấn theo giờ trong ngày.
export function computeTypeAvailability(roomsOfType, bookings, day) {
  const dayEnd = addDays(day, 1);
  const occupied = new Set();
  bookings.forEach((b) => {
    roomsOfType.forEach((r) => {
      if (isRoomOccupied(b, r, day, dayEnd)) occupied.add(r.number);
    });
  });
  return { total: roomsOfType.length, available: roomsOfType.length - occupied.size };
}

export function computeBoardSummary(rooms, bookings, day) {
  const dayEnd = addDays(day, 1);
  const occupied = new Set();
  bookings.forEach((b) => {
    rooms.forEach((r) => {
      if (isRoomOccupied(b, r, day, dayEnd)) occupied.add(r.number);
    });
  });
  return { booked: occupied.size, available: rooms.length - occupied.size };
}

// Phòng trống cho MỘT khoảng ngày bất kỳ (nhận phòng → trả phòng), dùng cho
// màn hình Tạo đặt phòng — khác computeTypeAvailability (chỉ xét 1 đêm).
export function findAvailableRooms(roomsOfType, bookings, checkIn, checkOut) {
  return roomsOfType.filter(
    (r) => !bookings.some((b) => isRoomOccupied(b, r, checkIn, checkOut))
  );
}

function floorRooms(floor, typeKey, suffixes) {
  return suffixes.map((suffix) => ({ number: `${floor}${suffix}`, typeKey, floor }));
}

// 24 phòng / 4 tầng — đủ để minh hoạ 5 loại phòng và các chế độ nhóm, không
// cần khớp số lượng phòng thật của khách sạn tham chiếu (40+ phòng).
export const ROOMS = [
  ...floorRooms(1, "C_Std Dbl", ["01", "02", "03", "04", "05", "06"]),
  ...floorRooms(2, "STD DBL", ["01", "02", "03", "04", "05", "06"]),
  ...floorRooms(3, "C_Sup Dbl", ["01", "02", "03", "04", "05", "06"]),
  ...floorRooms(4, "DELUXE FAM", ["01", "02", "03", "04"]),
  ...floorRooms(4, "C_VIP", ["05", "06"]),
];

export const STATUS_META = {
  vacant: { key: "vacant", label: "Phòng trống", color: "var(--fd-success)", soft: "var(--fd-success-soft)" },
  booked_future: { key: "booked_future", label: "Đã đặt", color: "var(--fd-status-blue)", soft: "var(--fd-status-blue-soft)" },
  arriving_today: { key: "arriving_today", label: "Chưa đến", color: "var(--fd-status-purple)", soft: "var(--fd-status-purple-soft)" },
  in_house: { key: "in_house", label: "Có khách", color: "var(--fd-danger)", soft: "var(--fd-danger-soft)" },
  overdue: { key: "overdue", label: "Chưa đi", color: "var(--fd-warning)", soft: "var(--fd-warning-soft)" },
  checked_out: { key: "checked_out", label: "Đã trả", color: "var(--fd-status-pink)", soft: "var(--fd-status-pink-soft)" },
  maintenance: { key: "maintenance", label: "Sửa phòng", color: "var(--fd-status-gray)", soft: "var(--fd-status-gray-soft)" },
  dirty: { key: "dirty", label: "Phòng bẩn", color: "#f59e0b", soft: "#fff7df" },
};

export const STATUS_TAB_ORDER = ["booked_future", "arriving_today", "in_house", "overdue", "checked_out"];

// 2 tab riêng để lọc theo phòng (không phải theo đặt phòng) — xem mục
// computeRoomSnapshotsWithOverrides bên dưới.
export const ROOM_TAB_ORDER = ["dirty", "maintenance"];

// Thứ tự hiển thị các nhóm trạng thái trong tab "Đặt phòng" của chế độ lưới —
// Trống trước tiên (giống danh sách "Phòng trống (22)" ở phần mềm tham chiếu).
export const ROOM_STATUS_GROUP_ORDER = [
  "vacant",
  "booked_future",
  "arriving_today",
  "in_house",
  "overdue",
  "checked_out",
  "maintenance",
  "dirty",
];

export const FLOORS = [...new Set(ROOMS.map((r) => r.floor))].sort((a, b) => a - b);

// Trạng thái hiện tại của từng phòng tại 1 ngày cụ thể (để vẽ lưới trạng thái) —
// khác với Gantt (vẽ theo khoảng thời gian), lưới chỉ cần 1 "ảnh chụp" theo đêm.
export function computeRoomSnapshots(rooms, bookings, day) {
  const dayEnd = addDays(day, 1);
  return rooms.map((room) => {
    const booking = bookings.find(
      (b) => b.status !== "checked_out" && isRoomOccupied(b, room, day, dayEnd)
    );
    const hasCheckedOut = bookings.some(
      (b) => b.status === "checked_out" && isRoomOccupied(b, room, day, dayEnd)
    );
    return {
      room,
      status: booking?.status ?? "vacant",
      booking: booking ?? null,
      housekeeping: !booking && hasCheckedOut ? "dirty" : null,
    };
  });
}

// Áp override thủ công (bẩn/sạch/sửa, đặt qua icon/menu phòng) lên snapshot
// tính từ computeRoomSnapshots — dùng chung cho cả Gantt và Lưới để 2 chế
// độ xem luôn đồng nhất trạng thái phòng.
export function computeRoomSnapshotsWithOverrides(rooms, bookings, overrides, day) {
  return computeRoomSnapshots(rooms, bookings, day).map((snapshot) => {
    const override = overrides[snapshot.room.number];
    if (override === "dirty") return { ...snapshot, status: "vacant", housekeeping: "dirty", booking: null };
    if (override === "clean") return { ...snapshot, status: "vacant", housekeeping: "clean", booking: null };
    return override ? { ...snapshot, status: override, booking: null } : snapshot;
  });
}

export function computeRoomStatusCounts(rooms, bookings, overrides, day) {
  const snapshots = computeRoomSnapshotsWithOverrides(rooms, bookings, overrides, day);
  return {
    dirty: snapshots.filter((s) => s.housekeeping === "dirty").length,
    maintenance: snapshots.filter((s) => s.status === "maintenance").length,
  };
}

export const WEEKDAY_HEAD = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const GUEST_POOL = [
  "Phan Thành Nhân", "Vo Anh", "Nguyễn Tú", "Khánh Hà", "Nguyễn Thi Mười", "Võ Thị Ngọc",
  "Phan Đăng Thanh Hiền", "Danh Danh", "Ngọc Hà", "Nguyễn Thanh Bảo", "Cave Timothy Mark",
  "Nguyễn Thị Thanh Tâm", "Nguyễn Thúy Hà", "Nguyễn Tài Nhân", "Mai Hương", "Triều Dương Mai",
  "Sullivan Shane Richard", "Lê Văn Sĩ", "Thu Uyên Triệu", "Nguyễn Tuấn Khang", "Bảo Bão",
  "Minh Khuyên", "Ái Nghi", "Banjara Ekaraj", "Quỳnh Châu Lê",
];

const SOURCE_POOL = ["Traveloka", "Agoda", "Booking.com", "Call", "Walk-in", "ez_be"];

const SCENARIOS = [
  "checkout_then_arrival",
  "in_house_short",
  "in_house_long",
  "arriving_today",
  "booked_future",
  "vacant",
  "in_house_then_future",
  "overdue",
];

const MAINTENANCE_ROOM = "204";

function at(date, hh, mm = 0) {
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
}

// Danh sách đặt phòng minh hoạ, sinh có chu kỳ (không random) để demo luôn ổn
// định qua các lần tải trang — mỗi phòng lặp qua 8 kịch bản trạng thái khác
// nhau để cả 3 chế độ Ngày/Tuần/Tháng đều có dữ liệu phong phú để xem.
export function buildRoomMapBookings(today) {
  const bookings = [];
  let seq = 0;
  let guestIdx = 0;
  let sourceIdx = 0;

  function nextGuest() {
    const g = GUEST_POOL[guestIdx % GUEST_POOL.length];
    guestIdx += 1;
    return g;
  }
  function nextSource() {
    const s = SOURCE_POOL[sourceIdx % SOURCE_POOL.length];
    sourceIdx += 1;
    return s;
  }
  function push(room, status, checkIn, checkOut, guest, source) {
    seq += 1;
    const sourceGroup = ["Traveloka", "Agoda", "Booking.com"].includes(source) ? "OTA" : "Trực tiếp";
    const guestNo = guestIdx + seq;
    bookings.push({
      id: `RM-${seq}`,
      code: 45000 + seq,
      room,
      status,
      checkIn,
      checkOut,
      guest,
      source,
      sourceGroup,
      segment: guestNo % 2 ? "Công tác" : "Khách lẻ",
      gender: guestNo % 2 ? "Nam" : "Nữ",
      nationality: guestNo % 3 ? "VN" : "US",
    });
  }

  ROOMS.forEach((room, i) => {
    if (room.number === MAINTENANCE_ROOM) {
      push(room.number, "maintenance", at(today, 0, 0), at(addDays(today, 1), 12, 0), null, null);
      return;
    }

    switch (SCENARIOS[i % SCENARIOS.length]) {
      case "checkout_then_arrival":
        push(room.number, "checked_out", at(addDays(today, -2), 14, 0), at(today, 8 + (i % 3), 0), nextGuest(), nextSource());
        push(room.number, "arriving_today", at(today, 14, 0), at(addDays(today, 1 + (i % 3)), 12, 0), nextGuest(), nextSource());
        break;
      case "in_house_short":
        push(room.number, "in_house", at(addDays(today, -1 - (i % 3)), 13, 0), at(addDays(today, 1 + (i % 2)), 12, 0), nextGuest(), nextSource());
        break;
      case "in_house_long":
        push(room.number, "in_house", at(addDays(today, -3 - (i % 4)), 13, 0), at(addDays(today, 3 + (i % 3)), 12, 0), nextGuest(), nextSource());
        break;
      case "arriving_today":
        push(room.number, "arriving_today", at(today, 14, 0), at(addDays(today, 1 + (i % 4)), 12, 0), nextGuest(), nextSource());
        break;
      case "booked_future":
        push(room.number, "booked_future", at(addDays(today, 2 + (i % 4)), 14, 0), at(addDays(today, 4 + (i % 4)), 12, 0), nextGuest(), nextSource());
        break;
      case "in_house_then_future":
        push(room.number, "in_house", at(addDays(today, -1), 13, 0), at(addDays(today, 1), 12, 0), nextGuest(), nextSource());
        push(room.number, "booked_future", at(addDays(today, 3 + (i % 3)), 14, 0), at(addDays(today, 5 + (i % 3)), 12, 0), nextGuest(), nextSource());
        break;
      case "overdue":
        push(room.number, "overdue", at(addDays(today, -2), 13, 0), at(today, 12, 0), nextGuest(), nextSource());
        break;
      case "vacant":
      default:
        break;
    }
  });

  return bookings;
}

export function computeStatusCounts(bookings, onDate) {
  const counts = Object.fromEntries(STATUS_TAB_ORDER.map((key) => [key, 0]));
  bookings.forEach((b) => {
    if (b.checkIn < addDays(onDate, 1) && b.checkOut > onDate && counts[b.status] !== undefined) {
      counts[b.status] += 1;
    }
  });
  return counts;
}
