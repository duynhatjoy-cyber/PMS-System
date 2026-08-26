// Mock data for "Mua hàng" (purchasing) — Báo hàng/Đặt hàng/Nhập hàng/Trả lại
// hàng mua/Trả nợ. No backend exists yet, so every list below stands in for a
// real purchasing service — same stand-in role as warehouseData.js.

import { startOfDay, addDays } from "../utils/format";

const today = startOfDay(new Date());

export const PURCHASE_STATUS_OPTIONS = ["Tất cả", "Chưa thực hiện", "Đang thực hiện", "Đã thực hiện"];

export const REPORT_ROWS = [
  {
    id: "BH50029",
    ticketNo: "BH50029",
    date: today,
    status: "Đang thực hiện",
    reporter: "Nguyen Thang",
    address: "Minibar tầng 3",
    reference: "",
    note: "Sắp hết bao cao su, đậu phộng cho minibar",
    lines: [
      { name: "Bao cao su", unit: "Hộp 3 cái", neededQty: 20, stockQty: 0, requestedQty: 20 },
      { name: "Đậu phộng", unit: "Gói", neededQty: 15, stockQty: 0, requestedQty: 15 },
    ],
  },
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
  {
    id: "BH49995",
    ticketNo: "BH49995",
    date: addDays(today, -12),
    status: "Đã thực hiện",
    note: "Báo hết nước suối nhỏ, trà Ô Long",
  },
];

export const ORDER_ROWS = [
  {
    id: "DH61150",
    ticketNo: "DH61150",
    date: addDays(today, -1),
    status: "Chưa thực hiện",
    supplier: "La Vie",
    expectedDate: addDays(today, 3),
    total: 2000000,
    note: "Đặt nước suối 550ml bổ sung cho buồng",
    lines: [{ name: "Nước suối 550ml", unit: "Chai", qty: 500, price: 4000 }],
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
  {
    id: "DH61134",
    ticketNo: "DH61134",
    date: addDays(today, -10),
    status: "Đã thực hiện",
    supplier: "Cocacola",
    expectedDate: addDays(today, -8),
    total: 3600000,
    note: "Đặt hàng nước giải khát định kỳ",
    lines: [
      { name: "Coca/Pepsi", unit: "Lon", qty: 200, price: 8000 },
      { name: "Sprite/7Up", unit: "Lon", qty: 100, price: 8000 },
      { name: "Nước suối 550ml", unit: "Chai", qty: 300, price: 4000 },
    ],
  },
  {
    id: "DH61050",
    ticketNo: "DH61050",
    date: addDays(today, -14),
    status: "Đã thực hiện",
    supplier: "Kinh Đô",
    expectedDate: addDays(today, -11),
    total: 840000,
    note: "Đặt bánh kẹo cho minibar",
    lines: [
      { name: "Bánh Cua", unit: "Gói", qty: 60, price: 7000 },
      { name: "Bánh Mix", unit: "Gói", qty: 60, price: 7000 },
    ],
  },
];

export const RECEIPT_ROWS = [
  {
    id: "PN71042",
    ticketNo: "PN71042",
    date: addDays(today, -6),
    reference: "HD0004821",
    supplier: "Vissan",
    deliveryPerson: "Nguyen Thang",
    paymentMethod: "Ghi nợ NCC",
    inspectionStatus: "Đã kiểm kê hàng hóa",
    orderRef: "DH61098",
    orderId: "DH61098",
    mismatch: false,
    total: 1450000,
    note: "Nhận đủ theo đơn đặt hàng",
    lines: [
      { name: "Mì ly", unit: "Ly", warehouse: "Kho khách sạn", qty: 150, price: 6500, orderedQty: 150, orderedPrice: 6500 },
      {
        name: "Bánh khoai tây Poca",
        unit: "Bịch",
        warehouse: "Kho khách sạn",
        qty: 80,
        price: 5500,
        orderedQty: 80,
        orderedPrice: 5500,
      },
    ],
  },
  {
    id: "PN71080",
    ticketNo: "PN71080",
    date: addDays(today, -8),
    reference: "HD0005102",
    supplier: "Cocacola",
    deliveryPerson: "Nguyen Thang",
    paymentMethod: "Ghi nợ NCC",
    inspectionStatus: "Đã kiểm kê hàng hóa",
    orderRef: "DH61134",
    orderId: "DH61134",
    mismatch: true,
    total: 3440000,
    note: "Thiếu 20 lon Sprite so với đơn đặt",
    lines: [
      { name: "Coca/Pepsi", unit: "Lon", warehouse: "Kho khách sạn", qty: 200, price: 8000, orderedQty: 200, orderedPrice: 8000 },
      { name: "Sprite/7Up", unit: "Lon", warehouse: "Kho khách sạn", qty: 80, price: 8000, orderedQty: 100, orderedPrice: 8000 },
      { name: "Nước suối 550ml", unit: "Chai", warehouse: "Kho khách sạn", qty: 300, price: 4000, orderedQty: 300, orderedPrice: 4000 },
    ],
  },
  {
    id: "PN70988",
    ticketNo: "PN70988",
    date: addDays(today, -13),
    reference: "HD0004598",
    supplier: "Kinh Đô",
    deliveryPerson: "Nguyen Thang",
    paymentMethod: "Ghi nợ NCC",
    inspectionStatus: "Đã kiểm kê hàng hóa",
    orderRef: "DH61050",
    orderId: "DH61050",
    mismatch: false,
    total: 840000,
    note: "Nhận đủ theo đơn đặt hàng",
    lines: [
      { name: "Bánh Cua", unit: "Gói", warehouse: "Kho khách sạn", qty: 60, price: 7000, orderedQty: 60, orderedPrice: 7000 },
      { name: "Bánh Mix", unit: "Gói", warehouse: "Kho khách sạn", qty: 60, price: 7000, orderedQty: 60, orderedPrice: 7000 },
    ],
  },
  {
    id: "PN71005",
    ticketNo: "PN71005",
    date: addDays(today, -20),
    reference: "HD0004650",
    supplier: "La Vie",
    deliveryPerson: "Nguyen Thang",
    paymentMethod: "Thanh toán ngay",
    inspectionStatus: "Chưa kiểm kê hàng hóa",
    orderRef: "",
    orderId: null,
    mismatch: false,
    total: 1520000,
    note: "Nhập trực tiếp nước suối đóng chai, thanh toán ngay khi nhận hàng",
    lines: [{ name: "Nước suối 550ml", unit: "Chai", warehouse: "Kho khách sạn", qty: 400, price: 3800 }],
  },
];

export const RETURN_ROWS = [
  {
    id: "PT30040",
    ticketNo: "PT30040",
    date: addDays(today, -1),
    reference: "XK19901",
    supplier: "Vissan",
    receiver: "Nguyen Thang",
    paymentMethod: "Nhận lại tiền",
    total: 130000,
    note: "Trả lại mì ly hết hạn sử dụng",
    lines: [{ name: "Mì ly", unit: "Ly", warehouse: "Kho khách sạn", qty: 20, price: 6500 }],
  },
  {
    id: "PT30017",
    ticketNo: "PT30017",
    date: addDays(today, -4),
    reference: "XK19855",
    supplier: "Cocacola",
    receiver: "Nguyen Thang",
    paymentMethod: "Giảm trừ công nợ",
    total: 320000,
    note: "Trả lại 40 lon Coca bị móp do vận chuyển",
    lines: [{ name: "Coca/Pepsi", unit: "Lon", warehouse: "Kho khách sạn", qty: 40, price: 8000 }],
  },
  {
    id: "PT29988",
    ticketNo: "PT29988",
    date: addDays(today, -9),
    reference: "XK19700",
    supplier: "Kinh Đô",
    receiver: "Nguyen Thang",
    paymentMethod: "Giảm trừ công nợ",
    total: 105000,
    note: "Trả lại bánh Cua bị ẩm mốc",
    lines: [{ name: "Bánh Cua", unit: "Gói", warehouse: "Kho khách sạn", qty: 15, price: 7000 }],
  },
];

// Phiếu thanh toán cho nhà cung cấp — cùng với Nhập hàng (làm phát sinh công
// nợ) và Trả lại hàng mua theo "Giảm trừ công nợ" (làm giảm công nợ), 3 nguồn
// này ghép lại thành lịch sử giao dịch/công nợ đầy đủ cho từng NCC (xem
// supplierDebt.js) thay vì 1 số dư tĩnh không truy được nguồn gốc.
export const PAYMENT_ROWS = [
  {
    id: "TT80231",
    ticketNo: "TT80231",
    date: addDays(today, -2),
    supplier: "Cocacola",
    amount: 1500000,
    method: "Chuyển khoản",
    note: "Thanh toán một phần công nợ tháng 8",
  },
  {
    id: "TT80177",
    ticketNo: "TT80177",
    date: addDays(today, -5),
    supplier: "Vissan",
    amount: 550000,
    method: "Tiền mặt",
    note: "Thanh toán công nợ đơn DH61098",
  },
  {
    id: "TT80090",
    ticketNo: "TT80090",
    date: addDays(today, -7),
    supplier: "Kinh Đô",
    amount: 735000,
    method: "Chuyển khoản",
    note: "Thanh toán công nợ đơn DH61050 (sau khi trừ hàng trả lại)",
  },
];
