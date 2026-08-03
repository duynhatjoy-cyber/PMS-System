import { useState } from "react";
import ReportPanel from "./components/ReportPanel";
import OrderPanel from "./components/OrderPanel";
import ReceiptPanel from "./components/ReceiptPanel";
import ReturnPanel from "./components/ReturnPanel";
import DebtPanel from "./components/DebtPanel";
import Toast from "../FrontDesk/components/Toast";
import styles from "../Warehouse/Warehouse.module.css";

const TABS = [
  { key: "report", label: "Báo hàng" },
  { key: "order", label: "Đặt hàng" },
  { key: "receipt", label: "Nhập hàng" },
  { key: "return", label: "Trả lại hàng mua" },
  { key: "debt", label: "Trả nợ" },
];

function Purchasing() {
  const [activeTab, setActiveTab] = useState("report");
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
        {activeTab === "report" && <ReportPanel onToast={toast} />}
        {activeTab === "order" && <OrderPanel onToast={toast} />}
        {activeTab === "receipt" && <ReceiptPanel onToast={toast} />}
        {activeTab === "return" && <ReturnPanel onToast={toast} />}
        {activeTab === "debt" && <DebtPanel onToast={toast} />}
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default Purchasing;
