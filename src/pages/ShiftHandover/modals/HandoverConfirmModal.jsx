import React, { useState } from "react";
import {
  X,
  Printer,
  Check,
  AlertTriangle,
} from "lucide-react";
import { STAFF_LIST, MANAGER_LIST } from "../data/shiftHandoverData";
import styles from "../ShiftHandover.module.css";

function formatMoney(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "0";
  return Number(amount).toLocaleString("vi-VN");
}

function parseMoney(val) {
  const clean = String(val).replace(/[^0-9]/g, "");
  return clean ? parseInt(clean, 10) : 0;
}

export default function HandoverConfirmModal({
  isOpen,
  onClose,
  shiftInfo,
  totalRevenue,
  onConfirmHandover,
  onPrint,
}) {
  if (!isOpen) return null;

  const defaultNextAmount = Number(shiftInfo.handoverToNextShift) || 0;
  const defaultMgrAmount = Number(shiftInfo.handoverToManager) || 0;
  const actualSafe = Number(shiftInfo.actualSafeCash) || 0;

  // 1. Next Shift Sign-off State
  const [nextReceiver, setNextReceiver] = useState(
    shiftInfo.receiver || STAFF_LIST.find((s) => s.id === "lan-anh")?.name || "Lan Anh"
  );
  const [nextAmount, setNextAmount] = useState(defaultNextAmount);
  const [nextConfirmed, setNextConfirmed] = useState(false);
  const [nextConfirmedTime, setNextConfirmedTime] = useState("");
  const [nextNote, setNextNote] = useState("");

  // 2. Manager Sign-off State
  const [managerName, setManagerName] = useState(MANAGER_LIST[0]?.name || "Nguyễn Văn Quản Lý");
  const [managerAmount, setManagerAmount] = useState(defaultMgrAmount);
  const [managerConfirmed, setManagerConfirmed] = useState(defaultMgrAmount === 0);
  const [managerConfirmedTime, setManagerConfirmedTime] = useState(
    defaultMgrAmount === 0 ? "Tự động duyệt (0 đ)" : ""
  );
  const [managerNote, setManagerNote] = useState("");

  // Cash Ledger equation
  const totalAllocated = nextAmount + managerAmount;
  const discrepancy = actualSafe - totalAllocated;

  function handleConfirmNextShift() {
    const nowStr = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setNextConfirmed(true);
    setNextConfirmedTime(nowStr);
  }

  function handleUndoNextShift() {
    setNextConfirmed(false);
    setNextConfirmedTime("");
  }

  function handleConfirmManager() {
    const nowStr = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setManagerConfirmed(true);
    setManagerConfirmedTime(nowStr);
  }

  function handleUndoManager() {
    setManagerConfirmed(false);
    setManagerConfirmedTime("");
  }

  function handleFinalSubmit() {
    if (!nextConfirmed) {
      alert("Vui lòng để Ca sau xác nhận số tiền nhận trước khi hoàn tất.");
      return;
    }
    if (managerAmount > 0 && !managerConfirmed) {
      alert("Vui lòng để Quản lý xác nhận số tiền nộp trước khi hoàn tất.");
      return;
    }

    onConfirmHandover({
      nextReceiver,
      nextAmount,
      nextConfirmedTime,
      nextNote,
      managerName,
      managerAmount,
      managerConfirmedTime,
      managerNote,
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBoxClean} onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className={styles.modalHead}>
          <div className={styles.modalTitleGroup}>
            <div className={styles.modalTitle}>
              Bàn giao ca làm việc - {shiftInfo.shiftCode}
            </div>
            <div className={styles.modalSubTitle}>
              Nhân viên giao ca: {shiftInfo.cashier} • Mở ca: 02/11/2026 11:58
            </div>
          </div>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose} title="Đóng">
            <X size={16} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className={styles.modalBody}>
          {/* 1. SIMPLE CASH BREAKDOWN TABLE */}
          <table className={styles.cashSummaryTable}>
            <tbody>
              <tr className={styles.highlightRow}>
                <td>Thực tế trong két</td>
                <td>{formatMoney(actualSafe)} VND</td>
              </tr>
              <tr>
                <td>Số tiền bàn giao cho ca sau</td>
                <td>{formatMoney(nextAmount)} VND</td>
              </tr>
              <tr>
                <td>Số tiền bàn giao cho quản lý</td>
                <td>{formatMoney(managerAmount)} VND</td>
              </tr>
              {discrepancy !== 0 && (
                <tr style={{ background: "#fef2f2" }}>
                  <td style={{ color: "#dc2626", fontWeight: 600 }}>Chênh lệch két</td>
                  <td style={{ color: "#dc2626", fontWeight: 700 }}>
                    {discrepancy > 0 ? `+${formatMoney(discrepancy)}` : formatMoney(discrepancy)} VND
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 2. TWO CONFIRMATION PANELS */}
          <div className={styles.panelsGrid}>
            {/* PANEL 1: CA SAU */}
            <div className={`${styles.confirmPanel} ${nextConfirmed ? styles.confirmPanelDone : ""}`}>
              <div className={styles.panelTitleRow}>
                <span className={styles.panelTitle}>1. Ca sau nhận tiền</span>
                {nextConfirmed ? (
                  <span className={styles.panelStatusSuccess}>Đã xác nhận ({nextConfirmedTime})</span>
                ) : (
                  <span className={styles.panelStatus}>Chưa xác nhận</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nhân viên nhận ca</label>
                <select
                  className={styles.inputControl}
                  disabled={nextConfirmed}
                  value={nextReceiver}
                  onChange={(e) => setNextReceiver(e.target.value)}
                >
                  {STAFF_LIST.filter((s) => s.id !== "all").map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số tiền nhận (VND)</label>
                <input
                  type="text"
                  className={styles.amountBox}
                  disabled={nextConfirmed}
                  value={nextAmount ? nextAmount.toLocaleString("vi-VN") : "0"}
                  onChange={(e) => setNextAmount(parseMoney(e.target.value))}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ghi chú (tuỳ chọn)</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  placeholder="Ghi chú nhận tiền..."
                  disabled={nextConfirmed}
                  value={nextNote}
                  onChange={(e) => setNextNote(e.target.value)}
                />
              </div>

              <div className={styles.panelActionArea}>
                {nextConfirmed ? (
                  <>
                    <span className={styles.confirmedText}>
                      <Check size={14} /> {nextReceiver} đã xác nhận
                    </span>
                    <button
                      type="button"
                      className={styles.reEditLink}
                      onClick={handleUndoNextShift}
                    >
                      Sửa
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.btnConfirm}
                    onClick={handleConfirmNextShift}
                  >
                    Ca sau xác nhận
                  </button>
                )}
              </div>
            </div>

            {/* PANEL 2: QUẢN LÝ */}
            <div className={`${styles.confirmPanel} ${managerConfirmed ? styles.confirmPanelDone : ""}`}>
              <div className={styles.panelTitleRow}>
                <span className={styles.panelTitle}>2. Quản lý nhận tiền</span>
                {managerConfirmed ? (
                  <span className={styles.panelStatusSuccess}>Đã xác nhận ({managerConfirmedTime})</span>
                ) : (
                  <span className={styles.panelStatus}>Chưa xác nhận</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Người nhận / duyệt</label>
                <select
                  className={styles.inputControl}
                  disabled={managerConfirmed}
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                >
                  {MANAGER_LIST.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số tiền nộp quản lý (VND)</label>
                <input
                  type="text"
                  className={styles.amountBox}
                  disabled={managerConfirmed}
                  value={managerAmount ? managerAmount.toLocaleString("vi-VN") : "0"}
                  onChange={(e) => setManagerAmount(parseMoney(e.target.value))}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ghi chú (tuỳ chọn)</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  placeholder="Ghi chú quản lý..."
                  disabled={managerConfirmed}
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                />
              </div>

              <div className={styles.panelActionArea}>
                {managerConfirmed ? (
                  <>
                    <span className={styles.confirmedText}>
                      <Check size={14} /> {managerName} đã xác nhận
                    </span>
                    <button
                      type="button"
                      className={styles.reEditLink}
                      onClick={handleUndoManager}
                    >
                      Sửa
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.btnConfirm}
                    onClick={handleConfirmManager}
                  >
                    Quản lý xác nhận
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className={styles.modalFooterClean}>
          <div className={styles.footerLeftText}>
            Trạng thái: {nextConfirmed && managerConfirmed ? "Đủ chữ ký 2 bên" : "Chờ hoàn tất xác nhận"}
          </div>

          <div className={styles.footerRightBtns}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Đóng
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onPrint}
            >
              <Printer size={14} /> In biên bản
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleFinalSubmit}
            >
              Hoàn tất bàn giao
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
