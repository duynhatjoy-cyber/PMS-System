import { useState } from "react";
import Toast from "../FrontDesk/components/Toast";
import HotelProfilePanel from "../Settings/components/HotelProfilePanel";
import styles from "./HotelInfo.module.css";

function HotelInfo() {
  const [toastMessage, setToastMessage] = useState("");

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <h1>Thông tin khách sạn</h1>
        <p>Cập nhật thông tin hiển thị trên báo cáo, hóa đơn và thông tin xác nhận quyền sở hữu khách sạn.</p>
      </header>

      <HotelProfilePanel onToast={setToastMessage} />
      <Toast message={toastMessage} onDismiss={() => setToastMessage("")} />
    </main>
  );
}

export default HotelInfo;
