import { useState } from "react";
import { Users, UserRound } from "lucide-react";
import Guests from "./Guests";
import Groups from "../Groups/Groups";
import styles from "./GuestsHub.module.css";

const TABS = [
  { key: "guests", label: "Danh sách khách", icon: Users },
  { key: "groups", label: "Danh sách đoàn", icon: UserRound },
];

// "Khách" và "Nhóm" (khách lẻ ↔ khách đoàn quan hệ nhiều-nhiều, xem
// groupData.js) gộp vào 1 trang, 2 tab thay vì 2 sidebar item/route riêng.
function GuestsHub() {
  const [tabKey, setTabKey] = useState("guests");

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tab} ${tab.key === tabKey ? styles.tabActive : ""}`}
              onClick={() => setTabKey(tab.key)}
            >
              <TabIcon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabKey === "guests" ? <Guests /> : <Groups />}
    </div>
  );
}

export default GuestsHub;
