import { NIGHTLY_RATE } from "./frontDeskData";

// ---- "Sơ đồ phòng" > "Thông tin hiển thị": trường nào hiện trên booking card ----

export const GUEST_DISPLAY_OPTIONS = [
  { id: "nameOnly", label: "Chỉ hiển thị tên khách" },
  { id: "gender", label: "Kèm giới tính" },
  { id: "nationality", label: "Kèm quốc tịch" },
];

export const TIME_DISPLAY_OPTIONS = [
  { id: "checkInOut", label: "Ngày đến/đi" },
  { id: "duration", label: "Thời gian khách ở" },
];

export const PRICE_DISPLAY_OPTIONS = [
  { id: "firstNight", label: "Giá đêm đầu" },
  { id: "lastNight", label: "Giá đêm cuối" },
  { id: "total", label: "Tổng giá phòng" },
];

export const DEFAULT_CARD_FIELDS = {
  guestDisplay: "nationality",
  timeDisplay: "checkInOut",
  priceDisplay: "firstNight",
  showSourceGroup: true,
  showSegment: true,
};

// ---- "Sơ đồ phòng" > "Màu đặt phòng": màu theo từng trạng thái phòng ----
// Đây là bộ trạng thái riêng cho sơ đồ phòng dạng lưới (chưa được xây), khác
// với 3 tone arrival/departure/inhouse mà StatusBadge dùng cho bảng đặt phòng.

export const ROOM_STATUSES = [
  { id: "empty", label: "Phòng trống", defaultColor: "#22c55e" },
  { id: "booked", label: "Đã đặt", defaultColor: "#3b82f6" },
  { id: "notArrived", label: "Chưa đến", defaultColor: "#a855f7" },
  { id: "occupied", label: "Có khách", defaultColor: "#ef4444" },
  { id: "notDeparted", label: "Chưa đi", defaultColor: "#f97316" },
  { id: "maintenance", label: "Bảo trì", defaultColor: "#6b7280" },
  { id: "blocked", label: "Bán", defaultColor: "#111827" },
];

// ---- Booking mẫu dùng để render preview sống trong 2 panel trên ----

export const PREVIEW_BOOKING = {
  room: "305",
  roomType: "STD",
  guestName: "Anne Hathaway",
  segment: "Công tác",
  nationality: "VN",
  gender: "Nữ",
  checkIn: new Date(2026, 7, 15, 14, 0),
  checkOut: new Date(2026, 7, 16, 12, 0),
  nights: 1,
  price: { firstNight: NIGHTLY_RATE, lastNight: NIGHTLY_RATE, total: NIGHTLY_RATE * 2 },
};

// ---- "Phân loại booking" > "Nhóm nguồn" ----

export const SOURCE_GROUPS = [
  {
    id: "ota",
    label: "OTA",
    itemLabel: "OTA",
    description: "Kênh đặt phòng online qua các nền tảng",
  },
  {
    id: "corporate",
    label: "Corporate",
    itemLabel: "nguồn",
    description: "Khách công tác, khách đi công tác hoặc hợp đồng lưu trú với doanh nghiệp",
  },
  {
    id: "travelAgent",
    label: "Travel Agent / Tour",
    itemLabel: "nguồn",
    description: "Khách đến từ đại lý du lịch, công ty tour, tour lẻ hoặc tour đoàn",
  },
  {
    id: "direct",
    label: "Direct",
    itemLabel: "nguồn",
    description: "Khách đặt trực tiếp qua website, fanpage, hotline, Zalo hoặc walk-in",
  },
  {
    id: "longStay",
    label: "Long Stay / Resident",
    itemLabel: "nguồn",
    description: "Khách ở dài ngày, khách thuê theo tháng hoặc khách lưu trú như dân cư",
  },
  {
    id: "event",
    label: "Event / MICE",
    itemLabel: "nguồn",
    description: "Khách đi theo sự kiện, hội nghị, hội thảo, team building hoặc company trip",
  },
  {
    id: "collaborator",
    label: "Cộng tác viên",
    itemLabel: "nguồn",
    description: "Khách được giới thiệu bởi cá nhân/đối tác cộng tác bán phòng cho khách sạn",
  },
];

let sourceSeq = 0;
function builtinSource(group, name) {
  sourceSeq += 1;
  return {
    id: `src-${group}-${sourceSeq}`,
    group,
    name,
    locked: true, // mã/tên nguồn OTA có sẵn được cố định để đồng bộ filter booking
    description: "Công ty mặc định từ nguồn có sẵn",
    phone: "",
    email: "",
    fax: "",
    taxCode: "",
    representative: "",
    mobile: "",
    contactEmail: "",
    address: "",
    position: "",
  };
}

// Nhóm "OTA"/"Direct" seed đúng dữ liệu đã thấy trong mockup (Direct dùng lại
// đúng tên đang có trong bookingSources của frontDeskData.js). Các nhóm còn
// lại để trống thật — mockup không cho thấy dữ liệu của chúng nên không bịa.
export const SOURCES_BY_GROUP = {
  ota: [
    "Booking.com",
    "Agoda",
    "Expedia",
    "Hotels.com",
    "Priceline",
    "Travelocity",
    "Trip.com",
    "Airbnb",
    "HotelTonight",
    "Hostelworld",
    "Budgetplaces",
    "HomeToGo",
    "VRBO",
    "Traveloka",
    "Tiket.com",
    "Pegipegi",
  ].map((name) => builtinSource("ota", name)),
  corporate: [],
  travelAgent: [],
  direct: ["Walk-in", "Lễ Tân", "Website khách sạn"].map((name) => builtinSource("direct", name)),
  longStay: [],
  event: [],
  collaborator: [],
};

// ---- "Phân loại booking" > "Phân khúc khách hàng" ----

export const CUSTOMER_SEGMENTS = [
  { id: "seg-family", code: "FAM", name: "Gia đình", description: "Khách đi cùng gia đình, có thể có trẻ em" },
  { id: "seg-corporate", code: "CORP", name: "Công tác", description: "Khách đi công tác, thường lưu trú ngắn ngày" },
  { id: "seg-group", code: "GRP", name: "Nhóm", description: "Khách đi theo nhóm đông người" },
  { id: "seg-solo", code: "SOLO", name: "Solo", description: "Khách đi một mình" },
  { id: "seg-couple", code: "CPL", name: "Couple", description: "Khách đi theo cặp đôi" },
  { id: "seg-event", code: "EVT", name: "Sự kiện", description: "Khách tham dự sự kiện, hội nghị tại khách sạn" },
];
