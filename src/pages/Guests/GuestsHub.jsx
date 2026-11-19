import { useState } from "react";
import { Users, Award, UserRound } from "lucide-react";
import Guests from "./Guests";
import GuestClassification from "./GuestClassification";
import Groups from "../Groups/Groups";
import styles from "./GuestsHub.module.css";

const TABS = [
  { key: "groups", label: "Nhóm & Allotment", icon: UserRound },
  { key: "guests", label: "Danh sách khách", icon: Users },
  { key: "classification", label: "Phân loại khách hàng", icon: Award },
];

function GuestsHub() {
  const [tabKey, setTabKey] = useState("groups");

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

      {tabKey === "groups" ? <Groups /> : tabKey === "guests" ? <Guests /> : <GuestClassification />}
    </div>
  );
}

export default GuestsHub;
