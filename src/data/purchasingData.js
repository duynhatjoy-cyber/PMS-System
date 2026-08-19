// Mock data for "Mua hàng" (purchasing) — Báo hàng/Đặt hàng/Nhập hàng/Trả lại
// hàng mua/Trả nợ. No backend exists yet, so every list below stands in for a
// real purchasing service — same stand-in role as warehouseData.js.

import { startOfDay, addDays } from "../utils/format";

const today = startOfDay(new Date());

export const PURCHASE_STATUS_OPTIONS = ["Tất cả", "Chưa thực hiện", "Đang thực hiện", "Đã thực hiện"];

export const REPORT_ROWS = [
  {
    id: "BH50021",
    ticketNo: "BH50021",
    date: addDays(today, -1),
    status: "Chưa thực hiện",
    note: "Sắp hết nước suối 550ml, mì ly",
  },
  {
    id: "BH50008",
    ticketNo: "BH50008",
    date: addDays(today, -5),
    status: "Đã thực hiện",
    note: "Báo hàng bánh snack cho quầy minibar",
  },
];

export const ORDER_ROWS = [
  {
    id: "DH61134",
    ticketNo: "DH61134",
    date: addDays(today, -2),
    status: "Đang thực hiện",
    supplier: "Cocacola",
    expectedDate: addDays(today, 2),
    total: 3600000,
    note: "Đặt hàng nước giải khát định kỳ",
    lines: [
      { name: "Coca/Pepsi", unit: "Lon", qty: 200, price: 8000 },
      { name: "Sprite/7Up", unit: "Lon", qty: 100, price: 8000 },
      { name: "Nước suối 550ml", unit: "Chai", qty: 300, price: 4000 },
    ],
  },
  {
    id: "DH61098",
    ticketNo: "DH61098",
    date: addDays(today, -9),
    status: "Đã thực hiện",
    supplier: "Vissan",
    expectedDate: addDays(today, -6),
    total: 1450000,
    note: "Đặt bổ sung mì ly, bánh snack",
    lines: [
      { name: "Mì ly", unit: "Ly", qty: 150, price: 6500 },
      { name: "Bánh khoai tây Poca", unit: "Bịch", qty: 80, price: 5500 },
    ],
  },
];

export const RECEIPT_ROWS = [
  {
    id: "PN71042",
    ticketNo: "PN71042",
    date: addDays(today, -6),
    docRef: "HD0004821",
    supplier: "Vissan",
    orderRef: "DH61098",
    orderId: "DH61098",
    mismatch: false,
    total: 1450000,
    note: "Nhận đủ theo đơn đặt hàng",
    lines: [
      { name: "Mì ly", unit: "Ly", qty: 150, price: 6500, orderedQty: 150, orderedPrice: 6500 },
      {
        name: "Bánh khoai tây Poca",
        unit: "Bịch",
        qty: 80,
        price: 5500,
        orderedQty: 80,
        orderedPrice: 5500,
      },
    ],
  },
];

export const RETURN_ROWS = [
  {
    id: "PT30017",
    ticketNo: "PT30017",
    date: addDays(today, -4),
    docRef: "XK19855",
    supplier: "Cocacola",
    total: 320000,
    note: "Trả lại 40 lon Coca bị móp do vận chuyển",
  },
];
