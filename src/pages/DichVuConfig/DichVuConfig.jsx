import { useState } from "react";
import Toast from "../FrontDesk/components/Toast";
import ServiceTreePanel from "./components/ServiceTreePanel";
import styles from "./DichVuConfig.module.css";

function DichVuConfig() {
  const [toastMsg, setToastMsg] = useState("");

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Dịch vụ mở rộng</h1>
        <p className={styles.subtitle}>
          Quản lý các dịch vụ bán thêm hoặc phát sinh trong quá trình vận hành khách sạn — đền bù, dịch
          vụ khác, giặt là, minibar và dịch vụ phòng.
        </p>
      </div>

      <ServiceTreePanel onToast={setToastMsg} />

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default DichVuConfig;
