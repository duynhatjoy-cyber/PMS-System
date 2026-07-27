import { useState } from "react";
import BankVoucherPanel from "./components/BankVoucherPanel";
import BankReconcilePanel from "./components/BankReconcilePanel";
import BankLedgerPanel from "./components/BankLedgerPanel";
import Toast from "../FrontDesk/components/Toast";
import styles from "../Warehouse/Warehouse.module.css";

const TABS = [
  { key: "voucher", label: "Lập phiếu thu chi" },
  { key: "reconcile", label: "Đối chiếu" },
  { key: "ledger", label: "Sổ chi tiết tiền gửi" },
];

function BankFund() {
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
        {activeTab === "voucher" && <BankVoucherPanel onToast={toast} />}
        {activeTab === "reconcile" && <BankReconcilePanel onToast={toast} />}
        {activeTab === "ledger" && <BankLedgerPanel onToast={toast} />}
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default BankFund;
