import { createIdSequence } from "../utils/id";

const nextId = createIdSequence();
export const nextDraftId = nextId;

// =========================
// Hồ sơ khách sạn
// =========================

export const FACILITY_TYPES = ["Khách sạn", "Homestay", "Resort", "Căn hộ dịch vụ", "Nhà nghỉ"];
export const OPERATION_MODELS = ["Độc lập", "Chuỗi / Nhượng quyền", "Quản lý bởi bên thứ ba"];
export const TIMEZONES = ["Asia/Ho_Chi_Minh (UTC+7)", "Asia/Bangkok (UTC+7)", "Asia/Singapore (UTC+8)"];
export const LANGUAGES = ["Tiếng Việt", "English"];

export const INITIAL_HOTEL_PROFILE = {
  name: "Lifrooms Boutique Hotel",
  phone: "02543524868",
  email: "hotel@lifrooms.com",
  website: "https://lifrooms.com",
  address: "12 Đường Bãi Sau, Phường Thắng Tam, TP. Vũng Tàu",
  country: "Vietnam",
  province: "Bà Rịa - Vũng Tàu",
  businessType: "Khách sạn lưu trú",
  logo: "",
  ownerName: "Nguyễn Văn An",
  ownerEmail: "quanly@lifrooms.com",
  ownerPhone: "0901234567",
};

// =========================
// Kênh liên lạc
// =========================

// Zalo OA dùng luồng đăng nhập OAuth (không có ID/Token nhập tay); các kênh
// còn lại dùng API key thủ công của bên thứ ba — đúng thực tế từng nền tảng.
export const CONTACT_CHANNELS_META = [
  { key: "zalo", label: "Zalo OA", connectOnly: true },
  { key: "messenger", label: "Facebook Messenger" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "telegram", label: "Telegram" },
];

export const INITIAL_CONTACT_CHANNELS = {
  zalo: { connected: false },
  messenger: { connected: true, id: "lifrooms.hotel@page.example.com", token: "EAAG1234567890abcdef" },
  whatsapp: { connected: false, id: "", token: "" },
  telegram: { connected: false, id: "", token: "" },
};

// =========================
// Widget
// =========================

export const INITIAL_WIDGET = {
  url: "https://widget.bellhop.biz/lifrooms-boutique",
  brandColor: "#a8631f",
  welcomeMessage: "Xin chào! Tôi có thể giúp gì cho bạn?",
};

// =========================
// Cấu hình AI
// =========================

export const INITIAL_AI_CONFIG = {
  confidenceThreshold: 60,
  escalationKeywords: ["hoàn tiền", "khiếu nại", "gặp quản lý"],
};

// =========================
// Gói dịch vụ
// =========================

export const CURRENT_PLAN = {
  name: "Starter",
  badge: "Dùng thử",
  usage: {
    conversations: { label: "Hội thoại", used: 128, limit: 500 },
    knowledgeEntries: { label: "Mục kiến thức đang hoạt động", used: 12, limit: 50 },
  },
};

// =========================
// Cài đặt PMS — Tỷ giá / Giờ check-in-out / Máy in
// =========================

export const FX_CURRENCIES = ["USD", "CNY", "KRW", "JPY", "RUB"];

export const INITIAL_FX_RATES = Object.fromEntries(FX_CURRENCIES.map((c) => [c, ""]));

export const CHECKIN_WINDOW_TYPES = [
  { key: "day", label: "Khách ngày" },
  { key: "night", label: "Khách đêm" },
  { key: "hourly", label: "Khách giờ" },
];

export const INITIAL_CHECKIN_WINDOWS = {
  day: { checkIn: "14:00", checkOut: "12:00" },
  night: { checkIn: "22:00", checkOut: "08:00" },
  hourly: { checkIn: "", checkOut: "" },
};

export const PRINT_TEMPLATE_TYPES = [
  { key: "checkinConfirm", label: "Xác nhận check-in" },
  { key: "folioReceipt", label: "Biên lai folio" },
  { key: "invoice", label: "Hoá đơn" },
  { key: "bookingConfirm", label: "Xác nhận đặt phòng" },
];

export const PAPER_SIZES = ["A4", "A5", "80mm", "58mm"];

export function buildInitialPrintTemplates() {
  return Object.fromEntries(
    PRINT_TEMPLATE_TYPES.map((t) => [t.key, { paperSize: "A4", taxCode: "", title: "", address: "" }])
  );
}

// =========================
// Nhân viên
// =========================

// Vai trò khớp với các module thật của app (Buồng phòng, Kinh doanh...) thay
// vì tên enum kỹ thuật (operator_manager, hotel_owner...) — dễ hiểu hơn cho
// chủ khách sạn ít rành công nghệ.
export const STAFF_ROLES = [
  { key: "manager", label: "Quản lý" },
  { key: "receptionist", label: "Lễ tân" },
  { key: "accountant", label: "Kế toán" },
  { key: "housekeeping", label: "Buồng phòng" },
  { key: "sales", label: "Kinh doanh" },
  { key: "staff", label: "Nhân viên" },
];

function makeStaff(name, email, roleKey, active = true) {
  return { id: nextId("staff"), name, email, roleKey, active };
}

// "Nguyễn Thị Lan" khớp nhân viên buồng phòng đã có trong dữ liệu mẫu của
// trang Buồng phòng — cùng một người, hai vai trò (dọn phòng + tài khoản hệ thống).
export const INITIAL_STAFF = [
  makeStaff("Nguyễn Văn An", "quanly@lifrooms.com", "manager"),
  makeStaff("Trần Thị Bích", "letan@lifrooms.com", "receptionist"),
  makeStaff("Lê Văn Cường", "ketoan@lifrooms.com", "accountant"),
  makeStaff("Nguyễn Thị Lan", "buongphong@lifrooms.com", "housekeeping"),
  makeStaff("Phạm Thị Dung", "kinhdoanh@lifrooms.com", "sales", false),
];

// =========================
// Thông báo
// =========================

export const NOTIFICATION_FREQUENCIES = ["Mỗi cảnh báo (tức thì)", "Tổng hợp mỗi giờ", "Tổng hợp hằng ngày"];

export const INITIAL_NOTIFICATIONS = {
  telegramChatId: "",
  email: "",
  frequency: NOTIFICATION_FREQUENCIES[0],
};

// =========================
// Kết nối kênh (CMS)
// =========================

export const CMS_PROVIDERS = ["Channex"];

function minutesAgo(n) {
  return new Date(Date.now() - n * 60000);
}

function makeCmsConnection(provider, connectionId, syncedMinutesAgo) {
  return { id: nextId("cms"), provider, connectionId, lastSync: minutesAgo(syncedMinutesAgo) };
}

export const INITIAL_CMS_CONNECTIONS = [makeCmsConnection("Channex", "b41a7e9c-2d6f-4a11-9c3e-7f0a5d8e6b12", 24)];
