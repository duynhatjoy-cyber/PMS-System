import { useMemo, useState } from "react";
import { Building2, DollarSign, CheckCircle2, AlertCircle, History, Wallet } from "lucide-react";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import EmptyState from "../../../components/EmptyState";
import SupplierDebtHistoryModal from "../modals/SupplierDebtHistoryModal";
import AddSupplierPaymentModal from "../modals/AddSupplierPaymentModal";
import { useActiveSuppliers } from "../../../context/WarehouseConfigContext";
import { supplierDebtSummary } from "../supplierDebt";
import { formatCurrency } from "../../../utils/format";
import { paginate } from "../../../utils/pagination";
import styles from "../../Warehouse/Warehouse.module.css";

// Danh sách nhà cung cấp lấy từ Quản lý kho > Nhà cung cấp (WarehouseConfigContext)
// nên luôn khớp với danh mục ở đó — hiển thị tất cả để kiểm soát công nợ, không
// chỉ nhà nào còn nợ. Tổng/Đã trả/Còn nợ tính từ giao dịch thật (supplierDebt.js)
// thay vì số tĩnh. "Thanh toán" lập phiếu mới vào paymentRows (nâng state ở
// Purchasing.jsx) nên Còn nợ và "Xem lịch sử" cập nhật ngay, phục vụ đối soát.
function DebtPanel({ onToast, receiptRows, returnRows, paymentRows, setPaymentRows }) {
  const activeSuppliers = useActiveSuppliers();
  const [supplierFilter, setSupplierFilter] = useState("");
  const [historySupplier, setHistorySupplier] = useState(null);
  const [paySupplier, setPaySupplier] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debtRows = useMemo(() => {
    const suppliers = supplierFilter ? activeSuppliers.filter((s) => s.name === supplierFilter) : activeSuppliers;
    const debtData = { receiptRows, returnRows, paymentRows };
    return suppliers.map((s) => ({ supplier: s, ...supplierDebtSummary(s.name, debtData) }));
  }, [activeSuppliers, supplierFilter, receiptRows, returnRows, paymentRows]);

  const pagedRows = useMemo(() => paginate(debtRows, page, pageSize), [debtRows, page, pageSize]);

  function handleSavePayment(payment) {
    setPaymentRows((prev) => [payment, ...prev]);
    setPaySupplier(null);
    onToast("Đã lập phiếu thanh toán");
  }

  return (
    <div>
      <div className={styles.field} style={{ marginBottom: 20, maxWidth: 280 }}>
        <label className={styles.fieldLabel}>Nhà cung cấp</label>
        <select
          className={`${styles.selectBox} ${styles.selectArrow}`}
          value={supplierFilter}
          onChange={(e) => {
            setSupplierFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả</option>
          {activeSuppliers.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th>
                  <span className={styles.thLabel}>
                    <Building2 size={14} /> Nhà cung cấp
                  </span>
                </th>
                <th className={styles.numCell} style={{ width: 170 }}>
                  <span className={styles.thLabel}>
                    <DollarSign size={14} /> Tổng
                  </span>
                </th>
                <th className={styles.numCell} style={{ width: 170 }}>
                  <span className={styles.thLabel}>
                    <CheckCircle2 size={14} /> Đã trả
                  </span>
                </th>
                <th className={styles.numCell} style={{ width: 170 }}>
                  <span className={styles.thLabel}>
                    <AlertCircle size={14} /> Còn nợ
                  </span>
                </th>
                <th className={styles.thActionCell} style={{ width: 92 }} />
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={5}>
                    <EmptyState message="Không tìm thấy nhà cung cấp" />
                  </td>
                </tr>
              ) : (
                pagedRows.map(({ supplier, total, reduced, remaining }) => (
                  <tr key={supplier.name}>
                    <td>{supplier.name}</td>
                    <td className={styles.numCell}>{formatCurrency(total)}</td>
                    <td className={styles.numCell}>{formatCurrency(reduced)}</td>
                    <td
                      className={styles.numCell}
                      style={remaining > 0 ? { color: "var(--fd-danger)", fontWeight: 600 } : undefined}
                    >
                      {formatCurrency(remaining)}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="Thanh toán công nợ"
                          aria-label="Thanh toán công nợ"
                          disabled={remaining <= 0}
                          onClick={() => setPaySupplier({ name: supplier.name, remaining })}
                        >
                          <Wallet size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="Xem lịch sử công nợ"
                          aria-label="Xem lịch sử công nợ"
                          onClick={() => setHistorySupplier(supplier.name)}
                        >
                          <History size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <WarehousePagination
          page={page}
          pageSize={pageSize}
          total={debtRows.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {paySupplier && (
        <AddSupplierPaymentModal
          supplierName={paySupplier.name}
          remaining={paySupplier.remaining}
          onSave={handleSavePayment}
          onClose={() => setPaySupplier(null)}
        />
      )}

      {historySupplier && (
        <SupplierDebtHistoryModal
          supplierName={historySupplier}
          receiptRows={receiptRows}
          returnRows={returnRows}
          paymentRows={paymentRows}
          onClose={() => setHistorySupplier(null)}
        />
      )}
    </div>
  );
}

export default DebtPanel;
