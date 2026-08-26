// Công nợ nhà cung cấp không lưu thành 1 số tĩnh — luôn tính lại từ 3 nguồn
// giao dịch thật (Nhập hàng phương thức "Ghi nợ NCC" làm phát sinh nợ; Trả
// lại hàng mua theo "Giảm trừ công nợ" và Thanh toán làm giảm nợ) để Trả nợ
// luôn truy được về đúng phiếu gốc, phục vụ kiểm kê. Dùng chung giữa DebtPanel
// (bảng tổng hợp) và SupplierDebtHistoryModal (chi tiết từng giao dịch) để
// không lệch cách tính.

// Nhập hàng phương thức "Thanh toán ngay" được trả ngay lúc nhận hàng, không
// phát sinh công nợ nên không có mặt ở đây. Phiếu "Chưa kiểm kê hàng hóa"
// cũng chưa tính — công nợ chỉ ghi nhận sau khi người dùng bấm "Duyệt hàng"
// ở bước kiểm kê (ReceiptInspectionModal), tránh ghi nợ cho hàng chưa xác
// nhận đạt. Trả lại hàng mua theo "Nhận lại tiền" là hoàn tiền mặt trực
// tiếp, cũng không đi qua công nợ — cả ba vẫn xem được đầy đủ ở tab Nhập
// hàng/Trả lại hàng mua, chỉ không tính vào đây.
export function supplierTransactions(supplierName, { receiptRows, returnRows, paymentRows }) {
  const entries = [
    ...receiptRows
      .filter(
        (r) =>
          r.supplier === supplierName &&
          r.paymentMethod !== "Thanh toán ngay" &&
          r.inspectionStatus !== "Chưa kiểm kê hàng hóa"
      )
      .map((r) => ({
        date: r.date,
        type: "receipt",
        ticketNo: r.ticketNo,
        label: "Nhập hàng",
        note: r.note,
        amount: r.total,
      })),
    ...returnRows
      .filter((r) => r.supplier === supplierName && r.paymentMethod === "Giảm trừ công nợ")
      .map((r) => ({
        date: r.date,
        type: "return",
        ticketNo: r.ticketNo,
        label: "Trả lại hàng mua",
        note: r.note,
        amount: -r.total,
      })),
    ...paymentRows
      .filter((p) => p.supplier === supplierName)
      .map((p) => ({
        date: p.date,
        type: "payment",
        ticketNo: p.ticketNo,
        label: `Thanh toán (${p.method})`,
        note: p.note,
        amount: -p.amount,
        billImage: p.billImage,
      })),
  ];

  entries.sort((a, b) => a.date - b.date);

  let balance = 0;
  return entries.map((entry) => {
    balance += entry.amount;
    return { ...entry, balance };
  });
}

export function supplierDebtSummary(supplierName, data) {
  const transactions = supplierTransactions(supplierName, data);
  const total = transactions.filter((t) => t.type === "receipt").reduce((sum, t) => sum + t.amount, 0);
  const remaining = transactions.length ? transactions[transactions.length - 1].balance : 0;
  return { total, reduced: total - remaining, remaining };
}
