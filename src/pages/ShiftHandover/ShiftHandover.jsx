import React, { useState } from "react";
import {
  Cloud,
  Printer,
  Handshake,
  CheckCircle2,
} from "lucide-react";
import HandoverCashTab from "./components/HandoverCashTab";
import ShiftPaymentsTab from "./components/ShiftPaymentsTab";
import HandoverConfirmModal from "./modals/HandoverConfirmModal";
import {
  DEFAULT_SHIFT_INFO,
  SHIFT_TRANSACTIONS,
} from "./data/shiftHandoverData";
import styles from "./ShiftHandover.module.css";

export default function ShiftHandover() {
  const [activeTab, setActiveTab] = useState("handover"); // 'handover' | 'payments'
  const [shiftInfo, setShiftInfo] = useState(DEFAULT_SHIFT_INFO);
  const [transactions] = useState(SHIFT_TRANSACTIONS);

  // Filters for Payments Tab
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedSubSystem, setSelectedSubSystem] = useState("all");

  // Modals & Feedback
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  function handleUpdateShiftInfo(patch) {
    setShiftInfo((prev) => ({ ...prev, ...patch }));
  }

  // Calculate total revenue from transactions
  const totalRevenue = transactions.reduce((acc, tx) => {
    return acc + (tx.type === "out" ? -tx.amount : tx.amount);
  }, 0);

  function handleConfirmHandover(data) {
    if (data) {
      setShiftInfo((prev) => ({
        ...prev,
        receiver: data.nextReceiver,
        handoverToNextShift: data.nextAmount,
        handoverToManager: data.managerAmount,
        managerName: data.managerName,
        isClosed: true,
      }));
      setIsConfirmOpen(false);
      showToast(
        `Chốt ${shiftInfo.shiftCode} thành công! Ca sau (${data.nextReceiver}) & Quản lý (${data.managerName}) đã xác nhận đủ số tiền bàn giao.`
      );
    } else {
      setIsConfirmOpen(false);
      showToast(`Bàn giao ${shiftInfo.shiftCode} thành công! Đã chốt két và lưu biên bản.`);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className={styles.page}>
      {/* 1. TOP NAVIGATION & INFO BAR */}
      <div className={styles.topNav}>
        <div className={styles.tabsGroup}>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "handover" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("handover")}
          >
            Bàn giao
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "payments" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("payments")}
          >
            Thanh toán trong ca
          </button>
        </div>

        <div className={styles.topRightInfo}>
          <span className={styles.openTimeText}>
            Thời gian mở ca: 02/11/2026 11:58
          </span>
          <div className={styles.headerIconBtns}>
            <button
              type="button"
              className={styles.iconBtn}
              title="Đồng bộ / Tải dữ liệu"
              onClick={() => showToast("Đã làm mới dữ liệu ca làm việc")}
            >
              <Cloud size={16} />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              title="In biên bản bàn giao"
              onClick={handlePrint}
            >
              <Printer size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className={styles.contentArea}>
        {activeTab === "handover" ? (
          <>
            <HandoverCashTab
              shiftInfo={shiftInfo}
              onUpdateShiftInfo={handleUpdateShiftInfo}
              onOpenConfirmModal={() => setIsConfirmOpen(true)}
              onSwitchToPayments={() => setActiveTab("payments")}
            />

            {/* TAB 1 FOOTER BAR */}
            <div className={styles.footerBar}>
              <div className={styles.footerNotes}>
                <span className={styles.noteHeading}>* Chú thích</span>
                <span className={styles.formulaPill}>4 = 1 + 2 - 3</span>
                <span className={styles.formulaPill}>5 = 4 - 6</span>
                <span className={styles.formulaPill}>6 = 7 + 8</span>
              </div>

              <button
                type="button"
                className={styles.handoverActionBtn}
                onClick={() => setIsConfirmOpen(true)}
              >
                <Handshake size={18} />
                <span>Bàn giao</span>
              </button>
            </div>
          </>
        ) : (
          <ShiftPaymentsTab
            shiftInfo={shiftInfo}
            transactions={transactions}
            selectedStaff={selectedStaff}
            onChangeStaff={setSelectedStaff}
            selectedMethod={selectedMethod}
            onChangeMethod={setSelectedMethod}
            selectedSubSystem={selectedSubSystem}
            onChangeSubSystem={setSelectedSubSystem}
          />
        )}
      </div>

      {/* 3. CONFIRM MODAL */}
      <HandoverConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        shiftInfo={shiftInfo}
        totalRevenue={totalRevenue}
        onConfirmHandover={handleConfirmHandover}
        onPrint={handlePrint}
      />

      {/* 4. TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13.5,
            zIndex: 9999,
          }}
        >
          <CheckCircle2 size={18} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

