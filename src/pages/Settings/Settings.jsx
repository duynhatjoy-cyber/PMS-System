import { useState } from "react";
import { Bell, Building2, MessageCircle, Package, Plug, QrCode, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import HotelProfilePanel from "./components/HotelProfilePanel";
import ContactChannelsPanel from "./components/ContactChannelsPanel";
import WidgetPanel from "./components/WidgetPanel";
import AiConfigPanel from "./components/AiConfigPanel";
import PlanPanel from "./components/PlanPanel";
import PmsSettingsPanel from "./components/PmsSettingsPanel";
import StaffPanel from "./components/StaffPanel";
import NotificationsPanel from "./components/NotificationsPanel";
import ChannelConnectionsPanel from "./components/ChannelConnectionsPanel";
import styles from "./Settings.module.css";

const TABS = [
  { key: "profile", label: "Hồ sơ", icon: Building2, Panel: HotelProfilePanel },
  { key: "channels", label: "Kênh liên lạc", icon: MessageCircle, Panel: ContactChannelsPanel },
  { key: "widget", label: "Widget", icon: QrCode, Panel: WidgetPanel },
  { key: "ai", label: "Cấu hình AI", icon: Sparkles, Panel: AiConfigPanel },
  { key: "plan", label: "Gói dịch vụ", icon: Package, Panel: PlanPanel },
  { key: "pms", label: "Cài đặt PMS", icon: SlidersHorizontal, Panel: PmsSettingsPanel },
  { key: "staff", label: "Nhân viên", icon: Users, Panel: StaffPanel },
  { key: "notifications", label: "Thông báo", icon: Bell, Panel: NotificationsPanel },
  { key: "cms", label: "Kết nối kênh", icon: Plug, Panel: ChannelConnectionsPanel },
];

function Settings() {
  const [tabKey, setTabKey] = useState(TABS[0].key);
  const [toastMsg, setToastMsg] = useState("");

  const tab = TABS.find((t) => t.key === tabKey);
  const Panel = tab.Panel;

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Cài đặt</h1>
        <p className={styles.subtitle}>Cấu hình khách sạn, kênh liên lạc và AI.</p>
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
              <TabIcon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      <Panel onToast={setToastMsg} />

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default Settings;
