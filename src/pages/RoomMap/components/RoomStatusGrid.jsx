import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ClipboardList, Wrench } from "lucide-react";
import useOutsideClick from "../../../utils/useOutsideClick";
import { formatCurrency, formatDMYShort } from "../../../utils/format";
import {
  computeRoomSnapshots,
  FLOORS,
  getRateForDate,
  ROOM_STATUS_GROUP_ORDER,
  ROOM_TYPES,
  SOURCE_META,
  STATUS_META,
} from "../../../data/roomMapData";
import styles from "../RoomMap.module.css";

const GROUP_TABS = [
  { key: "status", label: "Đặt phòng" },
  { key: "type", label: "Loại" },
  { key: "floor", label: "Tầng" },
  { key: "room", label: "Phòng" },
];

function buildSections(groupTab, snapshots) {
  if (groupTab === "room") {
    const sorted = [...snapshots].sort((a, b) => a.room.number.localeCompare(b.room.number));
    return [{ key: "all", label: null, items: sorted }];
  }
  if (groupTab === "type") {
    return ROOM_TYPES.map((t) => ({
      key: t.key,
      label: t.label,
      items: snapshots.filter((s) => s.room.typeKey === t.key).sort((a, b) => a.room.number.localeCompare(b.room.number)),
    })).filter((s) => s.items.length > 0);
  }
  if (groupTab === "floor") {
    return FLOORS.map((floor) => ({
      key: floor,
      label: `Tầng ${floor}`,
      items: snapshots.filter((s) => s.room.floor === floor).sort((a, b) => a.room.number.localeCompare(b.room.number)),
    })).filter((s) => s.items.length > 0);
  }
  // status
  return ROOM_STATUS_GROUP_ORDER.map((status) => ({
    key: status,
    label: STATUS_META[status].label,
    color: STATUS_META[status].color,
    items: snapshots.filter((s) => s.status === status).sort((a, b) => a.room.number.localeCompare(b.room.number)),
  })).filter((s) => s.items.length > 0);
}

function RoomStatusGrid({ rooms, bookings, selectedDate, density, saleMode, onToast }) {
  const [groupTab, setGroupTab] = useState("status");
  const [popover, setPopover] = useState(null); // { snapshot, x, y }
  const popoverRef = useRef(null);
  useOutsideClick(Boolean(popover), [popoverRef], () => setPopover(null));

  const snapshots = computeRoomSnapshots(rooms, bookings, selectedDate);
  const sections = buildSections(groupTab, snapshots);

  function handleCardClick(e, snapshot) {
    if (snapshot.status === "vacant") {
      if (saleMode === "sell") {
        onToast('Tạo đặt phòng nhanh sẽ có ở bản cập nhật tiếp theo — dùng trang "Tạo đặt phòng".');
      }
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({ snapshot, x: rect.left, y: rect.bottom + 6 });
  }

  const popoverBooking = popover?.snapshot.booking;
  const popoverSource = popoverBooking ? SOURCE_META[popoverBooking.source] : null;
  const popoverIsMaintenance = popover?.snapshot.status === "maintenance";
  const popoverRate = popover && !popoverIsMaintenance ? getRateForDate(popover.snapshot.room.typeKey, selectedDate) : 0;

  return (
    <div className={styles.gridWrap}>
      <div className={styles.segmented}>
        {GROUP_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.segmentBtn} ${groupTab === t.key ? styles.segmentActive : ""}`}
            onClick={() => setGroupTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.gridScroll}>
        {sections.map((section) => (
          <div key={section.key} className={styles.gridSection}>
            {section.label && (
              <div className={styles.gridSectionHead}>
                {section.color && <span className={styles.statusDot} style={{ background: section.color }} />}
                {section.label} <span className={styles.groupHeaderCount}>({section.items.length})</span>
              </div>
            )}
            <div className={`${styles.cardGrid} ${density === "compact" ? styles.cardGridCompact : ""}`}>
              {section.items.map((snapshot) => {
                const meta = STATUS_META[snapshot.status];
                const source = snapshot.booking ? SOURCE_META[snapshot.booking.source] : null;
                const isVacant = snapshot.status === "vacant";
                const isMaintenance = snapshot.status === "maintenance";

                if (density === "compact") {
                  return (
                    <button
                      key={snapshot.room.number}
                      type="button"
                      className={styles.roomTile}
                      style={{ background: meta.soft, borderColor: meta.color, color: meta.color }}
                      title={`${snapshot.room.number} — ${meta.label}${
                        snapshot.booking ? `: ${snapshot.booking.guest}` : ""
                      }`}
                      onClick={(e) => handleCardClick(e, snapshot)}
                    >
                      <span className={styles.roomTileNumber}>{snapshot.room.number}</span>
                      {isVacant && <Check size={13} />}
                      {isMaintenance && <Wrench size={13} />}
                      {!isVacant && !isMaintenance && <ClipboardList size={13} />}
                    </button>
                  );
                }

                return (
                  <button
                    key={snapshot.room.number}
                    type="button"
                    className={styles.roomCard}
                    style={{ background: meta.soft, borderLeftColor: meta.color }}
                    onClick={(e) => handleCardClick(e, snapshot)}
                  >
                    <div className={styles.roomCardHead}>
                      <span className={styles.roomCardNumber}>{snapshot.room.number}</span>
                      <span className={styles.roomCardType}>{snapshot.room.typeKey}</span>
                    </div>
                    {isVacant ? (
                      <div className={styles.roomCardVacant} style={{ color: meta.color }}>
                        <Check size={14} /> Phòng trống
                      </div>
                    ) : isMaintenance ? (
                      <div className={styles.roomCardVacant} style={{ color: meta.color }}>
                        <Wrench size={14} /> Sửa phòng
                      </div>
                    ) : (
                      <>
                        <div className={styles.roomCardGuest}>
                          {source && (
                            <span className={styles.sourceBadge} style={{ background: source.color }}>
                              {source.code}
                            </span>
                          )}
                          <span className={styles.roomCardGuestName}>{snapshot.booking.guest}</span>
                        </div>
                        <div className={styles.roomCardMeta} style={{ color: meta.color }}>
                          {formatDMYShort(snapshot.booking.checkIn)} → {formatDMYShort(snapshot.booking.checkOut)}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {popover &&
        createPortal(
          <div ref={popoverRef} className={styles.bookingPopover} style={{ left: popover.x, top: popover.y }}>
            <div className={styles.popoverTitle}>
              {popoverSource && (
                <span className={styles.sourceBadge} style={{ background: popoverSource.color }}>
                  {popoverSource.code}
                </span>
              )}
              {popoverBooking?.guest ?? STATUS_META[popover.snapshot.status].label}
            </div>
            <div className={styles.popoverRow}>
              <span className={styles.popoverLabel}>Phòng</span>
              <span>
                {popover.snapshot.room.number} · {popover.snapshot.room.typeKey}
              </span>
            </div>
            <div className={styles.popoverRow}>
              <span className={styles.popoverLabel}>Trạng thái</span>
              <span>{STATUS_META[popover.snapshot.status].label}</span>
            </div>
            {popoverBooking && (
              <>
                <div className={styles.popoverRow}>
                  <span className={styles.popoverLabel}>Nhận phòng</span>
                  <span>{formatDMYShort(popoverBooking.checkIn)}</span>
                </div>
                <div className={styles.popoverRow}>
                  <span className={styles.popoverLabel}>Trả phòng</span>
                  <span>{formatDMYShort(popoverBooking.checkOut)}</span>
                </div>
                <div className={styles.popoverRow}>
                  <span className={styles.popoverLabel}>Mã đặt phòng</span>
                  <span>#{popoverBooking.code}</span>
                </div>
                {!popoverIsMaintenance && (
                  <div className={styles.popoverRow}>
                    <span className={styles.popoverLabel}>Giá phòng/đêm</span>
                    <span>{formatCurrency(popoverRate)}</span>
                  </div>
                )}
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

export default RoomStatusGrid;
