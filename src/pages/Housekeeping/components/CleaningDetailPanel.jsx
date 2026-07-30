import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import DateNavPopover from "../../RoomMap/components/DateNavPopover";
import { computeRoomSnapshots, ROOMS } from "../../../data/roomMapData";
import { HK_STATUS, HK_STATUS_LEGEND, STAFF } from "../../../data/housekeepingData";
import { addDays, formatDMYShort, formatTime, isSameDay } from "../../../utils/format";
import styles from "../Housekeeping.module.css";

const SECTION_META = {
  departure: { title: "Trả phòng hôm nay", hint: "Dọn kỹ trước khi khách mới nhận phòng" },
  stay: { title: "Đang lưu trú", hint: "Dọn phòng định kỳ" },
  vacant: { title: "Phòng trống", hint: "Kiểm tra / chuẩn bị đón khách mới" },
};

function CleaningDetailPanel({ rooms, setRooms, bookings, selectedDate, setSelectedDate, today, onToast }) {
  const snapshots = useMemo(
    () => computeRoomSnapshots(ROOMS, bookings, selectedDate),
    [bookings, selectedDate]
  );
  const roomByNumber = useMemo(() => Object.fromEntries(rooms.map((r) => [r.number, r])), [rooms]);

  function nextArrival(roomNumber) {
    return bookings.find((b) => b.room === roomNumber && isSameDay(b.checkIn, selectedDate));
  }

  const groups = { departure: [], stay: [], vacant: [], maintenance: [] };
  snapshots.forEach((snap) => {
    const room = roomByNumber[snap.room.number];
    if (snap.status === "maintenance") {
      groups.maintenance.push({ snap, room });
    } else if (snap.booking && isSameDay(snap.booking.checkOut, selectedDate)) {
      groups.departure.push({ snap, room });
    } else if (snap.booking) {
      groups.stay.push({ snap, room });
    } else {
      groups.vacant.push({ snap, room, arrival: nextArrival(snap.room.number) });
    }
  });

  function patchRoom(number, patch) {
    setRooms((prev) => prev.map((r) => (r.number === number ? { ...r, ...patch } : r)));
  }

  function renderRow({ snap, room, arrival }) {
    return (
      <div key={snap.room.number} className={styles.detailRow}>
        <div className={styles.detailRoomCell}>
          <span className={styles.detailRoomNumber}>{snap.room.number}</span>
          <span className={styles.detailRoomType}>{snap.room.typeKey}</span>
        </div>
        <div className={styles.detailGuestCell}>
          {snap.booking ? (
            <>
              <span className={styles.detailGuestName}>{snap.booking.guest}</span>
              <span className={styles.detailGuestMeta}>
                {formatDMYShort(snap.booking.checkIn)} → {formatDMYShort(snap.booking.checkOut)}
              </span>
            </>
          ) : (
            <span className={styles.detailGuestMeta}>
              {arrival ? `Khách đến lúc ${formatTime(arrival.checkIn)}` : "—"}
            </span>
          )}
        </div>
        <div className={styles.detailStatusCell}>
          <select
            className={styles.inlineSelect}
            value={room.hkStatus ?? "clean"}
            onChange={(e) => patchRoom(room.number, { hkStatus: e.target.value })}
          >
            {HK_STATUS_LEGEND.map((key) => (
              <option key={key} value={key}>
                {HK_STATUS[key].label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.detailStaffCell}>
          <select
            className={styles.inlineSelect}
            value={room.assignedStaff ?? ""}
            onChange={(e) => patchRoom(room.number, { assignedStaff: e.target.value || null })}
          >
            <option value="">— Chưa phân công —</option>
            {STAFF.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.detailNoteCell}>
          <input
            key={`${room.number}-note`}
            className={styles.inlineInput}
            placeholder="Ghi chú..."
            defaultValue={room.note}
            onBlur={(e) => patchRoom(room.number, { note: e.target.value })}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.dateNav}>
          <button
            type="button"
            className={styles.navIconBtn}
            onClick={() => setSelectedDate((d) => addDays(d, -1))}
            title="Ngày trước"
          >
            <ChevronLeft size={16} />
          </button>
          <DateNavPopover selectedDate={selectedDate} onSelect={setSelectedDate} />
          <button
            type="button"
            className={styles.navIconBtn}
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            title="Ngày sau"
          >
            <ChevronRight size={16} />
          </button>
          <button type="button" className={styles.todayBtn} onClick={() => setSelectedDate(today)}>
            Hôm nay
          </button>
        </div>
        <button
          type="button"
          className={styles.printBtn}
          onClick={() => onToast("Xuất bản in sẽ có ở bản cập nhật tiếp theo")}
        >
          <Printer size={15} /> In
        </button>
      </div>

      {["departure", "stay", "vacant"].map((key) => {
        const items = groups[key];
        if (items.length === 0) return null;
        const meta = SECTION_META[key];

        return (
          <div key={key} className={styles.floorSection}>
            <div className={styles.floorSectionHead}>
              {meta.title} <span className={styles.floorCount}>({items.length})</span>
              <span className={styles.sectionHint}>{meta.hint}</span>
            </div>
            <div className={styles.detailTable}>
              <div className={styles.detailHeaderRow}>
                <span>Phòng</span>
                <span>Khách</span>
                <span>Trạng thái</span>
                <span>Nhân viên</span>
                <span>Ghi chú</span>
              </div>
              {items.map((item) => renderRow(item))}
            </div>
          </div>
        );
      })}

      {groups.maintenance.length > 0 && (
        <div className={styles.floorSection}>
          <div className={styles.floorSectionHead}>
            Đang bảo trì <span className={styles.floorCount}>({groups.maintenance.length})</span>
          </div>
          <div className={styles.detailTable}>
            {groups.maintenance.map(({ snap }) => (
              <div key={snap.room.number} className={styles.detailRow}>
                <div className={styles.detailRoomCell}>
                  <span className={styles.detailRoomNumber}>{snap.room.number}</span>
                  <span className={styles.detailRoomType}>{snap.room.typeKey}</span>
                </div>
                <div className={styles.detailGuestCell}>
                  <span className={styles.detailGuestMeta}>Ngừng sử dụng để sửa chữa</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default CleaningDetailPanel;
