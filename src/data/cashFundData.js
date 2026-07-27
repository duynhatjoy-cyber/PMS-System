// Mock data for the "Thu chi > Quỹ tiền mặt" (cash fund) screen. No backend
// exists yet, so these lists stand in for a real cash-receipt/payment ledger.

export const CASH_VOUCHER_TYPES = ["Tất cả", "Phiếu thu tiền", "Phiếu chi tiền"];

export const OPENING_CASH_BALANCE = 4932012;

// hh/mm/ss are combined with "today" at render time, matching how the
// Warehouse mock data anchors its rows to the current day.
export const CASH_VOUCHER_ROWS = [
  {
    id: "PTM58168",
    ticketNo: "PTM58168",
    hh: 5,
    mm: 27,
    ss: 15,
    amount: 490000,
    reason: "Thiếu Hoài Thương nhận khoản thanh toán VND 490,000 (Tiền mặt) cho Phòng 301",
    type: "thu",
    creator: "Thiếu Hoài Thương",
  },
  {
    id: "PTM58178",
    ticketNo: "PTM58178",
    hh: 15,
    mm: 3,
    ss: 57,
    amount: 150000,
    reason: "Thiếu Hoài Thương nhận khoản thanh toán VND 150,000 (Tiền mặt) cho Phòng 208",
    type: "thu",
    creator: "Thiếu Hoài Thương",
  },
  {
    id: "PTM58180",
    ticketNo: "PTM58180",
    hh: 15,
    mm: 38,
    ss: 43,
    amount: 1784243,
    reason: "Thiếu Hoài Thương nhận khoản thanh toán VND 1,784,243 (Tiền mặt) cho Phòng 102",
    type: "thu",
    creator: "Thiếu Hoài Thương",
  },
  {
    id: "PTM58183",
    ticketNo: "PTM58183",
    hh: 16,
    mm: 55,
    ss: 23,
    amount: 1500000,
    reason: "Thiếu Hoài Thương nhận khoản thanh toán VND 1,500,000 (Tiền mặt) cho Phòng 301",
    type: "thu",
    creator: "Thiếu Hoài Thương",
  },
];

export const CASH_DENOMINATIONS = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];

export function computeCashBalance() {
  const totalThu = CASH_VOUCHER_ROWS.filter((r) => r.type === "thu").reduce((sum, r) => sum + r.amount, 0);
  const totalChi = CASH_VOUCHER_ROWS.filter((r) => r.type === "chi").reduce((sum, r) => sum + r.amount, 0);
  return OPENING_CASH_BALANCE + totalThu - totalChi;
}

export const CASH_CHECK_ROWS = [
  {
    id: "KK2",
    ticketNo: "KK2",
    checkDate: "31/07/2024",
    checkTime: "15:06:09",
    dueDate: "31/07/2024",
    purpose: "",
    voided: true,
  },
  {
    id: "KK1",
    ticketNo: "KK1",
    checkDate: "31/07/2024",
    checkTime: "14:51:39",
    dueDate: "31/07/2024",
    purpose: "",
    voided: true,
  },
];
