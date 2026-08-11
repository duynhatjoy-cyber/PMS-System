import { useState } from "react";
<<<<<<< HEAD
import { useLocation, useNavigate } from "react-router-dom";
import { Building2, Warehouse } from "lucide-react";
=======
import { Building2, Package, Warehouse } from "lucide-react";
>>>>>>> b82b5b537f7e594fdd5aca63b8fabb2c4ba47f35
import Toast from "../FrontDesk/components/Toast";
import WarehousesPanel from "./components/WarehousesPanel";
import SuppliersPanel from "./components/SuppliersPanel";
import MaterialsPanel from "./components/MaterialsPanel";
import styles from "./WarehouseConfig.module.css";

const TABS = [
<<<<<<< HEAD
  { key: "warehouses", label: "Kho", path: "/config/quan-ly-kho", icon: Warehouse, Panel: WarehousesPanel },
  { key: "suppliers", label: "Nhà cung cấp", path: "/config/quan-ly-kho/nha-cung-cap", icon: Building2, Panel: SuppliersPanel },
=======
  { key: "warehouses", label: "Kho", icon: Warehouse, Panel: WarehousesPanel },
  { key: "suppliers", label: "Nhà cung cấp", icon: Building2, Panel: SuppliersPanel },
  { key: "materials", label: "Nguyên vật liệu", icon: Package, Panel: MaterialsPanel },
>>>>>>> b82b5b537f7e594fdd5aca63b8fabb2c4ba47f35
];

function WarehouseConfig() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabKey = location.pathname.endsWith("/nha-cung-cap") ? "suppliers" : "warehouses";
  const [toastMsg, setToastMsg] = useState("");

  const tab = TABS.find((t) => t.key === tabKey);
  const Panel = tab.Panel;

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Quản lý kho</h1>
        <p className={styles.subtitle}>
          Quản lý danh sách kho, nhà cung cấp và nguyên vật liệu dùng cho nghiệp vụ nhập/xuất/chuyển kho.
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

export default WarehouseConfig;
