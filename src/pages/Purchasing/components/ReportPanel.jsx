import { useMemo, useState } from "react";
import { Clock, List, Info, MessageSquare, Plus } from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import AddPurchaseTicketModal from "../modals/AddPurchaseTicketModal";
import useStockPanel from "../../Warehouse/hooks/useStockPanel";
import EmptyState from "../../../components/EmptyState";
import statusBadgeClass from "../statusBadge";
import { REPORT_ROWS, PURCHASE_STATUS_OPTIONS } from "../../../data/purchasingData";
import { formatDMY } from "../../../utils/format";
import { paginate } from "../../../utils/pagination";
import styles from "../../Warehouse/Warehouse.module.css";

function ReportPanel({ onToast }) {
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
  } = useStockPanel(REPORT_ROWS, "Đã thêm phiếu báo hàng", onToast);
  const [status, setStatus] = useState(PURCHASE_STATUS_OPTIONS[0]);

  const filteredRows = useMemo(() => {
    if (status === "Tất cả") return rows;
    return rows.filter((row) => row.status === status);
  }, [rows, status]);

  const pagedRows = useMemo(() => paginate(filteredRows, page, pageSize), [filteredRows, page, pageSize]);

  return (
    <div>
      <FilterBar
        preset={preset}
        onPresetChange={setPreset}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        onSubmit={() => onToast("Đã lấy dữ liệu báo hàng")}
      >
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Trạng thái</label>
          <select
            className={`${styles.selectBox} ${styles.selectArrow}`}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {PURCHASE_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

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
                    <Info size={14} /> Trạng thái
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
                    title="Thêm phiếu báo hàng"
                    aria-label="Thêm phiếu báo hàng"
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
                  <td colSpan={5}>
                    <EmptyState message="Không tìm thấy phiếu" hint="Nhấn nút + ở góc trên để tạo phiếu báo hàng mới." />
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
                    <td>
                      <span className={`${styles.statusBadge} ${statusBadgeClass(row.status, styles)}`}>
                        {row.status}
                      </span>
                    </td>
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
          total={filteredRows.length}
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
        />
      </div>

      {showAddModal && (
        <AddPurchaseTicketModal
          title="Thêm phiếu báo hàng"
          ticketPrefix="BH"
          statusOptions={PURCHASE_STATUS_OPTIONS.slice(1)}
          onSave={handleSaveTicket}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

export default ReportPanel;
