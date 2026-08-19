import { useMemo, useState } from "react";
import { Clock, List, Hash, DollarSign, MessageSquare, User, FileText, Plus, Printer, Trash2 } from "lucide-react";
import FilterBar from "./FilterBar";
import WarehousePagination from "./WarehousePagination";
import AddStockOutModal from "../modals/AddStockOutModal";
import PrintPreviewModal from "../modals/PrintPreviewModal";
import TicketDetailModal from "../modals/TicketDetailModal";
import useStockPanel from "../hooks/useStockPanel";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { STOCK_OUT_ROWS, STOCK_OUT_DOC_TYPES } from "../../../data/warehouseData";
import { formatDMY, formatCurrency, startOfDay } from "../../../utils/format";
import { paginate } from "../../../utils/pagination";
import styles from "../Warehouse.module.css";

const today = startOfDay(new Date());

const STOCK_OUT_FIELDS = [
  { key: "date", label: "Ngày xuất", type: "date" },
  { key: "bookingCode", label: "Mã đặt phòng", type: "text" },
  { key: "invoiceCode", label: "Mã hóa đơn", type: "text" },
  { key: "target", label: "Đối tượng", type: "text" },
  { key: "docType", label: "Loại chứng từ", type: "select", options: STOCK_OUT_DOC_TYPES },
  { key: "total", label: "Tổng", type: "currency" },
  { key: "note", label: "Diễn giải", type: "text" },
];

function StockOutPanel({ onToast }) {
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
  } = useStockPanel(
    () => STOCK_OUT_ROWS.map((r) => ({ ...r, date: today })),
    "Đã thêm phiếu xuất kho",
    onToast
  );
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) => row.bookingCode.toLowerCase().includes(q) || row.invoiceCode.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const pagedRows = useMemo(() => paginate(filteredRows, page, pageSize), [filteredRows, page, pageSize]);

  const total = filteredRows.reduce((sum, row) => sum + row.total, 0);

  return (
    <div>
      <FilterBar
        preset={preset}
        onPresetChange={setPreset}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        onSubmit={() => onToast("Đã lấy dữ liệu xuất kho")}
      >
        <div className={styles.field}>
          <label className={styles.fieldLabel}>&nbsp;</label>
          <input
            type="text"
            className={styles.textBox}
            placeholder="Mã đặt phòng/hóa đơn"
            aria-label="Tìm theo mã đặt phòng hoặc hóa đơn"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
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
                    <Hash size={14} /> Mã phòng
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <Hash size={14} /> Mã hóa đơn
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
                <th>
                  <span className={styles.thLabel}>
                    <User size={14} /> Đối tượng
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <FileText size={14} /> Loại chứng từ
                  </span>
                </th>
                <th className={styles.thActionCell}>
                  <button
                    type="button"
                    className={styles.addBtn}
                    title="Thêm phiếu xuất kho"
                    aria-label="Thêm phiếu xuất kho"
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
                    <EmptyState message="Không tìm thấy phiếu" hint="Nhấn nút + ở góc trên để tạo phiếu xuất kho mới." />
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
                      {row.bookingCode && (
                        <button type="button" className={styles.rowLink}>
                          {row.bookingCode}
                        </button>
                      )}
                    </td>
                    <td>{row.invoiceCode}</td>
                    <td className={styles.numCell}>{formatCurrency(row.total)}</td>
                    <td>{row.note}</td>
                    <td>{row.target}</td>
                    <td>{row.docType}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="In phiếu xuất kho"
                          aria-label="In phiếu xuất kho"
                          onClick={() => setPrintTicket(row)}
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="Xóa phiếu xuất kho"
                          aria-label="Xóa phiếu xuất kho"
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
            {filteredRows.length > 0 && (
              <tfoot>
                <tr className={styles.totalRow}>
                  <td colSpan={4}>Tổng</td>
                  <td className={styles.numCell}>{formatCurrency(total)}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            )}
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
        <AddStockOutModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveTicket}
          onToast={onToast}
        />
      )}

      {printTicket && (
        <PrintPreviewModal
          title="Phiếu xuất kho"
          ticketNo={printTicket.ticketNo}
          date={formatDMY(printTicket.date)}
          fields={[
            { label: "Đối tượng", value: printTicket.target || "—" },
            { label: "Mã đặt phòng", value: printTicket.bookingCode || "—" },
            { label: "Mã hóa đơn", value: printTicket.invoiceCode || "—" },
            { label: "Loại chứng từ", value: printTicket.docType },
            { label: "Diễn giải", value: printTicket.note || "—" },
            { label: "Tổng", value: formatCurrency(printTicket.total) },
          ]}
          onClose={() => setPrintTicket(null)}
        />
      )}

      {detailRow && (
        <TicketDetailModal
          title="Phiếu xuất kho"
          row={detailRow}
          fields={STOCK_OUT_FIELDS}
          onClose={() => setDetailRow(null)}
          onSave={handleUpdateTicket}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa phiếu xuất kho"
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

export default StockOutPanel;
