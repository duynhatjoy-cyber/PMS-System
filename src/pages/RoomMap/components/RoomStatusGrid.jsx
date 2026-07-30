import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BedDouble, Brush, Check, ClipboardList, Wrench } from "lucide-react";
import useOutsideClick from "../../../utils/useOutsideClick";
import { useBookingCardFields } from "../../../utils/bookingCardConfig";
import { guestLabel, priceLabel, timeLabel } from "../../../utils/bookingCardPresentation";
import { colorForStatus, useRoomStatusColors } from "../../../utils/roomColorConfig";
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
import BookingActionMenu from "./BookingActionMenu";

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

function RoomStatusGrid({ rooms, bookings, selectedDate, density, onToast, onOpenDetail, onBookingAction, onOpenMaintenance, roomStatusOverrides }) {
  const [groupTab, setGroupTab] = useState("status");
  const [popover, setPopover] = useState(null); // { snapshot, x, y }
  const popoverRef = useRef(null);
  const cardFields = useBookingCardFields();
  const statusColors = useRoomStatusColors();
  useOutsideClick(Boolean(popover), [popoverRef], () => setPopover(null));

  const snapshots = computeRoomSnapshots(rooms, bookings, selectedDate).map((snapshot) => {
    const override = roomStatusOverrides[snapshot.room.number];
    if (override === "dirty") {
      return { ...snapshot, status: "vacant", housekeeping: "dirty", booking: null };
    }
    if (override === "clean") {
      return { ...snapshot, status: "vacant", housekeeping: "clean", booking: null };
    }
    return override ? { ...snapshot, status: override, booking: null } : snapshot;
  });
  const sections = buildSections(groupTab, snapshots);

  function handleCardClick(e, snapshot) {
    if (snapshot.status === "maintenance") {
      onOpenMaintenance(snapshot.room);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({
      snapshot,
      booking: snapshot.booking,
      room: snapshot.room,
      status: snapshot.housekeeping === "dirty" ? "dirty" : snapshot.status,
      x: Math.max(8, Math.min(rect.left, window.innerWidth - 224)),
      y: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 500)),
    });
  }

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
                {section.color && (
                  <span className={styles.statusDot} style={{ background: colorForStatus(section.key, statusColors) }} />
                )}
                {section.label} <span className={styles.groupHeaderCount}>({section.items.length})</span>
              </div>
            )}
            <div className={`${styles.cardGrid} ${density === "compact" ? styles.cardGridCompact : ""}`}>
              {section.items.map((snapshot) => {
                const meta = STATUS_META[snapshot.status];
                const statusColor = colorForStatus(snapshot.status, statusColors);
                const statusSoft = `${statusColor}1a`;
                const source = snapshot.booking ? SOURCE_META[snapshot.booking.source] : null;
                const isVacant = snapshot.status === "vacant";
                const isDirty = snapshot.housekeeping === "dirty";
                const isMaintenance = snapshot.status === "maintenance";

                if (density === "compact") {
                  return (
                    <button
                      key={snapshot.room.number}
                      type="button"
                      className={styles.roomTile}
                      style={{ background: statusSoft, borderColor: statusColor, color: statusColor }}
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
                    className={`${styles.roomCard} ${styles.bookingRoomCard} ${
                      !isVacant && !isMaintenance ? styles.reservationCard : ""
                    }`}
                    onClick={(e) => handleCardClick(e, snapshot)}
                  >
                    {isVacant ? (
                      <>
                        <div className={styles.bookingCardCode} style={{ background: statusColor }}>
                          <span>{snapshot.room.typeKey}</span>
                          <strong>{snapshot.room.number}</strong>
                          <div className={styles.roomStateIcons}>
                            <Check size={17} />
                            {isDirty && <Brush size={16} className={styles.dirtyBroom} />}
                          </div>
                        </div>
                        <div className={styles.vacantCardBody} style={{ color: statusColor }}>
                          Phòng trống
                        </div>
                      </>
                    ) : isMaintenance ? (
                      <>
                        <div className={styles.bookingCardCode} style={{ background: statusColor }}>
                          <span>{snapshot.room.typeKey}</span>
                          <strong>{snapshot.room.number}</strong>
                          <Wrench size={16} />
                        </div>
                        <div className={styles.vacantCardBody} style={{ color: statusColor }}>
                          {meta.label}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.bookingCardCode} style={{ background: statusColor }}>
                          <span>{snapshot.room.typeKey}</span>
                          <strong>{snapshot.room.number}</strong>
                          <BedDouble size={16} />
                        </div>
                        <div className={styles.bookingCardBody}>
                          <div className={styles.bookingCardTop}>
                            {source && (
                              <span className={styles.bookingSourceBadge} style={{ background: source.color }}>
                                {source.code} {snapshot.booking.source}
                              </span>
                            )}
                            <span
                              className={styles.bookingStatusBadge}
                              style={{ color: statusColor, background: statusSoft }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <div className={styles.bookingGuestLine}>
                            {cardFields.guestDisplay === "nationality" && (
                              <span className={styles.bookingFlag}>{snapshot.booking.nationality || "—"}</span>
                            )}
                            <strong>{guestLabel(snapshot.booking, cardFields)}</strong>
                          </div>
                          <div className={styles.bookingMetaLine}>{timeLabel(snapshot.booking, cardFields)}</div>
                          <div className={styles.bookingMetaLine}>
                            {[
                              snapshot.room.typeKey,
                              `${Math.max(
                                1,
                                Math.ceil((snapshot.booking.checkOut - snapshot.booking.checkIn) / 86400000)
                              )} đêm`,
                              cardFields.showSourceGroup ? `Nguồn ${snapshot.booking.sourceGroup}` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                          <div className={styles.bookingPrice}>
                            {priceLabel(snapshot.booking, snapshot.room, cardFields, getRateForDate)}
                          </div>
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
          <BookingActionMenu
            menu={popover}
            menuRef={popoverRef}
            onClose={() => setPopover(null)}
            onDetail={onOpenDetail}
            onAction={onBookingAction}
            onToast={onToast}
          />,
          document.body
        )}
    </div>
  );
}

export default RoomStatusGrid;
