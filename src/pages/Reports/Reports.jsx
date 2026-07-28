import { useState } from "react";
import { PinOff } from "lucide-react";
import ReportCategoryCard from "./components/ReportCategoryCard";
import Toast from "../FrontDesk/components/Toast";
import { usePinnedReports } from "../../context/PinnedReportsContext";
import { REPORT_CATEGORIES } from "./data/reportsData";
import styles from "./Reports.module.css";

function Reports() {
  const { pinnedIds, isPinned, togglePin } = usePinnedReports();
  const [toastMsg, setToastMsg] = useState("");

  function handleTogglePin(item) {
    const wasPinned = isPinned(item.id);
    togglePin(item.id);
    setToastMsg(wasPinned ? `Đã bỏ ghim "${item.label}" khỏi menu Báo cáo` : `Đã ghim "${item.label}" vào menu Báo cáo`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Báo cáo</h1>
          <p className={styles.subtitle}>
            Tick chọn báo cáo bạn dùng thường xuyên để ghim nhanh vào menu Báo cáo ở thanh điều
            hướng.
          </p>
        </div>

        {pinnedIds.length > 0 && (
          <div className={styles.pinnedSummary}>
            <PinOff size={13} />
            {pinnedIds.length} báo cáo đã ghim
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {REPORT_CATEGORIES.map((category) => (
          <ReportCategoryCard
            key={category.id}
            icon={category.icon}
            title={category.title}
            items={category.items}
            isPinned={isPinned}
            onTogglePin={handleTogglePin}
          />
        ))}
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default Reports;
