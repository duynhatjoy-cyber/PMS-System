import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Landmark, ListTree } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import CategoryTreePanel from "./components/CategoryTreePanel";
import BankAccountsPanel from "./components/BankAccountsPanel";
import styles from "./ThuChiConfig.module.css";

const TABS = [
  { key: "categories", label: "Danh mục thu chi", path: "/config/thu-chi", icon: ListTree, Panel: CategoryTreePanel },
  { key: "bankAccounts", label: "Tài khoản ngân hàng", path: "/config/thu-chi/tai-khoan-ngan-hang", icon: Landmark, Panel: BankAccountsPanel },
];

function ThuChiConfig() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabKey = location.pathname.endsWith("/tai-khoan-ngan-hang") ? "bankAccounts" : "categories";
  const [toastMsg, setToastMsg] = useState("");

  const tab = TABS.find((t) => t.key === tabKey);
  const Panel = tab.Panel;

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Cấu hình thu chi</h1>
        <p className={styles.subtitle}>
          Quản lý danh mục thu/chi dùng để phân loại phiếu thu chi, và khai báo tài khoản ngân hàng
          của khách sạn.
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
              onClick={() => navigate(t.path)}
            >
              <TabIcon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <Panel styles={styles} onToast={setToastMsg} />

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default ThuChiConfig;
