import { useMemo, useState } from "react";
import { ClipboardList, LayoutGrid } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import RoomStatusPanel from "./components/RoomStatusPanel";
import CleaningDetailPanel from "./components/CleaningDetailPanel";
import { buildInitialRooms } from "../../data/housekeepingData";
import { buildRoomMapBookings } from "../../data/roomMapData";
import { startOfDay } from "../../utils/format";
import styles from "./Housekeeping.module.css";

const TABS = [
  { key: "status", label: "Tình trạng buồng", icon: LayoutGrid },
  { key: "detail", label: "Chi tiết dọn phòng", icon: ClipboardList },
];

function Housekeeping() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [bookings] = useState(() => buildRoomMapBookings(today));
  const [rooms, setRooms] = useState(() => buildInitialRooms(bookings, today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [tabKey, setTabKey] = useState(TABS[0].key);
  const [toastMsg, setToastMsg] = useState("");

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Buồng phòng</h1>
        <p className={styles.subtitle}>
          Theo dõi tình trạng vệ sinh từng phòng và phân công dọn phòng theo ngày cho nhân viên buồng phòng.
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

      {tabKey === "status" && (
        <RoomStatusPanel rooms={rooms} setRooms={setRooms} bookings={bookings} today={today} onToast={setToastMsg} />
      )}

      {tabKey === "detail" && (
        <CleaningDetailPanel
          rooms={rooms}
          setRooms={setRooms}
          bookings={bookings}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          today={today}
          onToast={setToastMsg}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default Housekeeping;
