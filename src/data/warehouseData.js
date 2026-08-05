// Mock data for the "Quản lý kho" (warehouse) screen — Nhập/Xuất/Chuyển/Kiểm kê/
// Tổng hợp tồn kho. No backend exists yet, so every list below stands in for a
// real inventory/purchasing service.

import { startOfDay, addDays } from "../utils/format";

const today = startOfDay(new Date());

export const DATE_PRESETS = [
  "Hôm nay",
  "Tuần này",
  "Tháng này",
  "Tháng trước",
  "Quý này",
  "Quý trước",
  "6 tháng trước",
  "Năm nay",
  "Năm trước",
];

export const STATUS_OPTIONS = ["Tất cả", "Đã xử lý", "Chưa xử lý"];

export const STOCK_OUT_DOC_TYPES = ["Xuất kho bán hàng", "Xuất hủy", "Xuất khác"];

// { id, name, unit } — unit "" matches items with no unit set in the reference.
export const MATERIALS = [
  { id: "coca-pepsi", name: "Coca/Pepsi", unit: "Lon" },
  { id: "nuoc-suoi-550", name: "Nước suối 550ml", unit: "Chai" },
  { id: "mi-ly", name: "Mì ly", unit: "Ly" },
  { id: "banh-khoai-tay-poca", name: "Bánh khoai tây Poca", unit: "Bịch" },
  { id: "bao-cao-su", name: "Bao cao su", unit: "Hộp 3 cái" },
  { id: "bai-ma-soi", name: "Bài Ma sói", unit: "1" },
  { id: "bai-uno", name: "Bài Uno", unit: "1" },
  { id: "ma-soi-bai-uno", name: "Ma sói, bài uno", unit: "" },
  { id: "dau-phong", name: "Đậu phộng", unit: "Gói" },
  { id: "nuoc-suoi-nho", name: "Nước suối nhỏ", unit: "" },
  { id: "sprite-7up", name: "Sprite/7Up", unit: "Lon" },
  { id: "tra-o-long", name: "Trà Ô Long", unit: "Chai" },
  { id: "bao-cao-su-durex", name: "Bao cao su Durex", unit: "Hộp 3 cái" },
  { id: "banh-cua", name: "Bánh Cua", unit: "Gói" },
  { id: "banh-mix", name: "Bánh Mix", unit: "Gói" },
  { id: "tra-fuze", name: "Trà Fuze", unit: "Chai" },
  { id: "sting-rockstar", name: "Sting/Rockstar", unit: "Lon" },
];

export const STOCK_IN_ROWS = [
  {
    id: "NK18420",
    ticketNo: "NK18420",
    date: addDays(today, -1),
    total: 4850000,
    note: "Nhập hàng nước giải khát đầu tuần",
    supplier: "Cocacola",
    docType: "Nhập kho mua hàng",
  },
  {
    id: "NK18391",
    ticketNo: "NK18391",
    date: addDays(today, -3),
    total: 1260000,
    note: "Nhập bổ sung mì ly, bánh snack",
    supplier: "",
    docType: "Nhập kho mua hàng",
  },
];

export const STOCK_OUT_ROWS = [
  {
    id: "XK19864",
    ticketNo: "XK19864",
    bookingCode: "46189",
    invoiceCode: "",
    total: 0,
    note: "Xuất kho từ lễ tân Phòng 208",
    target: "",
    docType: "Xuất kho bán hàng",
  },
  {
    id: "XK19863",
    ticketNo: "XK19863",
    bookingCode: "46203",
    invoiceCode: "",
    total: 0,
    note: "Xuất kho từ lễ tân Phòng 507",
    target: "",
    docType: "Xuất kho bán hàng",
  },
  {
    id: "XK19862",
    ticketNo: "XK19862",
    bookingCode: "46193",
    invoiceCode: "",
    total: 0,
    note: "Xuất kho từ lễ tân Phòng 105",
    target: "",
    docType: "Xuất kho bán hàng",
  },
];

export const STOCK_TRANSFER_ROWS = [
  {
    id: "CK20114",
    ticketNo: "CK20114",
    date: addDays(today, -1),
    carrier: "Nguyễn Văn Long",
    total: 620000,
    note: "Chuyển từ Kho khách sạn sang Tủ minibar",
  },
  {
    id: "CK20098",
    ticketNo: "CK20098",
    date: addDays(today, -2),
    carrier: "Trần Thị Hoa",
    total: 340000,
    note: "Chuyển từ Kho khách sạn sang Kho buồng",
  },
];

export const STOCK_CHECK_ROWS = [
  {
    id: "KK10552",
    ticketNo: "KK10552",
    date: addDays(today, -1),
    warehouse: "Kho khách sạn",
    note: "Kiểm kê định kỳ cuối tuần",
    status: "Đã xử lý",
  },
  {
    id: "KK10531",
    ticketNo: "KK10531",
    date: addDays(today, -4),
    warehouse: "Tủ minibar",
    note: "Kiểm kê phát hiện thiếu nước suối nhỏ",
    status: "Chưa xử lý",
  },
];

// Tồn đầu kỳ / nhập / xuất / tồn cuối kỳ per material — 17 rows total, first 10
// match the reference screenshot exactly.
export const STOCK_SUMMARY_ROWS = [
  { material: "Coca/Pepsi", unit: "Lon", opening: 48, imported: 0, exported: 0, closing: 48 },
  { material: "Nước suối 550ml", unit: "Chai", opening: 107, imported: 0, exported: 0, closing: 107 },
  { material: "Mì ly", unit: "Ly", opening: 6, imported: 0, exported: 0, closing: 6 },
  { material: "Bánh khoai tây Poca", unit: "Bịch", opening: 2, imported: 0, exported: 0, closing: 2 },
  { material: "Bao cao su", unit: "Hộp 3 cái", opening: 0, imported: 0, exported: 0, closing: 0 },
  { material: "Bài Ma sói", unit: "1", opening: 0, imported: 0, exported: 0, closing: 0 },
  { material: "Bài Uno", unit: "1", opening: 0, imported: 0, exported: 0, closing: 0 },
  { material: "Ma sói, bài uno", unit: "", opening: 0, imported: 0, exported: 0, closing: 0 },
  { material: "Đậu phộng", unit: "Gói", opening: 0, imported: 0, exported: 0, closing: 0 },
  { material: "Nước suối nhỏ", unit: "", opening: -195, imported: 0, exported: 8, closing: -203 },
  { material: "Sprite/7Up", unit: "Lon", opening: 12, imported: 0, exported: 0, closing: 12 },
  { material: "Trà Ô Long", unit: "Chai", opening: 20, imported: 0, exported: 2, closing: 18 },
  { material: "Bao cao su Durex", unit: "Hộp 3 cái", opening: 5, imported: 0, exported: 0, closing: 5 },
  { material: "Bánh Cua", unit: "Gói", opening: 9, imported: 0, exported: 1, closing: 8 },
  { material: "Bánh Mix", unit: "Gói", opening: 7, imported: 0, exported: 0, closing: 7 },
  { material: "Trà Fuze", unit: "Chai", opening: 14, imported: 0, exported: 0, closing: 14 },
  { material: "Sting/Rockstar", unit: "Lon", opening: 10, imported: 0, exported: 0, closing: 10 },
];
