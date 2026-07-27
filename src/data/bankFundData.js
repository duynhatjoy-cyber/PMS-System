// Mock data for the "Thu chi > Quỹ tiền gửi" (bank fund) screen. No backend
// exists yet — mirrors cashFundData.js but for bank-transfer receipts/payments.

export const BANK_VOUCHER_TYPES = ["Tất cả", "Phiếu thu tiền", "Phiếu chi tiền"];

export const BANK_ACCOUNT_OPTIONS = ["Chưa có tài khoản"];

export const OPENING_BANK_BALANCE = 828191333;

// No vouchers have been raised today yet, matching the reference's empty state.
export const BANK_VOUCHER_ROWS = [];

// Historical bank-transfer receipts still awaiting reconciliation against the
// bank statement.
export const BANK_RECONCILE_ROWS = [
  {
    id: "PTG128",
    ticketNo: "PTG128",
    dateTime: "02/02/2021 20:46:10",
    account: "Chưa có tài khoản",
    reason: "joiletan03@12033 nhận khoản thanh toán VND 300,000 (Chuyển khoản NH) cho Phòng A305",
    amount: 300000,
    reconciled: false,
    type: "thu",
  },
  {
    id: "PTG154",
    ticketNo: "PTG154",
    dateTime: "04/02/2021 21:40:43",
    account: "Chưa có tài khoản",
    reason: "joihotelvungtau@gmail.com nhận khoản thanh toán VND 460,000 (Chuyển khoản NH) cho Phòng B401",
    amount: 460000,
    reconciled: false,
    type: "thu",
  },
  {
    id: "PTG190",
    ticketNo: "PTG190",
    dateTime: "07/02/2021 13:55:51",
    account: "Chưa có tài khoản",
    reason: "joiletan02@12033 nhận khoản thanh toán VND 260,000 (Chuyển khoản NH) cho Phòng B401",
    amount: 260000,
    reconciled: false,
    type: "thu",
  },
  {
    id: "PTG240",
    ticketNo: "PTG240",
    dateTime: "14/02/2021 19:04:25",
    account: "Chưa có tài khoản",
    reason: "joiletan02@12033 nhận khoản thanh toán VND 500,000 (Chuyển khoản NH) cho Phòng B507",
    amount: 500000,
    reconciled: false,
    type: "thu",
  },
  {
    id: "PTG244",
    ticketNo: "PTG244",
    dateTime: "15/02/2021 07:33:37",
    account: "Chưa có tài khoản",
    reason: "joiletan02@12033 nhận khoản thanh toán VND 500,000 (Chuyển khoản NH) cho Phòng VIP",
    amount: 500000,
    reconciled: false,
    type: "thu",
  },
  {
    id: "PTG249",
    ticketNo: "PTG249",
    dateTime: "15/02/2021 10:35:45",
    account: "Chưa có tài khoản",
    reason: "joiletan02@12033 nhận khoản thanh toán VND 20,000 (Chuyển khoản NH) cho Phòng B401",
    amount: 20000,
    reconciled: false,
    type: "thu",
  },
  {
    id: "PTG255",
    ticketNo: "PTG255",
    dateTime: "15/02/2021 12:27:08",
    account: "Chưa có tài khoản",
    reason: "joiletan02@12033 nhận khoản thanh toán VND 30,000 (Chuyển khoản NH) cho Phòng B503",
    amount: 30000,
    reconciled: false,
    type: "thu",
  },
  {
    id: "PTG256",
    ticketNo: "PTG256",
    dateTime: "15/02/2021 12:30:26",
    account: "Chưa có tài khoản",
    reason: "joiletan02@12033 nhận khoản thanh toán VND 30,000 (Chuyển khoản NH) cho Phòng B505",
    amount: 30000,
    reconciled: false,
    type: "thu",
  },
  {
    id: "PTG257",
    ticketNo: "PTG257",
    dateTime: "15/02/2021 12:31:51",
    account: "Chưa có tài khoản",
    reason: "joiletan02@12033 nhận khoản thanh toán VND 30,000 (Chuyển khoản NH) cho Phòng B507",
    amount: 30000,
    reconciled: false,
    type: "thu",
  },
  {
    id: "PTG258",
    ticketNo: "PTG258",
    dateTime: "15/02/2021 12:32:28",
    account: "Chưa có tài khoản",
    reason: "joiletan02@12033 nhận khoản thanh toán VND 30,000 (Chuyển khoản NH) cho Phòng B506",
    amount: 30000,
    reconciled: false,
    type: "thu",
  },
];
