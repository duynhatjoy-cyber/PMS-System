import { useMemo, useState } from "react";
import { Clock, List, DollarSign, MessageSquare, Plus, Printer } from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import PrintPreviewModal from "../../Warehouse/modals/PrintPreviewModal";
import AddCashVoucherModal from "../modals/AddCashVoucherModal";
import { CASH_VOUCHER_ROWS, CASH_VOUCHER_TYPES } from "../../../data/cashFundData";
import { formatDMY, startOfDay } from "../../../utils/format";
import warehouseStyles from "../../Warehouse/Warehouse.module.css";
import styles from "../CashFund.module.css";

const today = startOfDay(new Date());
const PAGINATION_LABELS = { page: "Trang", rowsPerPage: "Số lượng mỗi trang", of: "trên" };

function atTime(date, row) {
  const d = new Date(date);
  d.setHours(row.hh, row.mm, row.ss, 0);
  return d;
}

function CashVoucherPanel({ onToast }) {
  const [preset, setPreset] = useState("Hôm nay");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [docType, setDocType] = useState(CASH_VOUCHER_TYPES[1]);
  const [rows, setRows] = useState(() =>
    CASH_VOUCHER_ROWS.map((r) => ({ ...r, dateTime: atTime(today, r) }))
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addModalType, setAddModalType] = useState(null);
  const [printTicket, setPrintTicket] = useState(null);

  const filteredRows = useMemo(() => {
    if (docType === "Tất cả") return rows;
    const wantType = docType === "Phiếu chi tiền" ? "chi" : "thu";
    return rows.filter((row) => row.type === wantType);
  }, [rows, docType]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  function handleSaveVoucher(voucher) {
    setRows((prev) => [voucher, ...prev]);
    setAddModalType(null);
    onToast(voucher.type === "chi" ? "Đã lập phiếu chi tiền" : "Đã lập phiếu thu tiền");
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
        submitLabel="TÌM KIẾM"
        onSubmit={() => onToast("Đã tìm kiếm phiếu thu chi")}
      >
        <div className={warehouseStyles.field}>
          <label className={warehouseStyles.fieldLabel}>&nbsp;</label>
          <select
            className={warehouseStyles.selectBox}
            value={docType}
            onChange={(e) => {
              setDocType(e.target.value);
              setPage(1);
            }}
          >
            {CASH_VOUCHER_TYPES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <div className={warehouseStyles.tableWrap}>
        <table className={warehouseStyles.table}>
          <thead>
            <tr>
              <th>
                <span className={warehouseStyles.thLabel}>
                  <Clock size={14} /> Ngày
                </span>
              </th>
              <th>
                <span className={warehouseStyles.thLabel}>
                  <List size={14} /> Số chứng từ
                </span>
              </th>
              <th>
                <span className={warehouseStyles.thLabel}>
                  <DollarSign size={14} /> Số tiền
                </span>
              </th>
              <th>
                <span className={warehouseStyles.thLabel}>
                  <MessageSquare size={14} /> Lý do
                </span>
              </th>
              <th className={warehouseStyles.thActionCell}>
                <div className={styles.actionGroup}>
                  <button
                    type="button"
                    className={warehouseStyles.addBtn}
                    title="Lập phiếu thu tiền"
                    onClick={() => setAddModalType("thu")}
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    type="button"
                    className={styles.addBtnChi}
                    title="Lập phiếu chi tiền"
                    onClick={() => setAddModalType("chi")}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </th>
            </tr>
            <tr className={styles.subHeadRow}>
              <th />
              <th />
              <th>VND</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr className={warehouseStyles.emptyRow}>
                <td colSpan={5}>Không tìm thấy phiếu</td>
              </tr>
            ) : (
              pagedRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    {formatDMY(row.dateTime)}{" "}
                    {row.dateTime.toTimeString().slice(0, 8)}
                  </td>
                  <td>
                    <button type="button" className={styles.rowLinkGreen}>
                      {row.ticketNo}
                    </button>
                  </td>
                  <td className={warehouseStyles.numCell}>{row.amount.toLocaleString("en-US")}</td>
                  <td>{row.reason}</td>
                  <td>
                    <button
                      type="button"
                      className={warehouseStyles.viewBtn}
                      title="In phiếu"
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
        labels={PAGINATION_LABELS}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {addModalType && (
        <AddCashVoucherModal
          type={addModalType}
          onClose={() => setAddModalType(null)}
          onSave={handleSaveVoucher}
        />
      )}

      {printTicket && (
        <PrintPreviewModal
          title={printTicket.type === "chi" ? "Phiếu chi tiền" : "Phiếu thu tiền"}
          ticketNo={printTicket.ticketNo}
          date={`${formatDMY(printTicket.dateTime)} ${printTicket.dateTime.toTimeString().slice(0, 8)}`}
          fields={[
            { label: "Số tiền", value: `${printTicket.amount.toLocaleString("en-US")} VND` },
            { label: "Lý do", value: printTicket.reason },
            { label: "Người tạo", value: printTicket.creator },
          ]}
          onClose={() => setPrintTicket(null)}
        />
      )}
    </div>
  );
}

export default CashVoucherPanel;
