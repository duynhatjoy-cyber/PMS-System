import { useState } from "react";
import CashVoucherPanel from "./components/CashVoucherPanel";
import CashCheckPanel from "./components/CashCheckPanel";
import CashLedgerPanel from "./components/CashLedgerPanel";
import Toast from "../FrontDesk/components/Toast";
import styles from "../Warehouse/Warehouse.module.css";

const TABS = [
  { key: "voucher", label: "Lập phiếu thu chi" },
  { key: "check", label: "Kiểm kê" },
  { key: "ledger", label: "Sổ chi tiết tiền mặt" },
];

function CashFund() {
  const [activeTab, setActiveTab] = useState("voucher");
  const [toastMsg, setToastMsg] = useState("");

  function toast(message) {
    setToastMsg(message);
  }

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {activeTab === "voucher" && <CashVoucherPanel onToast={toast} />}
        {activeTab === "check" && <CashCheckPanel onToast={toast} />}
        {activeTab === "ledger" && <CashLedgerPanel onToast={toast} />}
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default CashFund;
