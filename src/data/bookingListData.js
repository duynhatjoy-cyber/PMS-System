// Mock booking list data matching media_1794998616636_8c0e0b13.png
export const INITIAL_BOOKINGS = [
  {
    id: "bh-001",
    code: "BH-1111-001",
    guestName: "Nguyễn Văn Minh",
    phone: "0912 345 678",
    email: "minh.nguyen@example.com",
    source: "Agoda",
    roomType: "Deluxe",
    room: "P.201",
    checkIn: "01/11/2026",
    checkOut: "03/11/2026",
    nights: 2,
    status: "checked_in", // Đã nhận phòng
    totalAmount: 1800000,
    adults: 2,
    children: 0,
    notes: "Khách VIP, nhận phòng sớm 12h",
  },
  {
    id: "bh-002",
    code: "BH-1111-002",
    guestName: "Trần Thị Mai",
    phone: "0988 765 432",
    email: "mai.tran@example.com",
    source: "Booking.com",
    roomType: "Superior",
    room: "P.302",
    checkIn: "01/11/2026",
    checkOut: "02/11/2026",
    nights: 1,
    status: "pending", // Đang chờ
    totalAmount: 850000,
    adults: 1,
    children: 0,
    notes: "Chờ xác nhận đặt cọc thẻ",
  },
  {
    id: "bh-003",
    code: "BH-1111-003",
    guestName: "Lê Hoàng Anh",
    phone: "0934 112 233",
    email: "hoanganh.le@example.com",
    source: "Airbnb",
    roomType: "Deluxe",
    room: "P.205",
    checkIn: "02/11/2026",
    checkOut: "04/11/2026",
    nights: 2,
    status: "checked_in", // Đã nhận phòng
    totalAmount: 1950000,
    adults: 2,
    children: 1,
    notes: "Yêu cầu thêm nôi em bé",
  },
  {
    id: "bh-004",
    code: "BH-1111-004",
    guestName: "Phạm Thị Hương",
    phone: "0905 556 677",
    email: "huong.pham@example.com",
    source: "Booking.com",
    roomType: "Standard",
    room: "P.104",
    checkIn: "02/11/2026",
    checkOut: "03/11/2026",
    nights: 1,
    status: "reserved", // Đặt trước
    totalAmount: 700000,
    adults: 2,
    children: 0,
    notes: "",
  },
  {
    id: "bh-005",
    code: "BH-1111-005",
    guestName: "Vũ Đình Nam",
    phone: "0971 889 900",
    email: "nam.vu@example.com",
    source: "Agoda",
    roomType: "Superior",
    room: "P.305",
    checkIn: "03/11/2026",
    checkOut: "05/11/2026",
    nights: 2,
    status: "checked_in", // Đã nhận phòng
    totalAmount: 1700000,
    adults: 2,
    children: 0,
    notes: "Khách yêu cầu tầng cao không hút thuốc",
  },
  {
    id: "bh-006",
    code: "BH-1111-006",
    guestName: "Hoàng Thanh Tùng",
    phone: "0915 223 344",
    email: "tung.hoang@example.com",
    source: "Direct",
    roomType: "Deluxe",
    room: "P.208",
    checkIn: "03/11/2026",
    checkOut: "06/11/2026",
    nights: 3,
    status: "cancelled", // Đã hủy
    totalAmount: 2700000,
    adults: 2,
    children: 0,
    notes: "Khách bận lịch đột xuất, đã hoàn cọc 50%",
  },
  {
    id: "bh-007",
    code: "BH-1111-007",
    guestName: "Đặng Thùy Linh",
    phone: "0963 445 566",
    email: "linh.dang@example.com",
    source: "Travel Agent",
    roomType: "Suite",
    room: "P.401",
    checkIn: "04/11/2026",
    checkOut: "07/11/2026",
    nights: 3,
    status: "reserved", // Đặt trước
    totalAmount: 4500000,
    adults: 2,
    children: 2,
    notes: "Đoàn Vietravel, đón sân bay",
  },
  {
    id: "bh-008",
    code: "BH-1111-008",
    guestName: "Ngô Minh Khôi",
    phone: "0944 667 788",
    email: "khoi.ngo@example.com",
    source: "Direct",
    roomType: "Superior",
    room: "P.308",
    checkIn: "04/11/2026",
    checkOut: "05/11/2026",
    nights: 1,
    status: "checked_in", // Đã nhận phòng
    totalAmount: 850000,
    adults: 1,
    children: 0,
    notes: "Khách quen",
  },
  {
    id: "bh-009",
    code: "BH-1111-009",
    guestName: "Bùi Thị Lan",
    phone: "0922 889 911",
    email: "lan.bui@example.com",
    source: "MICE",
    roomType: "Suite",
    room: "P.402",
    checkIn: "05/11/2026",
    checkOut: "08/11/2026",
    nights: 3,
    status: "pending", // Đang chờ
    totalAmount: 4800000,
    adults: 2,
    children: 0,
    notes: "Hội nghị công nghệ VinFast",
  },
  {
    id: "bh-010",
    code: "BH-1111-010",
    guestName: "Lý Văn Hùng",
    phone: "0981 334 455",
    email: "hung.ly@example.com",
    source: "Agoda",
    roomType: "Deluxe",
    room: "P.203",
    checkIn: "05/11/2026",
    checkOut: "06/11/2026",
    nights: 1,
    status: "checked_in", // Đã nhận phòng
    totalAmount: 950000,
    adults: 2,
    children: 0,
    notes: "",
  },
];

// Helper để tạo thêm dữ liệu đạt tổng 124 đặt phòng đúng như ảnh "tổng 124 đặt phòng"
const SAMPLE_GUESTS = [
  "Đỗ Minh Trí", "Phan Thanh Hà", "Trương Quốc Bảo", "Hồ Ngọc Mai",
  "Dương Gia Huy", "Võ Thị Bích", "Lương Tuấn Kiệt", "Bạch Yến Nhi",
  "Trịnh Văn Quyết", "Tô Hoài Nam", "Đào Thị Loan", "Cao Minh Quang",
  "Tạ Đình Phong", "Phùng Khánh Linh", "Mai Quốc Việt", "Chu Kim Anh",
  "Hà Thùy Dung", "Lê Văn Hậu", "Nguyễn Thu Thảo", "Vương Hải Đăng",
  "Tạ Quang Huy", "Phạm Bích Ngọc", "Trần Đình Trọng", "Đặng Văn Lâm"
];

const SOURCES = ["Agoda", "Booking.com", "Airbnb", "Direct", "Travel Agent", "MICE"];
const ROOM_TYPES = ["Deluxe", "Superior", "Standard", "Suite"];
const STATUSES = ["checked_in", "pending", "reserved", "cancelled"];

export function generateAllBookings() {
  const result = [...INITIAL_BOOKINGS];
  for (let i = 11; i <= 124; i++) {
    const numStr = String(i).padStart(3, "0");
    const guest = SAMPLE_GUESTS[(i - 11) % SAMPLE_GUESTS.length];
    const source = SOURCES[(i * 3 + 1) % SOURCES.length];
    const roomType = ROOM_TYPES[(i * 2) % ROOM_TYPES.length];
    const status = STATUSES[(i * 5) % STATUSES.length];
    const day = ((i % 28) + 1).toString().padStart(2, "0");
    const nights = (i % 4) + 1;
    const outDay = (Math.min(28, (i % 28) + 1 + nights)).toString().padStart(2, "0");

    result.push({
      id: `bh-${numStr}`,
      code: `BH-1111-${numStr}`,
      guestName: guest,
      phone: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
      email: `${guest.toLowerCase().replace(/[^a-z]/g, "")}${i}@example.com`,
      source,
      roomType,
      room: `P.${100 + (i % 30)}`,
      checkIn: `${day}/11/2026`,
      checkOut: `${outDay}/11/2026`,
      nights,
      status,
      totalAmount: nights * 850000,
      adults: (i % 2) + 1,
      children: i % 3 === 0 ? 1 : 0,
      notes: i % 5 === 0 ? "Yêu cầu check-in sớm" : "",
    });
  }
  return result;
}
