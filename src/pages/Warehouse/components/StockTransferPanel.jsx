import { useMemo } from "react";
import { Clock, List, User, DollarSign, MessageSquare, Plus, Printer } from "lucide-react";
import FilterBar from "./FilterBar";
import WarehousePagination from "./WarehousePagination";
import AddStockTransferModal from "../modals/AddStockTransferModal";
import PrintPreviewModal from "../modals/PrintPreviewModal";
import useStockPanel from "../hooks/useStockPanel";
import EmptyState from "../../../components/EmptyState";
import { STOCK_TRANSFER_ROWS } from "../../../data/warehouseData";
import { formatDMY, formatCurrency } from "../../../utils/format";
import styles from "../Warehouse.module.css";

function StockTransferPanel({ onToast }) {
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
    handleSaveTicket,
  } = useStockPanel(STOCK_TRANSFER_ROWS, "Đã thêm phiếu chuyển kho", onToast);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return (
    <div>
      <FilterBar
        preset={preset}
        onPresetChange={setPreset}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        onSubmit={() => onToast("Đã lấy dữ liệu chuyển kho")}
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
                    <User size={14} /> Người vận chuyển
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
                    title="Thêm phiếu chuyển kho"
                    aria-label="Thêm phiếu chuyển kho"
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
                    <EmptyState message="Không tìm thấy phiếu" hint="Nhấn nút + ở góc trên để tạo phiếu chuyển kho mới." />
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
                    <td>{row.carrier}</td>
                    <td className={styles.numCell}>{formatCurrency(row.total)}</td>
                    <td>{row.note}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.viewBtn}
                        title="In phiếu chuyển kho"
                        aria-label="In phiếu chuyển kho"
                        onClick={() => setPrintTicket(row)}
                      >
                        <Printer size={16} />
                      </button>
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
        <AddStockTransferModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveTicket}
          onToast={onToast}
        />
      )}

      {printTicket && (
        <PrintPreviewModal
          title="Phiếu chuyển kho"
          ticketNo={printTicket.ticketNo}
          date={formatDMY(printTicket.date)}
          fields={[
            { label: "Người vận chuyển", value: printTicket.carrier || "—" },
            { label: "Diễn giải", value: printTicket.note || "—" },
            { label: "Tổng", value: formatCurrency(printTicket.total) },
          ]}
          onClose={() => setPrintTicket(null)}
        />
      )}
    </div>
  );
}

export default StockTransferPanel;
