import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { BANK_RECONCILE_ROWS, BANK_ACCOUNT_OPTIONS, OPENING_BANK_BALANCE } from "../../../data/bankFundData";
import { formatCurrency } from "../../../utils/format";
import EmptyState from "../../../components/EmptyState";
import warehouseStyles from "../../Warehouse/Warehouse.module.css";
import cashStyles from "../../CashFund/CashFund.module.css";

const ACCOUNT_FILTER_OPTIONS = ["Tất cả", ...BANK_ACCOUNT_OPTIONS];
const STATUS_OPTIONS = ["Chưa đối chiếu", "Đã đối chiếu", "Tất cả"];

function BankReconcilePanel({ onToast }) {
  const [accountFilter, setAccountFilter] = useState(ACCOUNT_FILTER_OPTIONS[0]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [rows, setRows] = useState(BANK_RECONCILE_ROWS);
  const [bookBalance, setBookBalance] = useState("0");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (status === "Chưa đối chiếu" && row.reconciled) return false;
      if (status === "Đã đối chiếu" && !row.reconciled) return false;
      if (accountFilter !== "Tất cả" && row.account !== accountFilter) return false;
      const q = query.trim().toLowerCase();
      if (q && !row.reason.toLowerCase().includes(q) && !row.ticketNo.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, status, accountFilter, query]);

  function updateAccount(id, account) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, account } : row)));
  }

  function handleReconcile(id) {
    const row = rows.find((r) => r.id === id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, reconciled: true } : r)));
    onToast(`Đã đối chiếu ${row.ticketNo}`);
  }

  const reconciledRows = rows.filter((r) => r.reconciled);
  const totalThu = reconciledRows.filter((r) => r.type === "thu").reduce((sum, r) => sum + r.amount, 0);
  const totalChi = reconciledRows.filter((r) => r.type === "chi").reduce((sum, r) => sum + r.amount, 0);
  const closingBooks = OPENING_BANK_BALANCE + totalThu - totalChi;
  const diff = closingBooks - (Number(bookBalance) || 0);

  return (
    <div>
      <div className={warehouseStyles.filterBar}>
        <div className={warehouseStyles.field}>
          <label className={warehouseStyles.fieldLabel}>Tài khoản ngân hàng</label>
          <select
            className={`${warehouseStyles.selectBox} ${warehouseStyles.selectArrow}`}
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
          >
            {ACCOUNT_FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className={warehouseStyles.field}>
          <label className={warehouseStyles.fieldLabel}>&nbsp;</label>
          <input
            type="text"
            className={warehouseStyles.textBox}
            placeholder="Tìm kiếm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={warehouseStyles.field}>
          <label className={warehouseStyles.fieldLabel}>Trạng thái</label>
          <select
            className={`${warehouseStyles.selectBox} ${warehouseStyles.selectArrow}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className={warehouseStyles.submitBtn} onClick={() => onToast("Đã tìm kiếm đối chiếu")}>
          <Search size={15} />
          TÌM KIẾM
        </button>
      </div>

      <div className={warehouseStyles.tableHint}>
        Đối chiếu: xác nhận một phiếu thu/chi đã khớp với giao dịch thực tế trên sao kê ngân hàng.
      </div>

      <div className={warehouseStyles.tableWrap}>
        <table className={warehouseStyles.table}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Số phiếu thu</th>
              <th>Ngày</th>
              <th>Tài khoản</th>
              <th>Lý do</th>
              <th className={warehouseStyles.numCell}>Số tiền phải trả</th>
              <th className={warehouseStyles.numCell}>Số tiền quy đổi</th>
              <th className={warehouseStyles.thActionCell} />
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr className={warehouseStyles.emptyRow}>
                <td colSpan={8}>
                  <EmptyState message="Không tìm thấy phiếu" hint="Thử đổi bộ lọc tài khoản, trạng thái hoặc từ khóa tìm kiếm." />
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.ticketNo}</td>
                  <td>{row.dateTime}</td>
                  <td>
                    <select
                      className={`${warehouseStyles.selectBox} ${warehouseStyles.selectArrow}`}
                      value={row.account}
                      onChange={(e) => updateAccount(row.id, e.target.value)}
                    >
                      {BANK_ACCOUNT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{row.reason}</td>
                  <td className={warehouseStyles.numCell}>{formatCurrency(row.amount)}</td>
                  <td className={warehouseStyles.numCell}>{formatCurrency(row.amount)}</td>
                  <td>
                    {!row.reconciled && (
                      <button
                        type="button"
                        className={warehouseStyles.addBtn}
                        title="Đối chiếu"
                        onClick={() => handleReconcile(row.id)}
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={cashStyles.reconcileSummaryGrid}>
        <div className={cashStyles.summaryBox}>
          <div className={cashStyles.summaryRow}>
            <span>I. Số dư đầu kỳ ngày:</span>
            <span>{formatCurrency(OPENING_BANK_BALANCE)}</span>
          </div>
          <div className={cashStyles.summaryRow}>
            <span>II. Tổng tiền thu đối chiếu trong kỳ:</span>
            <span>{formatCurrency(totalThu)}</span>
          </div>
          <div className={cashStyles.summaryRow}>
            <span>III. Tổng tiền chi đối chiếu trong kỳ:</span>
            <span>{formatCurrency(totalChi)}</span>
          </div>
        </div>

        <div className={cashStyles.summaryBox}>
          <div className={cashStyles.summaryRow}>
            <span>IV. Số dư cuối kỳ sau đối chiếu (I + II - III):</span>
            <span>{formatCurrency(closingBooks)}</span>
          </div>
          <div className={cashStyles.summaryRow}>
            <span>V. Số dư cuối kỳ trên sổ ngân hàng:</span>
            <input
              type="number"
              className={`${warehouseStyles.textBox} ${cashStyles.bookBalanceInput}`}
              value={bookBalance}
              onChange={(e) => setBookBalance(e.target.value)}
            />
          </div>
          <div className={`${cashStyles.summaryRow} ${cashStyles.summaryRowTotal}`}>
            <span>VI. Chênh lệch (IV - V):</span>
            <span>{formatCurrency(diff)}</span>
          </div>
        </div>
      </div>

      <div className={cashStyles.topActionBar}>
        <button
          type="button"
          className={`${warehouseStyles.submitBtn} ${cashStyles.btnWithIcon}`}
          onClick={() => onToast("Đã thực hiện đối chiếu")}
        >
          <Check size={15} />
          THỰC HIỆN
        </button>
      </div>
    </div>
  );
}

export default BankReconcilePanel;
