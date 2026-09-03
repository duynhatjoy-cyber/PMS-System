import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  List,
  Info,
  DollarSign,
  MessageSquare,
  Building2,
  CalendarClock,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import AddPurchaseOrderModal from "../modals/AddPurchaseOrderModal";
import PrintPreviewModal from "../../Warehouse/modals/PrintPreviewModal";
import useStockPanel from "../../Warehouse/hooks/useStockPanel";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import statusBadgeClass from "../statusBadge";
import { PURCHASE_STATUS_OPTIONS } from "../../../data/purchasingData";
import { formatDMY, formatCurrency } from "../../../utils/format";
import { paginate } from "../../../utils/pagination";
import styles from "../../Warehouse/Warehouse.module.css";

function OrderPanel({ onToast, rows: orderRows, setRows: setOrderRows, seedLine, onSeedConsumed }) {
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
  } = useStockPanel(orderRows, "Đã thêm phiếu đặt hàng", onToast, [orderRows, setOrderRows]);
  const [status, setStatus] = useState(PURCHASE_STATUS_OPTIONS[0]);

  useEffect(() => {
    if (seedLine) setShowAddModal(true);
  }, [seedLine, setShowAddModal]);

  function closeAddModal() {
    setShowAddModal(false);
    onSeedConsumed();
  }

  function saveOrderTicket(ticket) {
    handleSaveTicket(ticket);
    onSeedConsumed();
  }

  function handleExecuteOrder(row) {
    handleUpdateTicket({ ...row, status: "Đang thực hiện" });
  }

  function handleCancelOrder(row) {
    setDetailRow(null);
    setDeleteTarget(row);
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
        onSubmit={() => onToast("Đã lấy dữ liệu đặt hàng")}
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
                    <Building2 size={14} /> Nhà cung cấp
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <CalendarClock size={14} /> Ngày nhận dự kiến
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
                    title="Thêm phiếu đặt hàng"
                    aria-label="Thêm phiếu đặt hàng"
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
                  <td colSpan={8}>
                    <EmptyState message="Không tìm thấy phiếu" hint="Nhấn nút + ở góc trên để tạo phiếu đặt hàng mới." />
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
                    <td>{row.supplier}</td>
                    <td>{row.expectedDate ? formatDMY(row.expectedDate) : "—"}</td>
                    <td className={styles.numCell}>{formatCurrency(row.total)}</td>
                    <td>{row.note}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="In phiếu đặt hàng"
                          aria-label="In phiếu đặt hàng"
                          onClick={() => setPrintTicket(row)}
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="Xóa phiếu đặt hàng"
                          aria-label="Xóa phiếu đặt hàng"
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
        <AddPurchaseOrderModal
          seedLine={seedLine}
          onSave={saveOrderTicket}
          onClose={closeAddModal}
          onToast={onToast}
        />
      )}

      {detailRow && (
        <AddPurchaseOrderModal
          row={detailRow}
          onSave={handleUpdateTicket}
          onClose={() => setDetailRow(null)}
          onToast={onToast}
          actions={
            detailRow.status === "Chưa thực hiện"
              ? [
                  { label: "THỰC HIỆN ĐẶT HÀNG", onClick: () => handleExecuteOrder(detailRow) },
                  { label: "HỦY", onClick: () => handleCancelOrder(detailRow), danger: true },
                ]
              : []
          }
        />
      )}

      {printTicket && (
        <PrintPreviewModal
          title="Phiếu đặt hàng"
          ticketNo={printTicket.ticketNo}
          date={formatDMY(printTicket.date)}
          fields={[
            { label: "Trạng thái", value: printTicket.status },
            { label: "Nhà cung cấp", value: printTicket.supplier || "—" },
            {
              label: "Ngày nhận dự kiến",
              value: printTicket.expectedDate ? formatDMY(printTicket.expectedDate) : "—",
            },
            { label: "Diễn giải", value: printTicket.note || "—" },
            { label: "Tổng", value: formatCurrency(printTicket.total) },
          ]}
          onClose={() => setPrintTicket(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa phiếu đặt hàng"
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

export default OrderPanel;
