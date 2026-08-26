import { useMemo, useState } from "react";
import {
  Clock,
  List,
  Hash,
  Building2,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import AddReceiptModal from "../modals/AddReceiptModal";
import ReceiptInspectionModal from "../modals/ReceiptInspectionModal";
import PrintPreviewModal from "../../Warehouse/modals/PrintPreviewModal";
import TicketDetailModal from "../../Warehouse/modals/TicketDetailModal";
import useStockPanel from "../../Warehouse/hooks/useStockPanel";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { formatDMY, formatCurrency } from "../../../utils/format";
import { paginate } from "../../../utils/pagination";
import styles from "../../Warehouse/Warehouse.module.css";

const INSPECTION_STATUS_OPTIONS = ["Tất cả", "Chưa kiểm kê hàng hóa", "Đã kiểm kê hàng hóa"];

const RECEIPT_FIELDS = [
  { key: "date", label: "Ngày nhập hàng", type: "date" },
  { key: "reference", label: "Tham chiếu", type: "text" },
  { key: "supplier", label: "Nhà cung cấp", type: "text" },
  { key: "deliveryPerson", label: "Người giao hàng", type: "text" },
  { key: "orderRef", label: "Từ đơn đặt hàng", type: "text", editable: false },
  {
    key: "inspectionStatus",
    label: "Trạng thái kiểm kê",
    type: "select",
    options: INSPECTION_STATUS_OPTIONS.slice(1),
  },
  { key: "total", label: "Tổng", type: "currency", editable: false },
  { key: "note", label: "Mô tả", type: "text" },
];

const RECEIPT_LINE_COLUMNS = [
  { key: "name", label: "Nguyên vật liệu" },
  { key: "unit", label: "Đơn vị" },
  { key: "warehouse", label: "Kho" },
  { key: "qty", label: "Số lượng", numeric: true },
  { key: "price", label: "Đơn giá", numeric: true, format: (v) => formatCurrency(v) },
];

// Nhập hàng có thể gắn với 1 đơn Đặt hàng và so sánh số lượng/đơn giá đã đặt
// với hàng thực nhận (AddReceiptModal) — khác với Trả lại hàng mua (dòng hàng
// độc lập, không so sánh), nên mỗi tab có panel + modal riêng.
function ReceiptPanel({
  onToast,
  rows: receiptRows,
  setRows: setReceiptRows,
  orderRows,
  onOrderReceived,
  onCreateReturn,
}) {
  const {
    preset,
    setPreset,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    rows,
    setRows,
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
  } = useStockPanel(receiptRows, "Đã thêm phiếu nhập hàng", onToast, [receiptRows, setReceiptRows]);
  const [inspectionFilter, setInspectionFilter] = useState(INSPECTION_STATUS_OPTIONS[0]);

  const openOrders = useMemo(() => orderRows.filter((o) => o.status !== "Đã thực hiện"), [orderRows]);
  const filteredRows = useMemo(() => {
    if (inspectionFilter === "Tất cả") return rows;
    return rows.filter((row) => row.inspectionStatus === inspectionFilter);
  }, [rows, inspectionFilter]);
  const pagedRows = useMemo(() => paginate(filteredRows, page, pageSize), [filteredRows, page, pageSize]);

  function saveReceiptTicket(ticket) {
    handleSaveTicket(ticket);
    if (ticket.orderId) onOrderReceived(ticket.orderId);
  }

  function markInspected(row) {
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, inspectionStatus: "Đã kiểm kê hàng hóa" } : r))
    );
  }

  function handleApproveInspection(row) {
    markInspected(row);
    setDetailRow(null);
    onToast(
      row.paymentMethod === "Ghi nợ NCC"
        ? "Đã duyệt hàng hóa — ghi nhận công nợ vào Trả nợ"
        : "Đã duyệt hàng hóa"
    );
  }

  function handleRejectToReturn(row) {
    markInspected(row);
    setDetailRow(null);
    onCreateReturn(row.id);
  }

  return (
    <div>
      <FilterBar
        preset={preset}
        onPresetChange={setPreset}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        onSubmit={() => onToast("Đã lấy dữ liệu nhập hàng")}
      >
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Trạng thái kiểm kê</label>
          <select
            className={`${styles.selectBox} ${styles.selectArrow}`}
            value={inspectionFilter}
            onChange={(e) => {
              setInspectionFilter(e.target.value);
              setPage(1);
            }}
          >
            {INSPECTION_STATUS_OPTIONS.map((opt) => (
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
                    <Hash size={14} /> Tham chiếu
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <Building2 size={14} /> Nhà cung cấp
                  </span>
                </th>
                <th>Từ đơn đặt hàng</th>
                <th>
                  <span className={styles.thLabel}>
                    <ClipboardCheck size={14} /> Kiểm kê
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
                    title="Thêm phiếu nhập hàng"
                    aria-label="Thêm phiếu nhập hàng"
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
                  <td colSpan={9}>
                    <EmptyState message="Không tìm thấy phiếu" hint="Nhấn nút + ở góc trên để tạo phiếu nhập hàng mới." />
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
                    <td>{row.reference}</td>
                    <td>{row.supplier}</td>
                    <td>
                      {row.orderRef ? (
                        <span
                          className={`${styles.statusBadge} ${row.mismatch ? styles.mismatchBadge : styles.matchBadge}`}
                          title={row.mismatch ? "Số lượng/đơn giá nhận khác với lúc đặt hàng" : "Khớp với đơn đặt hàng"}
                        >
                          {row.mismatch ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                          {row.orderRef}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          row.inspectionStatus === "Đã kiểm kê hàng hóa" ? styles.statusDone : styles.statusPending
                        }`}
                      >
                        {row.inspectionStatus || "Chưa kiểm kê hàng hóa"}
                      </span>
                    </td>
                    <td className={styles.numCell}>{formatCurrency(row.total)}</td>
                    <td>{row.note}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="In phiếu nhập hàng"
                          aria-label="In phiếu nhập hàng"
                          onClick={() => setPrintTicket(row)}
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="Xóa phiếu nhập hàng"
                          aria-label="Xóa phiếu nhập hàng"
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
        <AddReceiptModal
          openOrders={openOrders}
          onSave={saveReceiptTicket}
          onClose={() => setShowAddModal(false)}
          onToast={onToast}
        />
      )}

      {detailRow && detailRow.inspectionStatus === "Chưa kiểm kê hàng hóa" ? (
        <ReceiptInspectionModal
          row={detailRow}
          onApprove={handleApproveInspection}
          onReject={handleRejectToReturn}
          onClose={() => setDetailRow(null)}
        />
      ) : (
        detailRow && (
          <TicketDetailModal
            title="Phiếu nhập hàng"
            row={detailRow}
            fields={RECEIPT_FIELDS}
            lineColumns={RECEIPT_LINE_COLUMNS}
            onClose={() => setDetailRow(null)}
            onSave={handleUpdateTicket}
          />
        )
      )}

      {printTicket && (
        <PrintPreviewModal
          title="Phiếu nhập hàng"
          ticketNo={printTicket.ticketNo}
          date={formatDMY(printTicket.date)}
          fields={[
            { label: "Tham chiếu", value: printTicket.reference || "—" },
            { label: "Nhà cung cấp", value: printTicket.supplier || "—" },
            { label: "Người giao hàng", value: printTicket.deliveryPerson || "—" },
            { label: "Từ đơn đặt hàng", value: printTicket.orderRef || "—" },
            { label: "Trạng thái kiểm kê", value: printTicket.inspectionStatus || "Chưa kiểm kê hàng hóa" },
            { label: "Phương thức thanh toán", value: printTicket.paymentMethod || "—" },
            { label: "Mô tả", value: printTicket.note || "—" },
            { label: "Tổng", value: formatCurrency(printTicket.total) },
          ]}
          onClose={() => setPrintTicket(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa phiếu nhập hàng"
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

export default ReceiptPanel;
