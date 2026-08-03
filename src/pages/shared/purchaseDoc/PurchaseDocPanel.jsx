import { useMemo } from "react";
import { Clock, List, Hash, Building2, DollarSign, MessageSquare, Plus } from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import AddPurchaseTicketModal from "../../Purchasing/modals/AddPurchaseTicketModal";
import useStockPanel from "../../Warehouse/hooks/useStockPanel";
import EmptyState from "../../../components/EmptyState";
import { formatDMY, formatCurrency } from "../../../utils/format";
import { paginate } from "../../../utils/pagination";
import styles from "../../Warehouse/Warehouse.module.css";

// Shared "Nhập hàng"/"Trả lại hàng mua" list — both tabs are the same
// ticket-from-supplier shape (date/ticket/doc ref/supplier/total/note), only
// differing in wording and ticket prefix, so the per-tab files stay thin
// config wrappers (same split as CashVoucherPanel/BankVoucherPanel around
// FundVoucherPanel).
function PurchaseDocPanel({
  onToast,
  initialRows,
  savedMessage,
  fetchMessage,
  ticketPrefix,
  docColumnLabel,
  addTitle,
  emptyHint,
}) {
  const {
    preset,
    setPreset,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    rows,
    page,
    setPage,
    pageSize,
    changePageSize,
    showAddModal,
    setShowAddModal,
    handleSaveTicket,
  } = useStockPanel(initialRows, savedMessage, onToast);

  const pagedRows = useMemo(() => paginate(rows, page, pageSize), [rows, page, pageSize]);

  return (
    <div>
      <FilterBar
        preset={preset}
        onPresetChange={setPreset}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        onSubmit={() => onToast(fetchMessage)}
      />

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <span className={styles.thLabel}>
                    <Clock size={14} /> Ngày
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <List size={14} /> Số phiếu
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <Hash size={14} /> {docColumnLabel}
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <Building2 size={14} /> Nhà cung cấp
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <DollarSign size={14} /> Tổng
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <MessageSquare size={14} /> Diễn giải
                  </span>
                </th>
                <th className={styles.thActionCell}>
                  <button
                    type="button"
                    className={styles.addBtn}
                    title={addTitle}
                    aria-label={addTitle}
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus size={18} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={6}>
                    <EmptyState message="Không tìm thấy phiếu" hint={emptyHint} />
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDMY(row.date)}</td>
                    <td>
                      <button type="button" className={styles.rowLink}>
                        {row.ticketNo}
                      </button>
                    </td>
                    <td>{row.docRef}</td>
                    <td>{row.supplier}</td>
                    <td className={styles.numCell}>{formatCurrency(row.total)}</td>
                    <td>{row.note}</td>
                    <td />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <WarehousePagination
          page={page}
          pageSize={pageSize}
          total={rows.length}
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
        />
      </div>

      {showAddModal && (
        <AddPurchaseTicketModal
          title={addTitle}
          ticketPrefix={ticketPrefix}
          includeSupplier
          includeTotal
          docRefLabel={docColumnLabel}
          onSave={handleSaveTicket}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

export default PurchaseDocPanel;
