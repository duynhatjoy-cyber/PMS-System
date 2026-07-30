export function paginate(rows, page, pageSize) {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

// Nhãn dùng chung cho các trang sổ quỹ/phiếu thu-chi (CashCheckPanel,
// FundLedgerPanel, FundVoucherPanel) — khác với DEFAULT_LABELS riêng của
// WarehousePagination vốn dành cho các panel Kho không truyền `labels`.
export const LEDGER_PAGINATION_LABELS = { page: "Trang", rowsPerPage: "Số lượng mỗi trang", of: "trên" };
