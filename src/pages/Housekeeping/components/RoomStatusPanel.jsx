import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import { computeRoomSnapshots, FLOORS, ROOMS } from "../../../data/roomMapData";
import { HK_STATUS, HK_STATUS_LEGEND } from "../../../data/housekeepingData";
import styles from "../Housekeeping.module.css";

// "Có khách" ở đây chỉ tính khách đang thực sự ở trong phòng — phòng vừa trả
// (checked_out) hay sắp đến (arriving_today/booked_future) vẫn hiện là Trống.
const OCCUPIED_STATUSES = ["in_house", "overdue"];

function RoomStatusPanel({ rooms, setRooms, bookings, today, onToast }) {
  const [selected, setSelected] = useState(() => new Set());
  const [statusFilter, setStatusFilter] = useState("all");

  const snapshotByRoom = useMemo(() => {
    const snapshots = computeRoomSnapshots(ROOMS, bookings, today);
    return Object.fromEntries(snapshots.map((s) => [s.room.number, s]));
  }, [bookings, today]);

  const counts = { dirty: 0, in_progress: 0, clean: 0 };
  rooms.forEach((r) => {
    if (r.hkStatus) counts[r.hkStatus] += 1;
  });

  const visibleRooms = rooms.filter((r) => {
    if (!r.hkStatus) return statusFilter === "all"; // phòng bảo trì chỉ hiện ở "Tất cả"
    return statusFilter === "all" || r.hkStatus === statusFilter;
  });

  function toggleSelect(number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });
  }

  const selectableVisible = visibleRooms.filter((r) => r.hkStatus);
  const allVisibleSelected = selectableVisible.length > 0 && selectableVisible.every((r) => selected.has(r.number));

  function toggleSelectAll() {
    setSelected(allVisibleSelected ? new Set() : new Set(selectableVisible.map((r) => r.number)));
  }

  function setStatusFor(numbers, status) {
    setRooms((prev) => prev.map((r) => (numbers.includes(r.number) ? { ...r, hkStatus: status } : r)));
  }

  // Phòng đã ở đúng trạng thái đích thì bỏ qua — không "làm bẩn" một phòng đã
  // Bẩn, không "làm sạch" một phòng đã Sạch, kể cả khi được chọn chung trong
  // một lượt thao tác hàng loạt với các phòng khác.
  function roomsNeedingChange(status) {
    return rooms.filter((r) => selected.has(r.number) && r.hkStatus !== status);
  }

  function handleBulkSetStatus(status) {
    const targets = roomsNeedingChange(status);
    if (targets.length === 0) return;
    setStatusFor(targets.map((r) => r.number), status);
    onToast(`Đã cập nhật ${targets.length} phòng — ${HK_STATUS[status].label}`);
    setSelected(new Set());
  }

  function roomMenuItems(room) {
    return HK_STATUS_LEGEND.filter((key) => key !== room.hkStatus).map((key) => ({
      key,
      label: `Đánh dấu ${HK_STATUS[key].label}`,
      onClick: () => {
        setStatusFor([room.number], key);
        onToast(`Phòng ${room.number} — ${HK_STATUS[key].label}`);
      },
    }));
  }

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.legend}>
          <button
            type="button"
            className={`${styles.filterChip} ${statusFilter === "all" ? styles.filterChipActive : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Tất cả <span className={styles.filterChipCount}>{rooms.length}</span>
          </button>
          {HK_STATUS_LEGEND.map((key) => {
            const meta = HK_STATUS[key];
            const active = statusFilter === key;
            return (
              <button
                key={key}
                type="button"
                className={`${styles.filterChip} ${active ? styles.filterChipActive : ""}`}
                style={active ? { background: meta.soft, color: meta.color } : undefined}
                onClick={() => setStatusFilter(key)}
              >
                <span className={styles.legendDot} style={{ background: meta.color }} />
                {meta.label} <span className={styles.filterChipCount}>{counts[key]}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.bulkActions}>
          <button
            type="button"
            className={styles.bulkBtn}
            disabled={roomsNeedingChange("dirty").length === 0}
            onClick={() => handleBulkSetStatus("dirty")}
          >
            Đánh dấu Bẩn
          </button>
          <button
            type="button"
            className={styles.bulkBtn}
            disabled={roomsNeedingChange("in_progress").length === 0}
            onClick={() => handleBulkSetStatus("in_progress")}
          >
            Bắt đầu dọn
          </button>
          <button
            type="button"
            className={styles.bulkBtn}
            disabled={roomsNeedingChange("clean").length === 0}
            onClick={() => handleBulkSetStatus("clean")}
          >
            Đánh dấu Sạch
          </button>
        </div>
      </div>

      <label className={styles.selectAllRow}>
        <input
          type="checkbox"
          checked={allVisibleSelected}
          onChange={toggleSelectAll}
          disabled={selectableVisible.length === 0}
        />
        Chọn tất cả
        {selected.size > 0 && <span className={styles.selectedCount}>· Đã chọn {selected.size} phòng</span>}
      </label>

      {FLOORS.map((floor) => {
        const floorRooms = visibleRooms.filter((r) => r.floor === floor);
        if (floorRooms.length === 0) return null;

        return (
          <div key={floor} className={styles.floorSection}>
            <div className={styles.floorSectionHead}>
              Tầng {floor} <span className={styles.floorCount}>({floorRooms.length})</span>
            </div>
            <div className={styles.roomGrid}>
              {floorRooms.map((room) => {
                const meta = room.hkStatus ? HK_STATUS[room.hkStatus] : null;
                const snapshot = snapshotByRoom[room.number];
                const isMaintenance = snapshot?.status === "maintenance";
                const isOccupied = snapshot && OCCUPIED_STATUSES.includes(snapshot.status);

                return (
                  <div
                    key={room.number}
                    className={styles.roomCard}
                    style={{ borderLeftColor: isMaintenance ? "var(--fd-status-gray)" : meta.color }}
                    onClick={() => !isMaintenance && toggleSelect(room.number)}
                  >
                    <div className={styles.roomCardHead}>
                      {isMaintenance ? (
                        <span />
                      ) : (
                        <input
                          type="checkbox"
                          checked={selected.has(room.number)}
                          onChange={() => toggleSelect(room.number)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      {!isMaintenance && (
                        <span onClick={(e) => e.stopPropagation()}>
                          <RowActionMenu items={roomMenuItems(room)} />
                        </span>
                      )}
                    </div>
                    <div className={styles.roomCardNumber}>
                      Phòng {room.number} <span className={styles.roomCardType}>{room.typeKey}</span>
                    </div>
                    <div className={styles.roomCardGuest}>
                      <Users size={12} /> {isOccupied ? snapshot.booking.guest : "Trống"}
                    </div>
                    {isMaintenance ? (
                      <span
                        className={styles.roomCardStatus}
                        style={{ background: "var(--fd-status-gray-soft)", color: "var(--fd-status-gray)" }}
                      >
                        Bảo trì
                      </span>
                    ) : (
                      <span className={styles.roomCardStatus} style={{ background: meta.soft, color: meta.color }}>
                        {meta.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default RoomStatusPanel;
