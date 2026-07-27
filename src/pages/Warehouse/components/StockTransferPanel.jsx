import { useMemo, useState } from "react";
import { Clock, List, User, DollarSign, MessageSquare, Plus, Printer } from "lucide-react";
import FilterBar from "./FilterBar";
import WarehousePagination from "./WarehousePagination";
import AddStockTransferModal from "../modals/AddStockTransferModal";
import PrintPreviewModal from "../modals/PrintPreviewModal";
import { STOCK_TRANSFER_ROWS } from "../../../data/warehouseData";
import { formatDMY, formatCurrency, startOfDay } from "../../../utils/format";
import styles from "../Warehouse.module.css";

const today = startOfDay(new Date());

function StockTransferPanel({ onToast }) {
  const [preset, setPreset] = useState("Hôm nay");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [rows, setRows] = useState(STOCK_TRANSFER_ROWS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [printTicket, setPrintTicket] = useState(null);

  function handleSaveTicket(ticket) {
    setRows((prev) => [ticket, ...prev]);
    setShowAddModal(false);
    onToast("Đã thêm phiếu chuyển kho");
  }

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
                <td colSpan={6}>Không tìm thấy phiếu</td>
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
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

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
