import React, { useState } from "react";
import {
  BellOff,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  HandCoins,
  AlertTriangle,
} from "lucide-react";
import styles from "../ShiftHandover.module.css";

function formatNumber(val) {
  if (val === null || val === undefined || isNaN(val)) return "-";
  if (val === 0) return "-";
  return Number(val).toLocaleString("vi-VN");
}

function parseInputNumber(val) {
  const clean = String(val).replace(/[^0-9]/g, "");
  return clean ? parseInt(clean, 10) : 0;
}

export default function HandoverCashTab({
  shiftInfo,
  onUpdateShiftInfo,
  onOpenConfirmModal,
  onSwitchToPayments,
}) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskRoom, setNewTaskRoom] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  // Cash Ledger Dynamic Calculations
  // Line 1: Đầu ca
  const startCash = Number(shiftInfo.startCash) || 0;
  // Line 2: Tổng thu
  const totalCashIn = Number(shiftInfo.totalCashIn) || 0;
  // Line 3: Tổng chi
  const totalCashOut = Number(shiftInfo.totalCashOut) || 0;
  // Line 4: Số tiền hiện tại = 1 + 2 - 3
  const currentCash = startCash + totalCashIn - totalCashOut;
  // Line 6: Thực tế trong két
  const actualSafeCash = Number(shiftInfo.actualSafeCash) || 0;
  // Line 5: Chênh lệch với két = 4 - 6
  const discrepancy = currentCash - actualSafeCash;
  // Line 7: Bàn giao ca sau
  const handoverNext = Number(shiftInfo.handoverToNextShift) || 0;
  // Line 8: Bàn giao quản lý
  const handoverManager = Number(shiftInfo.handoverToManager) || 0;

  function handleActualChange(val) {
    const num = parseInputNumber(val);
    onUpdateShiftInfo({
      actualSafeCash: num,
      // Default to keep handover to next shift = actual, handover manager = 0
      handoverToNextShift: num,
      handoverToManager: 0,
    });
  }

  function handleNextShiftChange(val) {
    const nextVal = parseInputNumber(val);
    const mgrVal = Math.max(0, actualSafeCash - nextVal);
    onUpdateShiftInfo({
      handoverToNextShift: nextVal,
      handoverToManager: mgrVal,
    });
  }

  function handleManagerChange(val) {
    const mgrVal = parseInputNumber(val);
    const nextVal = Math.max(0, actualSafeCash - mgrVal);
    onUpdateShiftInfo({
      handoverToManager: mgrVal,
      handoverToNextShift: nextVal,
    });
  }

  function handleToggleTask(id) {
    const updated = (shiftInfo.tasks || []).map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    onUpdateShiftInfo({ tasks: updated });
  }

  function handleDeleteTask(id) {
    const updated = (shiftInfo.tasks || []).filter((t) => t.id !== id);
    onUpdateShiftInfo({ tasks: updated });
  }

  function handleAddNewTask(e) {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskText.trim(),
      room: newTaskRoom.trim(),
      urgent: isUrgent,
      completed: false,
    };
    onUpdateShiftInfo({
      tasks: [...(shiftInfo.tasks || []), newTask],
    });
    setNewTaskText("");
    setNewTaskRoom("");
    setIsUrgent(false);
    setShowAddTask(false);
  }

  return (
    <div className={styles.handoverGrid}>
      {/* LEFT SECTION: BÀN GIAO TIỀN MẶT */}
      <div className={styles.leftCashSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Bàn giao tiền mặt</span>
          <span className={styles.currencyLabel}>VND</span>
        </div>

        <div className={styles.cashTable}>
          {/* Row 1: Đầu ca */}
          <div className={styles.cashRow}>
            <div className={styles.cashLabelCol}>
              <span className={styles.rowNumber}>1</span>
              <span>Đầu ca</span>
            </div>
            <div className={styles.cashValueCol}>{formatNumber(startCash)}</div>
          </div>

          {/* Row 2: Tổng thu */}
          <div className={styles.cashRow}>
            <div className={styles.cashLabelCol}>
              <span className={styles.rowNumber}>2</span>
              <span
                className={styles.blueLink}
                onClick={onSwitchToPayments}
                title="Nhấn để xem thanh toán trong ca"
              >
                Tổng thu
              </span>
            </div>
            <div className={styles.cashValueCol}>
              {totalCashIn > 0 ? (
                <span className={styles.greenMoney}>{formatNumber(totalCashIn)}</span>
              ) : (
                "-"
              )}
            </div>
          </div>

          {/* Row 3: Tổng chi */}
          <div className={styles.cashRow}>
            <div className={styles.cashLabelCol}>
              <span className={styles.rowNumber}>3</span>
              <span
                className={styles.blueLink}
                onClick={onSwitchToPayments}
                title="Nhấn để xem chi phí trong ca"
              >
                Tổng chi
              </span>
            </div>
            <div className={styles.cashValueCol}>
              {totalCashOut > 0 ? formatNumber(totalCashOut) : "-"}
            </div>
          </div>

          {/* Row 4: Số tiền hiện tại */}
          <div className={`${styles.cashRow} ${styles.currentMoneyRow}`}>
            <div className={styles.cashLabelCol}>
              <span className={styles.rowNumber}>4</span>
              <span>Số tiền hiện tại</span>
            </div>
            <div className={styles.cashValueCol}>{formatNumber(currentCash)}</div>
          </div>

          {/* Row 5: Chênh lệch với két */}
          <div className={styles.cashRow}>
            <div className={styles.cashLabelCol}>
              <span className={styles.rowNumber}>5</span>
              <span>Chênh lệch với két</span>
            </div>
            <div className={styles.cashValueCol}>
              {discrepancy === 0 ? (
                "-"
              ) : (
                <span className={styles.discrepancyBad}>
                  {discrepancy > 0 ? `+${formatNumber(discrepancy)}` : formatNumber(discrepancy)}
                </span>
              )}
            </div>
          </div>

          {/* Row 6: Thực tế trong két */}
          <div className={styles.cashRow}>
            <div className={styles.cashLabelCol}>
              <span className={styles.rowNumber}>6</span>
              <span>Thực tế trong két</span>
            </div>
            <div className={styles.cashValueCol}>
              <input
                type="text"
                className={styles.cashInputBox}
                value={actualSafeCash ? actualSafeCash.toLocaleString("vi-VN") : "0"}
                onChange={(e) => handleActualChange(e.target.value)}
              />
            </div>
          </div>

          {/* Row 7: Bàn giao cho ca sau */}
          <div className={styles.cashRow}>
            <div className={styles.cashLabelCol}>
              <span className={styles.rowNumber}>7</span>
              <span>Bàn giao cho ca sau</span>
            </div>
            <div className={styles.cashValueCol}>
              <input
                type="text"
                className={styles.cashInputBox}
                value={handoverNext ? handoverNext.toLocaleString("vi-VN") : "0"}
                onChange={(e) => handleNextShiftChange(e.target.value)}
              />
            </div>
          </div>

          {/* Row 8: Bàn giao cho quản lý */}
          <div className={styles.cashRow}>
            <div className={styles.cashLabelCol}>
              <span className={styles.rowNumber}>8</span>
              <span>Bàn giao cho quản lý</span>
            </div>
            <div className={styles.cashValueCol}>
              <input
                type="text"
                className={styles.cashInputBox}
                value={handoverManager ? handoverManager.toLocaleString("vi-VN") : "0"}
                onChange={(e) => handleManagerChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: CÔNG VIỆC BÀN GIAO & NGƯỜI NHẬN */}
      <div className={styles.rightTaskSection}>
        <div className={styles.taskTopArea}>
          <div className={styles.taskHeader}>
            <span className={styles.taskTitle}>Công việc bàn giao</span>
            <button
              type="button"
              className={styles.addTaskBtn}
              onClick={() => setShowAddTask(true)}
            >
              <Plus size={13} /> Thêm việc
            </button>
          </div>

          {/* Form thêm việc nhanh */}
          {showAddTask && (
            <form onSubmit={handleAddNewTask} style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Nội dung công việc cần giao..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  fontSize: 12.5,
                  border: "1px solid #0284c7",
                  borderRadius: 4,
                  outline: "none",
                  marginBottom: 6,
                }}
              />
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Phòng (tuỳ chọn)"
                  value={newTaskRoom}
                  onChange={(e) => setNewTaskRoom(e.target.value)}
                  style={{
                    width: 100,
                    padding: "4px 8px",
                    fontSize: 12,
                    border: "1px solid #cbd5e1",
                    borderRadius: 4,
                  }}
                />
                <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                  />
                  Gấp
                </label>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    style={{
                      border: "none",
                      background: "#f1f5f9",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    style={{
                      border: "none",
                      background: "#0284c7",
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Task list or Empty state */}
          {(!shiftInfo.tasks || shiftInfo.tasks.length === 0) ? (
            <div className={styles.emptyTaskState}>
              <BellOff className={styles.emptyTaskIcon} />
              <div className={styles.emptyTaskText}>Không có việc cần bàn giao</div>
            </div>
          ) : (
            <div className={styles.taskList}>
              {shiftInfo.tasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                  <div
                    className={styles.taskCheck}
                    onClick={() => handleToggleTask(task.id)}
                  >
                    {task.completed ? (
                      <CheckSquare size={16} color="#0284c7" />
                    ) : (
                      <Square size={16} color="#94a3b8" />
                    )}
                  </div>
                  <div
                    className={`${styles.taskContent} ${
                      task.completed ? styles.taskContentDone : ""
                    }`}
                  >
                    {task.title}
                    {task.room && (
                      <span style={{ fontWeight: 600, color: "#0284c7", marginLeft: 4 }}>
                        (P.{task.room})
                      </span>
                    )}
                    {task.urgent && (
                      <span className={styles.taskUrgentBadge}>GẤP</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.taskDeleteBtn}
                    onClick={() => handleDeleteTask(task.id)}
                    title="Xoá việc này"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: NGƯỜI NHẬN & GHI CHÚ */}
        <div className={styles.handoverFormBottom}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Người nhận</label>
            <input
              type="text"
              className={styles.receiverInput}
              placeholder="Nhập tên nhân viên nhận ca..."
              value={shiftInfo.receiver || ""}
              onChange={(e) => onUpdateShiftInfo({ receiver: e.target.value })}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Ghi chú</label>
            <textarea
              className={styles.noteTextarea}
              placeholder="Ghi chú bàn giao ca..."
              value={shiftInfo.notes || ""}
              onChange={(e) => onUpdateShiftInfo({ notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

