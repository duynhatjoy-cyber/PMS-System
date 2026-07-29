import { useState } from "react";
import { Globe2, IdCard, LayoutGrid, Palette, Tags, Users2 } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import CardFieldsPanel from "./components/CardFieldsPanel";
import RoomColorsPanel from "./components/RoomColorsPanel";
import SourceGroupsPanel from "./components/SourceGroupsPanel";
import CustomerSegmentsPanel from "./components/CustomerSegmentsPanel";
import styles from "./BookingConfig.module.css";

const TABS = [
  {
    key: "roomMap",
    label: "Sơ đồ phòng",
    icon: LayoutGrid,
    subNav: [
      { key: "cardFields", label: "Thông tin hiển thị", icon: IdCard },
      { key: "roomColors", label: "Màu đặt phòng", icon: Palette },
    ],
  },
  {
    key: "bookingTypes",
    label: "Phân loại booking",
    icon: Tags,
    subNav: [
      { key: "sourceGroups", label: "Nhóm nguồn", icon: Globe2 },
      { key: "customerSegments", label: "Phân khúc khách hàng", icon: Users2 },
    ],
  },
];

const PANEL_BY_SUBKEY = {
  cardFields: CardFieldsPanel,
  roomColors: RoomColorsPanel,
  sourceGroups: SourceGroupsPanel,
  customerSegments: CustomerSegmentsPanel,
};

function BookingConfig() {
  const [tabKey, setTabKey] = useState(TABS[0].key);
  const [subKeyByTab, setSubKeyByTab] = useState({
    roomMap: "cardFields",
    bookingTypes: "sourceGroups",
  });
  const [toastMsg, setToastMsg] = useState("");

  const tab = TABS.find((t) => t.key === tabKey);
  const subKey = subKeyByTab[tabKey];
  const Panel = PANEL_BY_SUBKEY[subKey];

  function handleSubNavChange(key) {
    setSubKeyByTab((prev) => ({ ...prev, [tabKey]: key }));
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Cấu hình quản lý đặt phòng</h1>
        <p className={styles.subtitle}>
          Tuỳ chỉnh thông tin hiển thị trên booking card, màu trạng thái phòng và cách phân loại nguồn khách/booking.
        </p>
      </div>

      <div className={styles.topTabs}>
        {TABS.map((t) => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              className={`${styles.topTab} ${t.key === tabKey ? styles.topTabActive : ""}`}
              onClick={() => setTabKey(t.key)}
            >
              <TabIcon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className={styles.layout}>
        <div className={styles.subNav}>
          {tab.subNav.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                className={`${styles.subNavItem} ${item.key === subKey ? styles.subNavItemActive : ""}`}
                onClick={() => handleSubNavChange(item.key)}
              >
                <ItemIcon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        <Panel styles={styles} onToast={setToastMsg} />
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default BookingConfig;
