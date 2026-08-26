import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { supplierTransactions, supplierDebtSummary } from "../supplierDebt";
import { formatDMY, formatCurrency } from "../../../utils/format";
import tableStyles from "../../Warehouse/Warehouse.module.css";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

function SupplierDebtHistoryModal({ supplierName, receiptRows, returnRows, paymentRows, onClose }) {
  const data = { receiptRows, returnRows, paymentRows };
  const transactions = supplierTransactions(supplierName, data);
  const { total, reduced, remaining } = supplierDebtSummary(supplierName, data);

  return (
    <SlidePanelShell title={`Lịch sử công nợ — ${supplierName}`} onClose={onClose} tone="brand" width={820}>
      <div className={styles.printSheet} style={{ maxWidth: "none" }}>
        <div className={styles.printRow}>
          <span className={styles.printLabel}>Tổng phát sinh (nhập hàng)</span>
          <span className={styles.printValue}>{formatCurrency(total)}</span>
        </div>
        <div className={styles.printRow}>
          <span className={styles.printLabel}>Đã giảm trừ &amp; thanh toán</span>
          <span className={styles.printValue}>{formatCurrency(reduced)}</span>
        </div>
        <div className={styles.printRow}>
          <span className={styles.printLabel}>Còn nợ</span>
          <span className={styles.printValue} style={remaining > 0 ? { color: "var(--fd-danger)" } : undefined}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      <div className={styles.tableWrap} style={{ marginTop: 16 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Loại giao dịch</th>
              <th>Số chứng từ</th>
              <th>Diễn giải</th>
              <th>Số tiền</th>
              <th>Số dư</th>
              <th>Bill</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.tableHint}>
                  Chưa có giao dịch nào với nhà cung cấp này.
                </td>
              </tr>
            ) : (
              transactions.map((t, i) => (
                <tr key={`${t.type}-${t.ticketNo}-${i}`}>
                  <td>{formatDMY(t.date)}</td>
                  <td>{t.label}</td>
                  <td>{t.ticketNo}</td>
                  <td>{t.note || "—"}</td>
                  <td
                    className={tableStyles.numCell}
                    style={{ color: t.amount < 0 ? "var(--fd-success)" : "var(--fd-text)" }}
                  >
                    {t.amount < 0 ? "-" : "+"}
                    {formatCurrency(Math.abs(t.amount))}
                  </td>
                  <td className={tableStyles.numCell}>{formatCurrency(t.balance)}</td>
                  <td>
                    {t.billImage ? (
                      <a href={t.billImage} target="_blank" rel="noreferrer" title="Xem ảnh bill">
                        <img
                          src={t.billImage}
                          alt="Ảnh bill"
                          style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 4, display: "block" }}
                        />
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footerBtns}>
        <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
          ĐÓNG
        </button>
      </div>
    </SlidePanelShell>
  );
}

export default SupplierDebtHistoryModal;
