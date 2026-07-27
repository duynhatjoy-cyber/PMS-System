import { useState } from "react";
import StockInPanel from "./components/StockInPanel";
import StockOutPanel from "./components/StockOutPanel";
import StockTransferPanel from "./components/StockTransferPanel";
import StockCheckPanel from "./components/StockCheckPanel";
import StockSummaryPanel from "./components/StockSummaryPanel";
import Toast from "../FrontDesk/components/Toast";
import styles from "./Warehouse.module.css";

const TABS = [
  { key: "in", label: "Nhập kho" },
  { key: "out", label: "Xuất kho" },
  { key: "transfer", label: "Chuyển kho" },
  { key: "check", label: "Kiểm kê kho" },
  { key: "summary", label: "Tổng hợp tồn kho" },
];

function Warehouse() {
  const [activeTab, setActiveTab] = useState("in");
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
        {activeTab === "in" && <StockInPanel onToast={toast} />}
        {activeTab === "out" && <StockOutPanel onToast={toast} />}
        {activeTab === "transfer" && <StockTransferPanel onToast={toast} />}
        {activeTab === "check" && <StockCheckPanel onToast={toast} />}
        {activeTab === "summary" && <StockSummaryPanel onToast={toast} />}
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default Warehouse;
