import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { BANK_ACCOUNT_OPTIONS } from "../../../data/bankFundData";
import { formatDateTimeDMY } from "../../../utils/format";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

function generateTicketNo(type) {
  const prefix = type === "chi" ? "PCG" : "PTG";
  return `${prefix}${Math.floor(10000 + Math.random() * 89999)}`;
}

function AddBankVoucherModal({ type, onClose, onSave }) {
  const [voucherDate] = useState(() => new Date());
  const [account, setAccount] = useState(BANK_ACCOUNT_OPTIONS[0]);
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const title = type === "chi" ? "Lập phiếu chi tiền" : "Lập phiếu thu tiền";
  const canSave = target.trim() && Number(amount) > 0;

  function handleSave() {
    if (!canSave) return;
    const ticketNo = generateTicketNo(type);
    onSave({
      id: ticketNo,
      ticketNo,
      dateTime: voucherDate,
      account,
      amount: Number(amount),
      reason:
        reason ||
        `${target} ${type === "chi" ? "nhận chi" : "nộp"} VND ${Number(amount).toLocaleString(
          "en-US"
        )} (Chuyển khoản NH)`,
      type,
      creator: target,
    });
  }

  return (
    <ModalShell title={title} onClose={onClose} tone="brand" width={640}>
      <div className={styles.formGrid}>
        <div>
          <div className={styles.field}>
            <label className={styles.label}>Đối tượng (*)</label>
            <input
              type="text"
              className={styles.underlineInput}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Tên khách / nhân viên"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tài khoản</label>
            <select
              className={styles.underlineSelect}
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            >
              {BANK_ACCOUNT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Số tiền (*)</label>
            <input
              type="number"
              min="0"
              className={styles.underlineInput}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <div className={styles.field}>
            <div className={styles.readonlyBox}>Mã</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ngày lập</label>
            <div className={styles.datetimeRow}>
              <span>{formatDateTimeDMY(voucherDate)}</span>
              <Calendar size={14} />
              <Clock size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Lý do</label>
        <input
          type="text"
          className={styles.underlineInput}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Diễn giải"
        />
      </div>

      <div className={styles.footerBtns}>
        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary}`}
          disabled={!canSave}
          onClick={handleSave}
        >
          LƯU
        </button>
        <button type="button" className={`${shared.btn} ${styles.btnWarning}`} onClick={onClose}>
          BỎ QUA
        </button>
      </div>
    </ModalShell>
  );
}

export default AddBankVoucherModal;
