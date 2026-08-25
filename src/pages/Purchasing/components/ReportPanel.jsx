import { useMemo, useState } from "react";
import { Clock, List, Info, MessageSquare, Plus, ShoppingCart, Printer, Trash2 } from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import AddPurchaseTicketModal from "../modals/AddPurchaseTicketModal";
import PrintPreviewModal from "../../Warehouse/modals/PrintPreviewModal";
import TicketDetailModal from "../../Warehouse/modals/TicketDetailModal";
import useStockPanel from "../../Warehouse/hooks/useStockPanel";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import statusBadgeClass from "../statusBadge";
import { usePurchaseReport } from "../../../context/PurchaseReportContext";
import { REPORT_ROWS, PURCHASE_STATUS_OPTIONS } from "../../../data/purchasingData";
import { formatDMY } from "../../../utils/format";
import { paginate } from "../../../utils/pagination";
import styles from "../../Warehouse/Warehouse.module.css";

const REPORT_FIELDS = [
  { key: "date", label: "Ngày", type: "date" },
  { key: "status", label: "Trạng thái", type: "select", options: PURCHASE_STATUS_OPTIONS.slice(1) },
  { key: "note", label: "Diễn giải", type: "text" },
];

function ReportPanel({ onToast, onCreateOrder }) {
  const { reportRows, setReportRows } = usePurchaseReport();
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
    printTicket,
    setPrintTicket,
    detailRow,
    setDetailRow,
    deleteTarget,
    setDeleteTarget,
    handleSaveTicket,
    handleUpdateTicket,
    handleConfirmDelete,
  } = useStockPanel(REPORT_ROWS, "Đã thêm phiếu báo hàng", onToast, [reportRows, setReportRows]);
  const [status, setStatus] = useState(PURCHASE_STATUS_OPTIONS[0]);

  function handleCreateOrder(row) {
    onCreateOrder({
      name: row.ingredientName || row.note || "",
      unit: row.unit || "",
      qty: row.qty ?? "",
    });
  }

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
                      <button type="button" className={styles.rowLink} onClick={() => setDetailRow(row)}>
                        {row.ticketNo}
                      </button>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusBadgeClass(row.status, styles)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.note}</td>
                    <td>
                      <div className={styles.rowActions}>
                        {row.status !== "Đã thực hiện" && (
                          <button
                            type="button"
                            className={styles.inlineActionBtn}
                            title="Tạo đơn đặt hàng từ phiếu này"
                            onClick={() => handleCreateOrder(row)}
                          >
                            <ShoppingCart size={14} /> Tạo đơn đặt hàng
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="In phiếu báo hàng"
                          aria-label="In phiếu báo hàng"
                          onClick={() => setPrintTicket(row)}
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="Xóa phiếu báo hàng"
                          aria-label="Xóa phiếu báo hàng"
                          onClick={() => setDeleteTarget(row)}
                        >
                          <Trash2 size={16} />
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

      {detailRow && (
        <TicketDetailModal
          title="Phiếu báo hàng"
          row={detailRow}
          fields={REPORT_FIELDS}
          onClose={() => setDetailRow(null)}
          onSave={handleUpdateTicket}
        />
      )}

      {printTicket && (
        <PrintPreviewModal
          title="Phiếu báo hàng"
          ticketNo={printTicket.ticketNo}
          date={formatDMY(printTicket.date)}
          fields={[
            { label: "Trạng thái", value: printTicket.status },
            { label: "Diễn giải", value: printTicket.note || "—" },
          ]}
          onClose={() => setPrintTicket(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa phiếu báo hàng"
          message={`Bạn có chắc chắn muốn xóa phiếu ${deleteTarget.ticketNo}?`}
          confirmLabel="Xóa"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default ReportPanel;
