import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Brush, ChevronDown, ChevronRight, Wrench } from "lucide-react";
import useOutsideClick from "../../../utils/useOutsideClick";
import { useBookingCardFields } from "../../../utils/bookingCardConfig";
import { extraLabels, guestLabel, priceLabel, timeLabel } from "../../../utils/bookingCardPresentation";
import { colorForStatus, useRoomStatusColors } from "../../../utils/roomColorConfig";
import {
  addDays,
  addMonths,
  formatCompactVND,
  formatTime,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "../../../utils/format";
import {
  computeBoardSummary,
  computeRoomSnapshotsWithOverrides,
  computeTypeAvailability,
  getRateForDate,
  ROOMS,
  ROOM_TYPES,
  SOURCE_META,
  WEEKDAY_HEAD,
} from "../../../data/roomMapData";
import styles from "../RoomMap.module.css";
import BookingActionMenu from "./BookingActionMenu";

const COL_WIDTH = { day: 60, week: 170, month: 56 };
const LABEL_WIDTH = 96;

function getRange(selectedDate, periodMode) {
  if (periodMode === "day") {
    const start = startOfDay(selectedDate);
    return { start, end: addDays(start, 1) };
  }
  if (periodMode === "week") {
    const start = startOfDay(selectedDate);
    return { start, end: addDays(start, 7) };
  }
  const start = startOfMonth(selectedDate);
  return { start, end: startOfMonth(addMonths(start, 1)) };
}

function getColumns(range, periodMode) {
  if (periodMode === "day") {
    return Array.from({ length: 24 }, (_, h) => ({ key: h, label: String(h).padStart(2, "0"), isWeekend: false }));
  }
  const days = [];
  for (let d = range.start; d < range.end; d = addDays(d, 1)) days.push(d);
  return days.map((d) => ({
    key: d.getTime(),
    label: `${WEEKDAY_HEAD[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}`,
    isWeekend: d.getDay() === 0 || d.getDay() === 6,
    date: d,
  }));
}

function layoutBooking(booking, range) {
  const rangeStartMs = range.start.getTime();
  const rangeEndMs = range.end.getTime();
  const startMs = Math.max(booking.checkIn.getTime(), rangeStartMs);
  const endMs = Math.min(booking.checkOut.getTime(), rangeEndMs);
  if (endMs <= startMs) return null;
  const total = rangeEndMs - rangeStartMs;
  return {
    leftPct: ((startMs - rangeStartMs) / total) * 100,
    widthPct: ((endMs - startMs) / total) * 100,
    clippedStart: startMs > booking.checkIn.getTime(),
    clippedEnd: endMs < booking.checkOut.getTime(),
  };
}

// Hàng nhóm theo Loại phòng còn mang theo "ARI" (giá + số phòng trống) cho
// từng cột ngày — chỉ tính được khi cột là theo ngày (Tuần/Tháng), chế độ
// Ngày dùng cột theo giờ nên bỏ qua, hiển thị số phòng thay vào đó.
function buildRows(groupMode, collapsedTypes, bookings, columns, eligibleRooms) {
  const sortedRooms = [...ROOMS]
    .filter((r) => !eligibleRooms || eligibleRooms.has(r.number))
    .sort((a, b) => a.number.localeCompare(b.number));
  const hasDateColumns = Boolean(columns[0]?.date);
  const rows = [];

  if (groupMode === "room") {
    sortedRooms.forEach((room) => rows.push({ kind: "room", room }));
  } else {
    ROOM_TYPES.forEach((t) => {
      const roomsOfType = sortedRooms.filter((r) => r.typeKey === t.key);
      if (eligibleRooms && roomsOfType.length === 0) return;
      const ariCells = hasDateColumns
        ? columns.map((col) => ({
            rate: getRateForDate(t.key, col.date),
            ...computeTypeAvailability(roomsOfType, bookings, col.date),
          }))
        : null;
      rows.push({ kind: "group", typeKey: t.key, label: t.label, count: roomsOfType.length, ariCells });
      if (!collapsedTypes.has(t.key)) {
        roomsOfType.forEach((room) => rows.push({ kind: "room", room }));
      }
    });
  }

  let roomIndex = -1;
  return rows.map((row) => {
    if (row.kind !== "room") return row;
    roomIndex += 1;
    return { ...row, zebraOdd: roomIndex % 2 === 1 };
  });
}

function barLabel(booking) {
  if (booking.status === "maintenance") return "Sửa phòng";
  return `${booking.source} - ${booking.guest}`;
}

function GanttBoard({
  bookings,
  selectedDate,
  periodMode,
  groupMode,
  highlightStatus,
  highlightToday,
  onToast,
  onOpenDetail,
  onBookingAction,
  onOpenMaintenance,
  roomStatusOverrides = {},
}) {
  const [collapsedTypes, setCollapsedTypes] = useState(() => new Set());
  const [popover, setPopover] = useState(null);
  const [dragging, setDragging] = useState(null);
  const dragRef = useRef(null);
  const popoverRef = useRef(null);
  const scrollRef = useRef(null);
  const cardFields = useBookingCardFields();
  const statusColors = useRoomStatusColors();
  useOutsideClick(Boolean(popover), [popoverRef], () => setPopover(null));

  const roomSnapshots = useMemo(
    () => computeRoomSnapshotsWithOverrides(ROOMS, bookings, roomStatusOverrides, selectedDate),
    [bookings, roomStatusOverrides, selectedDate]
  );
  const snapshotByRoom = useMemo(
    () => Object.fromEntries(roomSnapshots.map((s) => [s.room.number, s])),
    [roomSnapshots]
  );
  const isRoomStatusFilter = highlightStatus === "dirty" || highlightStatus === "maintenance";
  const eligibleRooms = isRoomStatusFilter
    ? new Set(
        roomSnapshots
          .filter((s) => (highlightStatus === "dirty" ? s.housekeeping === "dirty" : s.status === "maintenance"))
          .map((s) => s.room.number)
      )
    : null;

  const range = getRange(selectedDate, periodMode);
  const columns = getColumns(range, periodMode);
  const hasDateColumns = Boolean(columns[0]?.date);
  const colWidth = COL_WIDTH[periodMode];
  const trackWidth = columns.length * colWidth;
  const rows = buildRows(groupMode, collapsedTypes, bookings, columns, eligibleRooms);
  const boardSummary = hasDateColumns ? columns.map((col) => computeBoardSummary(ROOMS, bookings, col.date)) : null;
  const now = new Date();
  const nowPct = now >= range.start && now < range.end ? ((now - range.start) / (range.end - range.start)) * 100 : null;

  // Đưa "hôm nay" vào vùng nhìn thấy khi mở Tuần/Tháng — nếu không, dữ liệu
  // thường nằm lệch phải và bảng trông như trống cho tới khi cuộn tay. Bỏ
  // qua chế độ Ngày: nó luôn bắt đầu từ 00h nên nhãn của các đặt phòng dài
  // ngày (neo bên trái) mới còn nằm trong vùng nhìn thấy.
  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    if (periodMode === "day" || nowPct === null) {
      scrollRef.current.scrollLeft = 0;
      return;
    }
    const target = (nowPct / 100) * trackWidth - 120;
    scrollRef.current.scrollLeft = Math.max(0, target);
  }, [periodMode, selectedDate, nowPct, trackWidth]);

  function toggleGroup(typeKey) {
    setCollapsedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(typeKey)) next.delete(typeKey);
      else next.add(typeKey);
      return next;
    });
  }

  function handleBarClick(e, booking) {
    e.stopPropagation();
    const room = ROOMS.find((item) => item.number === booking.room);
    if (booking.status === "maintenance") {
      onOpenMaintenance(room);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({
      booking,
      room,
      status: booking.status,
      x: Math.max(8, Math.min(rect.left, window.innerWidth - 224)),
      y: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 500)),
    });
  }

  function openVacantMenu(event, room, selectedRange = null) {
    setPopover({
      booking: null,
      room,
      status: "vacant",
      range: selectedRange,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - 224)),
      y: Math.max(8, Math.min(event.clientY + 8, window.innerHeight - 370)),
    });
  }

  function pointerPct(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  }

  function snapDate(pct, roundUp = false) {
    const raw = range.start.getTime() + pct * (range.end - range.start);
    const step = periodMode === "day" ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const snapped = (roundUp ? Math.ceil(raw / step) : Math.floor(raw / step)) * step;
    return new Date(Math.max(range.start.getTime(), Math.min(range.end.getTime(), snapped)));
  }

  function startDrag(event, room) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const pct = pointerPct(event);
    setPopover(null);
    const next = { room, startPct: pct, currentPct: pct, startClientX: event.clientX };
    dragRef.current = next;
    setDragging(next);
  }

  function moveDrag(event, room) {
    const active = dragRef.current;
    if (!active || active.room.number !== room.number) return;
    const next = { ...active, currentPct: pointerPct(event) };
    dragRef.current = next;
    setDragging(next);
  }

  function finishDrag(event, room) {
    const active = dragRef.current;
    if (!active || active.room.number !== room.number) return;
    const endPct = pointerPct(event);
    const distance = Math.abs(event.clientX - active.startClientX);
    const fromPct = Math.min(active.startPct, endPct);
    const toPct = Math.max(active.startPct, endPct);
    dragRef.current = null;
    setDragging(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (distance < 8) {
      const start = snapDate(endPct);
      const end = new Date(start.getTime() + (periodMode === "day" ? 3600000 : 86400000));
      openVacantMenu(event, room, { checkIn: start, checkOut: end });
      return;
    }
    const checkIn = snapDate(fromPct);
    let checkOut = snapDate(toPct, true);
    if (checkOut <= checkIn) checkOut = new Date(checkIn.getTime() + (periodMode === "day" ? 3600000 : 86400000));
    openVacantMenu(event, room, { checkIn, checkOut });
  }

  return (
    <div className={styles.boardWrap}>
      <div className={styles.boardScroll} ref={scrollRef}>
        <div className={styles.headerSticky}>
          <div className={styles.cornerCell}>Phòng</div>
          <div className={styles.colHeaders} style={{ width: trackWidth }}>
            {columns.map((col) => (
              <div
                key={col.key}
                className={`${styles.colHeaderCell} ${col.isWeekend ? styles.colHeaderWeekend : ""} ${
                  highlightToday && col.date && isSameDay(col.date, now) ? styles.colHeaderToday : ""
                }`}
                style={{ width: colWidth }}
              >
                {col.label}
              </div>
            ))}
          </div>
        </div>

        {nowPct !== null && periodMode === "day" && (
          <div className={styles.nowPill} style={{ left: LABEL_WIDTH + (nowPct / 100) * trackWidth }}>
            {formatTime(now)}
          </div>
        )}

        {rows.map((row) => {
          if (row.kind === "group") {
            return (
              <div key={row.typeKey} className={styles.groupHeaderRow}>
                <button
                  type="button"
                  className={styles.groupLabelCell}
                  onClick={() => toggleGroup(row.typeKey)}
                  title={row.label}
                >
                  {collapsedTypes.has(row.typeKey) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  <span className={styles.groupLabelText}>{row.label}</span>
                </button>

                {row.ariCells ? (
                  <div className={styles.groupAriTrack} style={{ width: trackWidth }}>
                    {row.ariCells.map((cell, idx) => (
                      <div key={columns[idx].key} className={styles.ariCell} style={{ width: colWidth }}>
                        <span className={styles.ariRate}>{formatCompactVND(cell.rate)}</span>
                        <span className={`${styles.ariAvail} ${cell.available === 0 ? styles.ariAvailZero : ""}`}>
                          {cell.available}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.groupHeaderCount} style={{ width: trackWidth }}>
                    {row.count} phòng
                  </div>
                )}
              </div>
            );
          }

          const snapshot = snapshotByRoom[row.room.number];
          const isDirty = snapshot?.housekeeping === "dirty";
          const isMaintenance = snapshot?.status === "maintenance";

          return (
            <div key={row.room.number} className={`${styles.roomRow} ${row.zebraOdd ? styles.roomRowOdd : ""}`}>
              <div className={styles.roomLabelCell}>
                <span>{row.room.number}</span>
                {isMaintenance && (
                  <button
                    type="button"
                    className={styles.roomLabelIconBtn}
                    style={{ color: colorForStatus("maintenance", statusColors) }}
                    title="Đang sửa phòng — bấm để xem/xoá"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMaintenance(row.room);
                    }}
                  >
                    <Wrench size={13} />
                  </button>
                )}
                {isDirty && !isMaintenance && (
                  <button
                    type="button"
                    className={styles.roomLabelIconBtn}
                    style={{ color: colorForStatus("dirty", statusColors) }}
                    title="Phòng bẩn — bấm để làm sạch"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingAction("clean", null, row.room);
                    }}
                  >
                    <Brush size={13} />
                  </button>
                )}
              </div>
              <div
                className={styles.timelineCell}
                style={{ width: trackWidth, backgroundSize: `${100 / columns.length}% 100%` }}
                onPointerDown={(event) => startDrag(event, row.room)}
                onPointerMove={(event) => moveDrag(event, row.room)}
                onPointerUp={(event) => finishDrag(event, row.room)}
                onPointerCancel={(event) => finishDrag(event, row.room)}
              >
                {dragging?.room.number === row.room.number && (
                  <div
                    className={styles.rangeSelection}
                    style={{
                      left: `${Math.min(dragging.startPct, dragging.currentPct) * 100}%`,
                      width: `${Math.abs(dragging.currentPct - dragging.startPct) * 100}%`,
                    }}
                  />
                )}
                {nowPct !== null && <div className={styles.nowLine} style={{ left: `${nowPct}%` }} />}
                {bookings
                  .filter((b) => b.room === row.room.number)
                  .map((b) => {
                    const layout = layoutBooking(b, range);
                    if (!layout) return null;
                    const statusColor = colorForStatus(b.status, statusColors);
                    const isMaintenance = b.status === "maintenance";
                    const source = SOURCE_META[b.source];
                    return (
                      <div
                        key={b.id}
                        className={`${styles.bookingBar} ${layout.clippedStart ? styles.barClippedStart : ""} ${
                          layout.clippedEnd ? styles.barClippedEnd : ""
                        } ${isMaintenance ? styles.maintenanceBar : ""} ${
                          highlightStatus && highlightStatus !== b.status ? styles.barDimmed : ""
                        }`}
                        style={
                          isMaintenance
                            ? { left: `${layout.leftPct}%`, width: `${layout.widthPct}%` }
                            : {
                                left: `${layout.leftPct}%`,
                                width: `${layout.widthPct}%`,
                                background: statusColor,
                                color: "#ffffff",
                                borderLeftColor: statusColor,
                              }
                        }
                        title={barLabel(b)}
                        onClick={(e) => handleBarClick(e, b)}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {source && (
                          <span className={styles.sourceBadge} style={{ background: source.color }}>
                            {source.code}
                          </span>
                        )}
                        <span className={styles.barLabel}>
                          {isMaintenance
                            ? "Sửa phòng"
                            : [
                                guestLabel(b, cardFields),
                                timeLabel(b, cardFields),
                                priceLabel(b, row.room, cardFields, getRateForDate),
                                ...extraLabels(b, cardFields),
                              ].join(" · ")}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}

        {boardSummary && (
          <div className={styles.summaryFooterRow}>
            <div className={styles.summaryLabelCell} />
            <div className={styles.summaryTrack} style={{ width: trackWidth }}>
              {boardSummary.map((s, idx) => (
                <div key={columns[idx].key} className={styles.summaryCell} style={{ width: colWidth }}>
                  <span className={styles.summaryBooked}>B:{s.booked}</span>
                  <span className={styles.summaryAvail}>A:{s.available}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default GanttBoard;
