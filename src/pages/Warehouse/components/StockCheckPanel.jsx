import { useMemo, useState } from "react";
import { Clock, List, Warehouse, MessageSquare, Info, Plus, Printer } from "lucide-react";
import FilterBar from "./FilterBar";
import WarehousePagination from "./WarehousePagination";
import AddStockCheckModal from "../modals/AddStockCheckModal";
import PrintPreviewModal from "../modals/PrintPreviewModal";
import { STOCK_CHECK_ROWS, STATUS_OPTIONS } from "../../../data/warehouseData";
import { formatDMY, startOfDay } from "../../../utils/format";
import styles from "../Warehouse.module.css";

const today = startOfDay(new Date());

function StockCheckPanel({ onToast }) {
  const [preset, setPreset] = useState("Hôm nay");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [rows, setRows] = useState(STOCK_CHECK_ROWS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [printTicket, setPrintTicket] = useState(null);

  function handleSaveTicket(ticket) {
    setRows((prev) => [ticket, ...prev]);
    setShowAddModal(false);
    onToast("Đã thêm phiếu kiểm kê kho");
  }

  const filteredRows = useMemo(() => {
    if (status === "Tất cả") return rows;
    return rows.filter((row) => row.status === status);
  }, [rows, status]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  return (
    <div>
      <FilterBar
        preset={preset}
        onPresetChange={setPreset}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        onSubmit={() => onToast("Đã lấy dữ liệu kiểm kê kho")}
      >
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Trạng thái</label>
          <select
            className={styles.selectBox}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

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
                  <Warehouse size={14} /> Kho
                </span>
              </th>
              <th>
                <span className={styles.thLabel}>
                  <MessageSquare size={14} /> Diễn giải
                </span>
              </th>
              <th>
                <span className={styles.thLabel}>
                  <Info size={14} /> Trạng thái
                </span>
              </th>
              <th className={styles.thActionCell}>
                <button
                  type="button"
                  className={styles.addBtn}
                  title="Thêm phiếu kiểm kê kho"
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
                  <td>{row.warehouse}</td>
                  <td>{row.note}</td>
                  <td>{row.status}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.viewBtn}
                      title="In phiếu kiểm kê kho"
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
        total={filteredRows.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {showAddModal && (
        <AddStockCheckModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveTicket}
          onToast={onToast}
        />
      )}

      {printTicket && (
        <PrintPreviewModal
          title="Phiếu kiểm kê kho"
          ticketNo={printTicket.ticketNo}
          date={formatDMY(printTicket.date)}
          fields={[
            { label: "Kho", value: printTicket.warehouse || "—" },
            { label: "Diễn giải", value: printTicket.note || "—" },
            { label: "Trạng thái", value: printTicket.status },
          ]}
          onClose={() => setPrintTicket(null)}
        />
      )}
    </div>
  );
}

export default StockCheckPanel;
