import { useState } from "react";
import ChannelReport from "./panels/ChannelReport";
import RevenueDetailReport from "./panels/RevenueDetailReport";
import styles from "./Reports.module.css";

const TABS = [
  { key: "channel", label: "Báo cáo kênh" },
  { key: "revenue-detail", label: "Doanh thu chi tiết" },
];

function Reports() {
  const [tab, setTab] = useState("channel");

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            className={tab === t.key ? styles.tabActive : styles.tab}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "channel" ? <ChannelReport /> : <RevenueDetailReport />}
    </div>
  );
}

export default Reports;
