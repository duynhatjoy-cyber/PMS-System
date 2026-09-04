import { NIGHTLY_RATE, bookingSources } from "../../../data/frontDeskData";
import { INITIAL_HOTEL_PROFILE } from "../../../data/settingsData";

// Trạng thái đặt phòng cho báo cáo doanh thu — tone khớp với StatusBadge của
// FrontDesk (arrival/departure/inhouse) để tái dùng nguyên component đó.
export const STATUS_OPTIONS = [
  { key: "arrival", label: "Đã đặt", tone: "arrival" },
  { key: "inhouse", label: "Nhận phòng", tone: "inhouse" },
  { key: "checkedout", label: "Trả phòng", tone: "departure" },
];

export const SOURCE_OPTIONS = bookingSources;
export const MARKET_OPTIONS = ["Nội địa", "Quốc tế"];
export const PHAN_HE = "LỄ TÂN";

export const GROUP_BY_OPTIONS = [
  { key: "phanHe", label: "Phân hệ" },
  { key: "company", label: "Công ty" },
  { key: "source", label: "Nguồn" },
  { key: "market", label: "Thị trường" },
];

const MARKET_BY_SOURCE = {
  "Walk-in": "Nội địa",
  "Lễ Tân": "Nội địa",
  OTA: "Quốc tế",
  Traveloka: "Quốc tế",
  "Booking.com": "Quốc tế",
};

const IS_OTA_SOURCE = new Set(["OTA", "Traveloka", "Booking.com"]);
const COMMISSION_RATE = 0.15;

function otaCodeFor(bookingCode) {
  return String(6_000_000_000 + bookingCode * 137);
}

function idNumberFor(bookingCode) {
  return `${String(bookingCode).padStart(6, "0")}${String((bookingCode * 13) % 999_999).padStart(6, "0")}`;
}

function phoneFor(bookingCode) {
  return `09${String(10_000_000 + bookingCode).slice(-8)}`;
}

// Ghép thêm số liệu tài chính lên đúng danh sách booking dùng chung
// (FrontDesk/BookingList/RoomMap đều đọc từ BookingsContext) — không tạo
// dataset riêng, để báo cáo không lệch số với các trang khác.
export function buildRevenueDetailRows(bookings) {
  return bookings.map((booking, index) => {
    const nights = Math.max(1, Math.round((booking.checkOut - booking.checkIn) / 86_400_000));
    const roomAmount = nights * NIGHTLY_RATE;
    const serviceAmount = (booking.services || []).reduce((sum, s) => sum + s.price * s.qty, 0);
    const discount = booking.bookingCode % 5 === 0 ? Math.round((roomAmount * 0.1) / 1000) * 1000 : 0;
    const totalRevenue = roomAmount + serviceAmount - discount;

    const isOta = IS_OTA_SOURCE.has(booking.source);
    const commission = isOta ? Math.round((roomAmount * COMMISSION_RATE) / 1000) * 1000 : 0;

    const records = booking.paymentRecords || [];
    const paidAmount = records.reduce((sum, p) => sum + p.amount, 0);
    const cash = records.filter((p) => p.method === "Tiền mặt").reduce((s, p) => s + p.amount, 0);
    const card = records.filter((p) => p.method === "Thẻ / Quẹt máy POS").reduce((s, p) => s + p.amount, 0);
    const transfer = records.filter((p) => p.method === "Chuyển khoản").reduce((s, p) => s + p.amount, 0);
    const outstanding = Math.max(0, totalRevenue - paidAmount);

    const status = STATUS_OPTIONS.find((s) => s.key === booking.stage) ?? STATUS_OPTIONS[0];
    const otaCode = isOta ? otaCodeFor(booking.bookingCode) : "";

    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      roomType: booking.roomType,
      room: booking.room || "—",
      guestName: booking.guest.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights,
      roomAmount,
      serviceAmount,
      discount,
      totalRevenue,
      priorDebt: 0,
      cash,
      card,
      transfer,
      // Chưa thu (paymentRecords rỗng) coi như công nợ khách còn giữ —
      // dữ liệu mock hiện chỉ có method "Tiền mặt" nên Thẻ/CK luôn 0đ,
      // đúng với thực tế của BookingsContext dùng chung.
      debt: outstanding,
      outstanding,
      avgRate: Math.round(roomAmount / nights),
      status,
      source: booking.source,
      company: INITIAL_HOTEL_PROFILE.name,
      market: MARKET_BY_SOURCE[booking.source] || "Nội địa",
      createdBy: booking.createdBy,
      otaCode,
      cmsCode: isOta ? `${otaCode}_BE0C41` : "",
      invoiceNo: 52000 + index,
      idNumber: isOta ? "" : idNumberFor(booking.bookingCode),
      phone: isOta ? "" : phoneFor(booking.bookingCode),
      email: "",
      netBeforeCommission: roomAmount - commission,
      commission,
      grossWithCommission: roomAmount,
      phanHe: PHAN_HE,
    };
  });
}

const GROUP_KEY_FNS = {
  phanHe: (r) => r.phanHe,
  company: (r) => r.company,
  source: (r) => r.source,
  market: (r) => r.market,
};

export function groupRows(rows, groupBy) {
  const keyFn = GROUP_KEY_FNS[groupBy] || GROUP_KEY_FNS.phanHe;
  const map = new Map();
  rows.forEach((row) => {
    const key = keyFn(row) || "—";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  });
  return [...map.entries()].map(([key, groupedRows]) => ({ key, rows: groupedRows }));
}

const SUM_FIELDS = [
  "roomAmount",
  "serviceAmount",
  "discount",
  "totalRevenue",
  "priorDebt",
  "cash",
  "card",
  "transfer",
  "debt",
  "outstanding",
  "nights",
  "commission",
  "netBeforeCommission",
  "grossWithCommission",
];

export function sumRows(rows) {
  return Object.fromEntries(SUM_FIELDS.map((field) => [field, rows.reduce((s, r) => s + r[field], 0)]));
}
