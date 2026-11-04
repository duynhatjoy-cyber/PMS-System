import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BedDouble,
  Bookmark,
  Calendar,
  Check,
  ClipboardList,
  Plus,
  SprayCan,
  Wrench,
} from "lucide-react";
import useOutsideClick from "../../../utils/useOutsideClick";
import { useBookingCardFields } from "../../../utils/bookingCardConfig";
import { guestLabel, priceLabel, timeLabel } from "../../../utils/bookingCardPresentation";
import { colorForStatus, useRoomStatusColors } from "../../../utils/roomColorConfig";
import {
  computeRoomSnapshotsWithOverrides,
  FLOORS,
  getRateForDate,
  ROOM_STATUS_GROUP_ORDER,
  ROOM_TYPES,
  SOURCE_META,
  STATUS_META,
} from "../../../data/roomMapData";
import { addDays, formatDMYShort } from "../../../utils/format";
import styles from "../RoomMap.module.css";
import BookingActionMenu from "./BookingActionMenu";

const GROUP_TABS = [
  { key: "status", label: "Đặt phòng" },
  { key: "type", label: "Loại" },
  { key: "floor", label: "Tầng" },
];

export function getRoomTypeAbbr(typeKey, roomNumber) {
  if (roomNumber === "204") return "SKR";
  if (!typeKey) return "STD";
  const s = typeKey.toUpperCase();
  if (s.includes("VIP")) return "VIP";
  if (s.includes("DELUXE") || s.includes("DLX")) return "DLX";
  if (s.includes("SUP")) return "SUP";
  if (s.includes("SUITE") || s.includes("SKR")) return "SKR";
  if (s.includes("STD") || s.includes("STANDARD")) return "STD";
  return typeKey.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "STD";
}

function getDepositAmount(booking, room) {
  if (booking?.deposit) return booking.deposit;
  const num = parseInt(room?.number || "100", 10);
  if (room?.number === "201") return 300000;
  if (room?.number === "302") return 500000;
  if (num % 3 === 0) return 500000;
  if (num % 2 === 0) return 300000;
  return 400000;
}

function formatDepositPill(amount) {
  if (amount >= 1000000) {
    const m = (amount / 1000000).toFixed(1).replace(".0", "");
    return `Cọc ${m}tr`;
  }
  if (amount >= 1000) {
    return `Cọc ${Math.round(amount / 1000)}k`;
  }
  return `Cọc ${amount}`;
}

function formatNumberVN(num) {
  return Math.round(num).toLocaleString("vi-VN");
}

function getMaintenanceData(room, maintenanceDetails, selectedDate) {
  const existing = maintenanceDetails?.[room?.number];
  if (existing?.reason) {
    return {
      reason: existing.reason,
      end: existing.end ? formatDMYShort(new Date(existing.end)) : formatDMYShort(addDays(selectedDate, 2)),
    };
  }
  if (room?.number === "204") {
    return {
      reason: "Hỏng máy lạnh #AC-02",
      end: "29/10",
    };
  }
  return {
    reason: "Bảo trì thiết bị",
    end: formatDMYShort(addDays(selectedDate, 2)),
  };
}

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
  return ROOM_STATUS_GROUP_ORDER.map((status) => {
    let items;
    if (status === "dirty") {
      items = snapshots.filter((s) => s.status === "vacant" && s.housekeeping === "dirty");
    } else if (status === "vacant") {
      items = snapshots.filter((s) => s.status === "vacant" && s.housekeeping !== "dirty");
    } else {
      items = snapshots.filter((s) => s.status === status);
    }
    return {
      key: status,
      label: STATUS_META[status]?.label || status,
      color: STATUS_META[status]?.color,
      items: items.sort((a, b) => a.room.number.localeCompare(b.room.number)),
    };
  }).filter((s) => s.items.length > 0);
}

function RoomStatusGrid({
  rooms,
  bookings,
  selectedDate,
  density,
  onToast,
  onOpenDetail,
  onBookingAction,
  onOpenMaintenance,
  roomStatusOverrides,
  highlightStatus,
  maintenanceDetails,
}) {
  const [groupTab, setGroupTab] = useState("status");
  const [popover, setPopover] = useState(null); // { snapshot, x, y }
  const popoverRef = useRef(null);
  const cardFields = useBookingCardFields();
  const statusColors = useRoomStatusColors();
  useOutsideClick(Boolean(popover), [popoverRef], () => setPopover(null));

  const snapshots = computeRoomSnapshotsWithOverrides(rooms, bookings, roomStatusOverrides, selectedDate);
  const visibleSnapshots =
    highlightStatus === "dirty"
      ? snapshots.filter((s) => s.housekeeping === "dirty")
      : highlightStatus === "maintenance"
      ? snapshots.filter((s) => s.status === "maintenance")
      : snapshots;
  const sections = buildSections(groupTab, visibleSnapshots);

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
      status: snapshot.status,
      housekeeping: snapshot.housekeeping,
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
                const isMaintenance = snapshot.status === "maintenance";
                const isDirty = snapshot.housekeeping === "dirty";
                const isVacant = snapshot.status === "vacant" || snapshot.status === "dirty" || snapshot.status === "checked_out";
                const isOverdue = snapshot.status === "overdue";
                const isInHouse = snapshot.status === "in_house" || isOverdue;
                const isReserved = !isMaintenance && !isVacant && !isInHouse;

                // Màu Zone A giữ nguyên theo trạng thái phòng (KHÔNG đổi màu sang màu bẩn)
                let badgeColor = "#10b981";
                if (isMaintenance) badgeColor = "#475569";
                else if (isOverdue) badgeColor = "#f59e42";
                else if (isInHouse) badgeColor = "#ef4444";
                else if (isReserved) badgeColor = "#2563eb";
                else if (isVacant) badgeColor = "#10b981";

                const abbr = getRoomTypeAbbr(snapshot.room.typeKey, snapshot.room.number);

                if (density === "compact") {
                  const meta = STATUS_META[snapshot.status] || { label: "Phòng" };
                  const statusSoft = `${badgeColor}1a`;
                  return (
                    <button
                      key={snapshot.room.number}
                      type="button"
                      className={styles.roomTile}
                      style={{ background: statusSoft, borderColor: badgeColor, color: badgeColor }}
                      title={`${snapshot.room.number} — ${meta.label}${
                        snapshot.booking ? `: ${snapshot.booking.guest}` : ""
                      }`}
                      onClick={(e) => handleCardClick(e, snapshot)}
                    >
                      <span className={styles.roomTileNumber}>{snapshot.room.number}</span>
                      {isDirty && <SprayCan size={12} strokeWidth={2} />}
                      {isVacant && !isDirty && <Check size={13} />}
                      {isMaintenance && <Wrench size={13} />}
                      {isInHouse && !isDirty && <BedDouble size={13} />}
                      {isReserved && !isDirty && <ClipboardList size={13} />}
                    </button>
                  );
                }

                const isBookingCard = isInHouse || isReserved;
                return (
                  <div
                    key={snapshot.room.number}
                    className={`${styles.roomCard} ${isBookingCard ? styles.bookingCardTall : ""}`}
                    onClick={(e) => handleCardClick(e, snapshot)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCardClick(e, snapshot);
                      }
                    }}
                  >
                    {/* LEFT BADGE (Zone A): Giữ nguyên màu trạng thái, chỉ thêm icon bình xịt bụi khi bẩn */}
                    <div className={styles.cardBadge} style={{ background: badgeColor }}>
                      <div className={styles.badgeIconsRow}>
                        {isVacant && (
                          <span className={styles.badgeCheckCircle}>
                            <Check size={9} strokeWidth={3} color={badgeColor} />
                          </span>
                        )}
                        {isInHouse && <BedDouble size={13} strokeWidth={2.2} color="#ffffff" />}
                        {isReserved && <Bookmark size={12} strokeWidth={2.2} fill="#ffffff" color="#ffffff" />}
                        {isMaintenance && <Wrench size={13} strokeWidth={2.2} color="#ffffff" />}
                        {isDirty && (
                          <span className={styles.dirtyIconDark} title="Phòng bẩn">
                            <SprayCan size={11} strokeWidth={2.2} color="#111827" />
                          </span>
                        )}
                      </div>

                      <span className={styles.badgeRoomType}>{abbr}</span>
                      <span className={styles.badgeRoomNumber}>{snapshot.room.number}</span>
                    </div>

                    {/* RIGHT CARD BODY */}
                    {isVacant && (
                      <div className={styles.cardBody}>
                        <div className={styles.cardHeaderRow}>
                          <div className={styles.statusWithDot}>
                            <span className={styles.dotGreen} />
                            <span className={styles.vacantStatusText}>Phòng trống / Sạch</span>
                          </div>
                        </div>

                        <div className={styles.cardMiddleRow}>
                          <span className={styles.vacantHeading}>Sẵn sàng đón khách</span>
                        </div>

                        <div className={styles.cardBottomRow}>
                          <button
                            type="button"
                            className={styles.vacantActionBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookingAction?.("quickCheckin", null, snapshot.room);
                            }}
                          >
                            <Plus size={11} strokeWidth={2.5} /> Nhận phòng nhanh
                          </button>
                        </div>
                      </div>
                    )}

                    {(isInHouse || isReserved) && (() => {
                      const b = snapshot.booking || {
                        guest: isInHouse ? "Thắng Nguyễn" : "Hoàng Yến",
                        source: isInHouse ? "Agoda" : "Booking.com",
                        sourceGroup: "OTA",
                        segment: "Công tác",
                        gender: "Nam",
                        nationality: "VN",
                        checkIn: selectedDate,
                        checkOut: addDays(selectedDate, 1),
                      };
                      const meta = STATUS_META[snapshot.status] || { label: isInHouse ? "Có khách" : "Đã đặt" };
                      const sourceMeta = SOURCE_META[b.source] || { code: (b.source || "OTA").slice(0, 2).toUpperCase(), color: "#5c2d91" };
                      const deposit = getDepositAmount(b, snapshot.room);
                      const nights = b.checkIn && b.checkOut
                        ? Math.max(1, Math.ceil((b.checkOut - b.checkIn) / 86400000))
                        : 1;
                      const metaLine = [
                        abbr,
                        `${nights} đêm`,
                        cardFields.showSourceGroup && b.sourceGroup ? `Nguồn ${b.sourceGroup}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ");
                      const formattedGuest = guestLabel(b, cardFields);
                      const formattedTime = timeLabel(b, cardFields);
                      const formattedPrice = priceLabel(b, snapshot.room, cardFields, getRateForDate);

                      return (
                        <div className={styles.cardBody}>
                          <div className={styles.cardHeaderRow}>
                            <span
                              className={styles.sourcePill}
                              style={{ background: sourceMeta.color }}
                              title={b.source}
                            >
                              {sourceMeta.code} {b.source}
                            </span>
                            <span
                              className={styles.statusPill}
                              style={{ color: badgeColor, background: `${badgeColor}18` }}
                            >
                              {meta.label}
                            </span>
                          </div>

                          <div className={styles.guestLine} title={formattedGuest}>
                            {cardFields.guestDisplay === "nationality" && (
                              <span className={styles.bookingFlag}>{b.nationality || "VN"}</span>
                            )}
                            <span className={styles.guestName}>{formattedGuest}</span>
                          </div>

                          <div className={styles.cardMiddleRow}>
                            <div className={styles.dateRangeLine} title={formattedTime}>
                              <Calendar size={10} className={styles.calendarIcon} />
                              <span>{formattedTime}</span>
                            </div>
                          </div>

                          <div className={styles.metaInfoLine} title={metaLine}>
                            {metaLine}
                          </div>

                          <div className={styles.cardBottomRow}>
                            {isInHouse ? (
                              <span className={styles.depositLabel}>
                                Đã cọc {formatNumberVN(deposit)}đ
                              </span>
                            ) : (
                              <span className={styles.depositPillBlue}>
                                {formatDepositPill(deposit)}
                              </span>
                            )}
                            <span className={styles.priceAmount}>{formattedPrice}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {isMaintenance && (() => {
                      const maint = getMaintenanceData(snapshot.room, maintenanceDetails, selectedDate);
                      return (
                        <div className={styles.cardBody}>
                          <div className={styles.cardHeaderRow}>
                            <div className={styles.statusWithDot}>
                              <span className={styles.dotGrey} />
                              <span className={styles.maintenanceStatusText}>Out of Order (Khóa)</span>
                            </div>
                          </div>

                          <div className={styles.cardMiddleRow}>
                            <span className={styles.maintenanceReason} title={maint.reason}>
                              {maint.reason}
                            </span>
                          </div>

                          <div className={styles.cardBottomRow}>
                            <span className={styles.maintenanceCompletion}>
                              Hoàn thành: {maint.end}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
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
