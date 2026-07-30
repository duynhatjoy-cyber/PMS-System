import { useMemo, useState } from "react";
import { Clock, User, List, DollarSign, MessageSquare, Plus, Printer } from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import PrintPreviewModal from "../../Warehouse/modals/PrintPreviewModal";
import AddFundVoucherModal from "./AddFundVoucherModal";
import EmptyState from "../../../components/EmptyState";
import { formatDMY, formatCurrency, startOfDay } from "../../../utils/format";
import { LEDGER_PAGINATION_LABELS, paginate } from "../../../utils/pagination";
import warehouseStyles from "../../Warehouse/Warehouse.module.css";
import styles from "../../CashFund/CashFund.module.css";

const today = startOfDay(new Date());

// Shared "Lập phiếu thu chi" voucher list for BankFund and CashFund. The only
// real difference between the two pages is the extra "Tài khoản" column/field
// bank vouchers have (driven entirely by whether `accountOptions` is passed),
// plus the amount-column label and the modal's ticket-prefix/unit-suffix
// wording, all passed in as config from the thin per-page wrappers.
function FundVoucherPanel({
  onToast,
  initialRows,
  voucherTypes,
  accountOptions,
  ticketPrefixThu,
  ticketPrefixChi,
  unitSuffix,
  amountColumnLabel,
}) {
  const [preset, setPreset] = useState("Hôm nay");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [docType, setDocType] = useState(voucherTypes[1]);
  const [rows, setRows] = useState(initialRows);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addModalType, setAddModalType] = useState(null);
  const [printTicket, setPrintTicket] = useState(null);

  const filteredRows = useMemo(() => {
    if (docType === "Tất cả") return rows;
    const wantType = docType === "Phiếu chi tiền" ? "chi" : "thu";
    return rows.filter((row) => row.type === wantType);
  }, [rows, docType]);

  const pagedRows = useMemo(() => paginate(filteredRows, page, pageSize), [filteredRows, page, pageSize]);

  function handleSaveVoucher(voucher) {
    setRows((prev) => [voucher, ...prev]);
    setAddModalType(null);
    onToast(voucher.type === "chi" ? "Đã lập phiếu chi tiền" : "Đã lập phiếu thu tiền");
  }

  const columnCount = accountOptions ? 6 : 5;

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
            className={`${warehouseStyles.selectBox} ${warehouseStyles.selectArrow}`}
            value={docType}
            onChange={(e) => {
              setDocType(e.target.value);
              setPage(1);
            }}
          >
            {voucherTypes.map((opt) => (
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
              {accountOptions && (
                <th>
                  <span className={warehouseStyles.thLabel}>
                    <User size={14} /> Tài khoản
                  </span>
                </th>
              )}
              <th>
                <span className={warehouseStyles.thLabel}>
                  <List size={14} /> Số chứng từ
                </span>
              </th>
              <th>
                <span className={warehouseStyles.thLabel}>
                  <DollarSign size={14} /> {amountColumnLabel}
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
              {accountOptions && <th />}
              <th />
              <th>VND</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr className={warehouseStyles.emptyRow}>
                <td colSpan={columnCount}>
                  <EmptyState message="Không tìm thấy phiếu" hint="Nhấn nút + ở góc trên để lập phiếu mới." />
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    {formatDMY(row.dateTime)} {row.dateTime.toTimeString().slice(0, 8)}
                  </td>
                  {accountOptions && <td>{row.account}</td>}
                  <td>
                    <button type="button" className={styles.rowLinkGreen}>
                      {row.ticketNo}
                    </button>
                  </td>
                  <td className={warehouseStyles.numCell}>{formatCurrency(row.amount)}</td>
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
        labels={LEDGER_PAGINATION_LABELS}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {addModalType && (
        <AddFundVoucherModal
          type={addModalType}
          accountOptions={accountOptions}
          ticketPrefixThu={ticketPrefixThu}
          ticketPrefixChi={ticketPrefixChi}
          unitSuffix={unitSuffix}
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
            ...(accountOptions ? [{ label: "Tài khoản", value: printTicket.account }] : []),
            { label: "Số tiền", value: formatCurrency(printTicket.amount) },
            { label: "Lý do", value: printTicket.reason },
            { label: "Người tạo", value: printTicket.creator },
          ]}
          onClose={() => setPrintTicket(null)}
        />
      )}
    </div>
  );
}

export default FundVoucherPanel;
