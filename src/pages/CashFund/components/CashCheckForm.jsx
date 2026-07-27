import { useState } from "react";
import { CreditCard, Calendar, Clock, Plus, Trash2, Check, X, ArrowRight } from "lucide-react";
import shared from "../../FrontDesk/modals/shared.module.css";
import { CASH_DENOMINATIONS, computeCashBalance } from "../../../data/cashFundData";
import { formatDMY } from "../../../utils/format";
import warehouseModalStyles from "../../Warehouse/modals/WarehouseModal.module.css";
import styles from "../CashFund.module.css";

function generateTicketNo(existingCount) {
  return `KK${existingCount + 1}`;
}

function emptyDenomLine(id) {
  return { id, denom: CASH_DENOMINATIONS[0], qty: "", note: "" };
}

function CashCheckForm({ existingCount, onCancel, onSave }) {
  const [checkDate] = useState(() => new Date());
  const [checkTime, setCheckTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [refInvoice, setRefInvoice] = useState("");
  const [innerTab, setInnerTab] = useState("details");
  const [denomLines, setDenomLines] = useState([]);
  const [nextId, setNextId] = useState(1);

  const ticketNo = generateTicketNo(existingCount);
  const cashBalance = computeCashBalance();

  function addDenomLine() {
    setDenomLines((prev) => [...prev, emptyDenomLine(nextId)]);
    setNextId((n) => n + 1);
  }

  function updateDenomLine(id, patch) {
    setDenomLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function removeDenomLine(id) {
    setDenomLines((prev) => prev.filter((line) => line.id !== id));
  }

  const countedTotal = denomLines.reduce((sum, l) => sum + (Number(l.qty) || 0) * l.denom, 0);
  const diff = countedTotal - cashBalance;
  const diffLabel = diff === 0 ? "Đủ" : diff > 0 ? "Thừa" : "Thiếu";

  function handleExecute() {
    onSave({
      id: ticketNo,
      ticketNo,
      checkDate: formatDMY(checkDate),
      checkTime: checkTime || checkDate.toTimeString().slice(0, 8),
      dueDate: formatDMY(checkDate),
      purpose,
      voided: false,
    });
  }

  return (
    <div>
      <div className={styles.formHeader}>
        <CreditCard size={20} />
        <span>Phiếu kiểm kê</span>
      </div>

      <div className={styles.formBody}>
        <div className={styles.infoGrid}>
          <div>
            <div className={styles.infoCardTitle}>THÔNG TIN CHUNG</div>
            <div className={warehouseModalStyles.field}>
              <input
                type="text"
                className={warehouseModalStyles.underlineInput}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Mục đích"
              />
            </div>
            <div className={styles.infoFieldRow}>
              <div className={warehouseModalStyles.field}>
                <input
                  type="text"
                  className={warehouseModalStyles.underlineInput}
                  value={refInvoice}
                  onChange={(e) => setRefInvoice(e.target.value)}
                  placeholder="Hóa đơn tham chiếu"
                />
              </div>
              <div className={warehouseModalStyles.field}>
                <label className={warehouseModalStyles.label}>Kiểm kê đến ngày</label>
                <div className={warehouseModalStyles.datetimeRow}>
                  <span>{formatDMY(checkDate)}</span>
                  <Calendar size={14} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.infoCardTitle}>CHỨNG TỪ</div>
            <div className={warehouseModalStyles.field}>
              <label className={warehouseModalStyles.label}>Số phiếu KK</label>
              <div className={styles.ticketNoValue}>{ticketNo}</div>
            </div>
            <div className={styles.infoFieldRow}>
              <div className={warehouseModalStyles.field}>
                <label className={warehouseModalStyles.label}>Ngày kiểm kê</label>
                <div className={warehouseModalStyles.datetimeRow}>
                  <span>{formatDMY(checkDate)}</span>
                  <Calendar size={14} />
                </div>
              </div>
              <div className={warehouseModalStyles.field}>
                <label className={warehouseModalStyles.label}>Giờ kiểm kê</label>
                <div className={warehouseModalStyles.datetimeRow}>
                  <input
                    type="text"
                    className={warehouseModalStyles.underlineInput}
                    style={{ flex: 1 }}
                    value={checkTime}
                    onChange={(e) => setCheckTime(e.target.value)}
                    placeholder=""
                  />
                  <Clock size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={warehouseModalStyles.innerTabs}>
          <button
            type="button"
            className={`${warehouseModalStyles.innerTab} ${
              innerTab === "details" ? warehouseModalStyles.innerTabActive : ""
            }`}
            onClick={() => setInnerTab("details")}
          >
            Chi tiết
          </button>
          <button
            type="button"
            className={`${warehouseModalStyles.innerTab} ${
              innerTab === "members" ? warehouseModalStyles.innerTabActive : ""
            }`}
            onClick={() => setInnerTab("members")}
          >
            Thành viên tham gia
          </button>
        </div>

        {innerTab === "details" ? (
          <div className={warehouseModalStyles.tableWrap}>
            <table className={warehouseModalStyles.table}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th colSpan={2}>Đơn giá / Số lượng</th>
                  <th>Số tiền</th>
                  <th>Mô tả</th>
                  <th className={warehouseModalStyles.thAction} />
                </tr>
              </thead>
              <tbody>
                <tr className={styles.checkTableRow}>
                  <td>I</td>
                  <td colSpan={2}>Số dư theo sổ quỹ tiền mặt (VND)</td>
                  <td className={warehouseModalStyles.thanhTien}>
                    {cashBalance.toLocaleString("en-US")}
                  </td>
                  <td />
                  <td />
                </tr>

                <tr className={`${styles.checkTableRow} ${styles.editableRow}`}>
                  <td>II</td>
                  <td colSpan={2}>Số kiểm kê thực tế tiền (VND)</td>
                  <td className={warehouseModalStyles.thanhTien}>
                    {countedTotal.toLocaleString("en-US")}
                  </td>
                  <td />
                  <td>
                    <button type="button" className={warehouseModalStyles.addRowBtn} onClick={addDenomLine}>
                      <Plus size={16} />
                    </button>
                  </td>
                </tr>

                {denomLines.map((line) => (
                  <tr key={line.id} className={styles.denomRow}>
                    <td />
                    <td colSpan={2}>
                      <div className={warehouseModalStyles.chipCell}>
                        <select
                          className={warehouseModalStyles.chipSelect}
                          value={line.denom}
                          onChange={(e) => updateDenomLine(line.id, { denom: Number(e.target.value) })}
                        >
                          {CASH_DENOMINATIONS.map((d) => (
                            <option key={d} value={d}>
                              {d.toLocaleString("en-US")}đ
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="0"
                          className={warehouseModalStyles.numInput}
                          value={line.qty}
                          onChange={(e) => updateDenomLine(line.id, { qty: e.target.value })}
                          placeholder="Số tờ"
                        />
                      </div>
                    </td>
                    <td className={warehouseModalStyles.thanhTien}>
                      {((Number(line.qty) || 0) * line.denom).toLocaleString("en-US")}
                    </td>
                    <td>
                      <input
                        type="text"
                        className={warehouseModalStyles.textInput}
                        value={line.note}
                        onChange={(e) => updateDenomLine(line.id, { note: e.target.value })}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={warehouseModalStyles.removeBtn}
                        onClick={() => removeDenomLine(line.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}

                <tr className={styles.checkTableRow}>
                  <td>IV</td>
                  <td colSpan={2}>Chênh lệch</td>
                  <td className={warehouseModalStyles.thanhTien}>
                    VND {Math.abs(diff).toLocaleString("en-US")}
                  </td>
                  <td />
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className={warehouseModalStyles.tableWrap}>
            <table className={warehouseModalStyles.table}>
              <thead>
                <tr>
                  <th>Nhân viên</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: "center", color: "var(--fd-text-muted)" }}>
                    Chưa có thành viên tham gia
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.bottomBar}>
          <span className={styles.diffLabel}>
            <ArrowRight size={16} />
            {diffLabel} VND {Math.abs(diff).toLocaleString("en-US")}
          </span>
          <div className={styles.bottomActions}>
            <button
              type="button"
              className={`${shared.btn} ${shared.btnPrimary} ${styles.btnWithIcon}`}
              onClick={handleExecute}
            >
              <Check size={15} />
              THỰC HIỆN
            </button>
            <button
              type="button"
              className={`${shared.btn} ${warehouseModalStyles.btnWarning} ${styles.btnWithIcon}`}
              onClick={onCancel}
            >
              <X size={15} />
              BỎ QUA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashCheckForm;
