import { useState } from "react";
import OverviewTab from "./tabs/OverviewTab";
import ChartsTab from "./tabs/ChartsTab";
import styles from "./Statistics.module.css";

const TABS = [
  { key: "overview", label: "Thống kê" },
  { key: "charts", label: "Biểu đồ thống kê" },
];

function Statistics() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "charts" && <ChartsTab />}
      </div>
    </div>
  );
}

export default Statistics;
