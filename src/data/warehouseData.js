// Mock data for the "Quản lý kho" (warehouse) screen — Nhập/Xuất/Chuyển/Kiểm kê/
// Tổng hợp tồn kho. No backend exists yet, so every list below stands in for a
// real inventory/purchasing service.

import { startOfDay, addDays } from "../utils/format";
import { MATERIAL_RECORDS } from "./warehouseConfigData";

const today = startOfDay(new Date());

function materialLine(name, warehouse, qty, price) {
  return { materialId: MATERIAL_RECORDS.find((m) => m.name === name).id, warehouse, qty, price };
}

function transferLine(name, from, to, qty, price) {
  return { materialId: MATERIAL_RECORDS.find((m) => m.name === name).id, from, to, qty, price };
}

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

// Danh mục nguyên vật liệu nay được quản lý ở Cấu hình > Quản lý kho
// (xem MATERIAL_RECORDS trong data/warehouseConfigData.js + useActiveMaterials()).

export const STOCK_IN_ROWS = [
  {
    id: "NK18420",
    ticketNo: "NK18420",
    date: addDays(today, -1),
    total: 4850000,
    note: "Nhập hàng nước giải khát đầu tuần",
    supplier: "Cocacola",
    docType: "Nhập kho mua hàng",
    lines: [
      materialLine("Coca/Pepsi", "Kho khách sạn", 200, 9500),
      materialLine("Sprite/7Up", "Kho khách sạn", 150, 9500),
    ],
  },
  {
    id: "NK18391",
    ticketNo: "NK18391",
    date: addDays(today, -3),
    total: 1260000,
    note: "Nhập bổ sung mì ly, bánh snack",
    supplier: "",
    docType: "Nhập kho mua hàng",
    lines: [
      materialLine("Mì ly", "Kho khách sạn", 24, 15000),
      materialLine("Bánh khoai tây Poca", "Kho khách sạn", 10, 25000),
    ],
  },
];

export const STOCK_OUT_ROWS = [
  {
    id: "XK19864",
    ticketNo: "XK19864",
    bookingCode: "46189",
    invoiceCode: "2563",
    total: 20000,
    note: "Xuất kho từ lễ tân Phòng 208",
    target: "",
    docType: "Xuất kho bán hàng",
    date: today,
    lines: [materialLine("Nước suối nhỏ", "Tủ minibar", 2, 10000)],
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
    date: today,
    lines: [materialLine("Bao cao su", "Tủ minibar", 1, 0)],
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
    date: today,
    lines: [materialLine("Nước suối nhỏ", "Tủ minibar", 1, 0)],
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
    lines: [
      transferLine("Coca/Pepsi", "Kho khách sạn", "Tủ minibar", 40, 9500),
      transferLine("Nước suối nhỏ", "Kho khách sạn", "Tủ minibar", 30, 6000),
    ],
  },
  {
    id: "CK20098",
    ticketNo: "CK20098",
    date: addDays(today, -2),
    carrier: "Trần Thị Hoa",
    total: 340000,
    note: "Chuyển từ Kho khách sạn sang Kho buồng",
    lines: [transferLine("Bánh khoai tây Poca", "Kho khách sạn", "Kho buồng", 12, 25000)],
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
