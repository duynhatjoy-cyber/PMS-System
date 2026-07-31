import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, UserRound } from "lucide-react";
import Guests from "./Guests";
import Groups from "../Groups/Groups";
import styles from "./GuestsHub.module.css";

const TABS = [
  { key: "guests", label: "Danh sách khách", path: "/le-tan/khach", icon: Users },
  { key: "groups", label: "Danh sách đoàn", path: "/le-tan/nhom", icon: UserRound },
];

// "Khách" và "Nhóm" là 2 mục riêng trên sidebar nhưng cùng phục vụ 1 khái
// niệm (khách lẻ ↔ khách đoàn quan hệ nhiều-nhiều, xem groupData.js) nên gộp
// vào 1 trang, 2 tab thay vì 2 trang tách biệt — mỗi sidebar item vẫn có
// route riêng, chỉ khác tab mặc định khi vào trang.
function GuestsHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabKey, setTabKey] = useState(() => (location.pathname === "/le-tan/nhom" ? "groups" : "guests"));

  function selectTab(tab) {
    setTabKey(tab.key);
    navigate(tab.path, { replace: true });
  }

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
              onClick={() => selectTab(tab)}
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
