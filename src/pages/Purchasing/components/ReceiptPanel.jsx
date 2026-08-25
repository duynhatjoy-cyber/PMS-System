import { useMemo } from "react";
import {
  Clock,
  List,
  Hash,
  Building2,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import AddReceiptModal from "../modals/AddReceiptModal";
import PrintPreviewModal from "../../Warehouse/modals/PrintPreviewModal";
import TicketDetailModal from "../../Warehouse/modals/TicketDetailModal";
import useStockPanel from "../../Warehouse/hooks/useStockPanel";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { formatDMY, formatCurrency } from "../../../utils/format";
import { paginate } from "../../../utils/pagination";
import styles from "../../Warehouse/Warehouse.module.css";

const RECEIPT_FIELDS = [
  { key: "date", label: "Ngày nhập", type: "date" },
  { key: "docRef", label: "Số hóa đơn", type: "text" },
  { key: "supplier", label: "Nhà cung cấp", type: "text" },
  { key: "orderRef", label: "Từ đơn đặt hàng", type: "text", editable: false },
  { key: "total", label: "Tổng", type: "currency", editable: false },
  { key: "note", label: "Diễn giải", type: "text" },
];

const RECEIPT_LINE_COLUMNS = [
  { key: "name", label: "Tên hàng" },
  { key: "unit", label: "Đơn vị" },
  { key: "qty", label: "Số lượng", numeric: true },
  { key: "price", label: "Đơn giá", numeric: true, format: (v) => formatCurrency(v) },
];

// Khác với Trả lại hàng mua (vẫn dùng PurchaseDocPanel chung, phiếu đơn giản
// không cần so sánh) — Nhập hàng có thể gắn với 1 đơn Đặt hàng và so sánh
// số lượng/đơn giá đã đặt với hàng thực nhận (AddReceiptModal), nên có
// panel + modal riêng.
function ReceiptPanel({ onToast, rows: receiptRows, setRows: setReceiptRows, orderRows, onOrderReceived }) {
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
  } = useStockPanel(receiptRows, "Đã thêm phiếu nhập hàng", onToast, [receiptRows, setReceiptRows]);

  const openOrders = useMemo(() => orderRows.filter((o) => o.status !== "Đã thực hiện"), [orderRows]);
  const pagedRows = useMemo(() => paginate(rows, page, pageSize), [rows, page, pageSize]);

  function saveReceiptTicket(ticket) {
    handleSaveTicket(ticket);
    if (ticket.orderId) onOrderReceived(ticket.orderId);
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
                    <Hash size={14} /> Số hóa đơn
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
                  <td colSpan={8}>
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
                    <td>{row.docRef}</td>
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
          total={rows.length}
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
        />
      </div>

      {showAddModal && (
        <AddReceiptModal openOrders={openOrders} onSave={saveReceiptTicket} onClose={() => setShowAddModal(false)} />
      )}

      {detailRow && (
        <TicketDetailModal
          title="Phiếu nhập hàng"
          row={detailRow}
          fields={RECEIPT_FIELDS}
          lineColumns={RECEIPT_LINE_COLUMNS}
          onClose={() => setDetailRow(null)}
          onSave={handleUpdateTicket}
        />
      )}

      {printTicket && (
        <PrintPreviewModal
          title="Phiếu nhập hàng"
          ticketNo={printTicket.ticketNo}
          date={formatDMY(printTicket.date)}
          fields={[
            { label: "Số hóa đơn", value: printTicket.docRef || "—" },
            { label: "Nhà cung cấp", value: printTicket.supplier || "—" },
            { label: "Từ đơn đặt hàng", value: printTicket.orderRef || "—" },
            { label: "Diễn giải", value: printTicket.note || "—" },
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
