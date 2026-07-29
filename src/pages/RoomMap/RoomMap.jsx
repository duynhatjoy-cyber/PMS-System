import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Grid3x3, LayoutGrid, Rocket, SlidersHorizontal, Wrench } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import DateNavPopover from "./components/DateNavPopover";
import GanttBoard from "./components/GanttBoard";
import RoomStatusGrid from "./components/RoomStatusGrid";
import { buildRoomMapBookings, computeStatusCounts, ROOMS, STATUS_META, STATUS_TAB_ORDER } from "../../data/roomMapData";
import { addDays, addMonths, startOfDay } from "../../utils/format";
import styles from "./RoomMap.module.css";

const PERIODS = [
  { key: "day", label: "Ngày" },
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
];

const GROUPS = [
  { key: "type", label: "Loại" },
  { key: "room", label: "Phòng" },
];

const VIEW_MODES = [
  { key: "gantt", label: "Dòng thời gian", Icon: SlidersHorizontal },
  { key: "grid-detailed", label: "Chi tiết", Icon: LayoutGrid },
  { key: "grid-compact", label: "Đơn giản", Icon: Grid3x3 },
];

function RoomMap() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [periodMode, setPeriodMode] = useState("day");
  const [groupMode, setGroupMode] = useState("room");
  const [saleMode, setSaleMode] = useState("sell");
  const [viewMode, setViewMode] = useState("gantt");
  const [statusFilter, setStatusFilter] = useState(null);
  const [showToday, setShowToday] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [bookings] = useState(() => buildRoomMapBookings(today));
  const statusCounts = useMemo(() => computeStatusCounts(bookings, today), [bookings, today]);

  function stepDate(dir) {
    if (periodMode === "day") setSelectedDate((d) => addDays(d, dir));
    else if (periodMode === "week") setSelectedDate((d) => addDays(d, dir * 7));
    else setSelectedDate((d) => addMonths(d, dir));
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.controlsRow}>
          <div className={styles.statusTabs}>
            {STATUS_TAB_ORDER.map((key) => {
              const meta = STATUS_META[key];
              const active = statusFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.statusTab} ${active ? styles.statusTabActive : ""}`}
                  style={active ? { background: meta.soft, color: meta.color } : undefined}
                  onClick={() => setStatusFilter((prev) => (prev === key ? null : key))}
                >
                  <span className={styles.statusDot} style={{ background: meta.color }} />
                  {meta.label}
                  <span className={styles.statusCount}>{statusCounts[key]}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.segmented}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${saleMode === "sell" ? styles.segmentActive : ""}`}
              onClick={() => setSaleMode("sell")}
            >
              <Rocket size={14} /> Bán
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${saleMode === "edit" ? styles.segmentActive : ""}`}
              onClick={() => setSaleMode("edit")}
            >
              <Wrench size={14} /> Sửa
            </button>
          </div>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.controlsRow}>
          <div className={styles.leftControls}>
            <div className={styles.dateNav}>
              <button type="button" className={styles.navIconBtn} onClick={() => stepDate(-1)} title="Trước">
                <ChevronLeft size={16} />
              </button>
              <DateNavPopover selectedDate={selectedDate} onSelect={setSelectedDate} />
              <button type="button" className={styles.navIconBtn} onClick={() => stepDate(1)} title="Sau">
                <ChevronRight size={16} />
              </button>
            </div>

            <button type="button" className={styles.todayBtn} onClick={() => setSelectedDate(today)}>
              Hôm nay
            </button>

            {viewMode === "gantt" && (
              <>
                <div className={styles.segmented}>
                  {PERIODS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      className={`${styles.segmentBtn} ${periodMode === p.key ? styles.segmentActive : ""}`}
                      onClick={() => setPeriodMode(p.key)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className={styles.segmented}>
                  {GROUPS.map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      className={`${styles.segmentBtn} ${groupMode === g.key ? styles.segmentActive : ""}`}
                      onClick={() => setGroupMode(g.key)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={showToday} onChange={(e) => setShowToday(e.target.checked)} />
                  Xem ngày
                </label>
              </>
            )}
          </div>

          <div className={styles.densityIcons}>
            {VIEW_MODES.map((vm) => (
              <button
                key={vm.key}
                type="button"
                className={`${styles.densityBtn} ${viewMode === vm.key ? styles.densityActive : ""}`}
                title={vm.label}
                onClick={() => setViewMode(vm.key)}
              >
                <vm.Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div key={viewMode} className={styles.viewFade}>
        {viewMode === "gantt" ? (
          <GanttBoard
            bookings={bookings}
            selectedDate={selectedDate}
            periodMode={periodMode}
            groupMode={groupMode}
            saleMode={saleMode}
            highlightStatus={statusFilter}
            highlightToday={showToday}
            onToast={setToastMsg}
          />
        ) : (
          <RoomStatusGrid
            rooms={ROOMS}
            bookings={bookings}
            selectedDate={selectedDate}
            density={viewMode === "grid-compact" ? "compact" : "detailed"}
            saleMode={saleMode}
            onToast={setToastMsg}
          />
        )}
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default RoomMap;
