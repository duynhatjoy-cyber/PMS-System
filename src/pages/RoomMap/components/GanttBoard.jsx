import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import useOutsideClick from "../../../utils/useOutsideClick";
import {
  addDays,
  addMonths,
  formatCompactVND,
  formatCurrency,
  formatDMY,
  formatTime,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "../../../utils/format";
import {
  computeBoardSummary,
  computeTypeAvailability,
  getRateForDate,
  ROOMS,
  ROOM_TYPES,
  SOURCE_META,
  STATUS_META,
  WEEKDAY_HEAD,
} from "../../../data/roomMapData";
import styles from "../RoomMap.module.css";

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
function buildRows(groupMode, collapsedTypes, bookings, columns) {
  const sortedRooms = [...ROOMS].sort((a, b) => a.number.localeCompare(b.number));
  const hasDateColumns = Boolean(columns[0]?.date);
  const rows = [];

  if (groupMode === "room") {
    sortedRooms.forEach((room) => rows.push({ kind: "room", room }));
  } else {
    ROOM_TYPES.forEach((t) => {
      const roomsOfType = sortedRooms.filter((r) => r.typeKey === t.key);
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

function GanttBoard({ bookings, selectedDate, periodMode, groupMode, saleMode, highlightStatus, highlightToday, onToast }) {
  const [collapsedTypes, setCollapsedTypes] = useState(() => new Set());
  const [popover, setPopover] = useState(null); // { booking, x, y }
  const popoverRef = useRef(null);
  const scrollRef = useRef(null);
  useOutsideClick(Boolean(popover), [popoverRef], () => setPopover(null));

  const range = getRange(selectedDate, periodMode);
  const columns = getColumns(range, periodMode);
  const hasDateColumns = Boolean(columns[0]?.date);
  const colWidth = COL_WIDTH[periodMode];
  const trackWidth = columns.length * colWidth;
  const rows = buildRows(groupMode, collapsedTypes, bookings, columns);
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
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({ booking, x: rect.left, y: rect.bottom + 6 });
  }

  function handleEmptyClick() {
    setPopover(null);
    if (saleMode === "sell") {
      onToast('Tạo đặt phòng nhanh sẽ có ở bản cập nhật tiếp theo — dùng trang "Tạo đặt phòng".');
    }
  }

  const popoverRoom = popover ? ROOMS.find((r) => r.number === popover.booking.room) : null;
  const popoverIsMaintenance = popover?.booking.status === "maintenance";
  const popoverNights = popover
    ? Math.max(1, Math.round((popover.booking.checkOut - popover.booking.checkIn) / 86400000))
    : 0;
  const popoverRate = popoverRoom ? getRateForDate(popoverRoom.typeKey, popover.booking.checkIn) : 0;
  const popoverSource = popover ? SOURCE_META[popover.booking.source] : null;

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

          return (
            <div key={row.room.number} className={`${styles.roomRow} ${row.zebraOdd ? styles.roomRowOdd : ""}`}>
              <div className={styles.roomLabelCell}>{row.room.number}</div>
              <div
                className={styles.timelineCell}
                style={{ width: trackWidth, backgroundSize: `${100 / columns.length}% 100%` }}
                onClick={handleEmptyClick}
              >
                {nowPct !== null && <div className={styles.nowLine} style={{ left: `${nowPct}%` }} />}
                {bookings
                  .filter((b) => b.room === row.room.number)
                  .map((b) => {
                    const layout = layoutBooking(b, range);
                    if (!layout) return null;
                    const meta = STATUS_META[b.status];
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
                                background: meta.soft,
                                color: meta.color,
                                borderLeftColor: meta.color,
                              }
                        }
                        title={barLabel(b)}
                        onClick={(e) => handleBarClick(e, b)}
                      >
                        {source && (
                          <span className={styles.sourceBadge} style={{ background: source.color }}>
                            {source.code}
                          </span>
                        )}
                        <span className={styles.barLabel}>{isMaintenance ? "Sửa phòng" : b.guest}</span>
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
          <div ref={popoverRef} className={styles.bookingPopover} style={{ left: popover.x, top: popover.y }}>
            <div className={styles.popoverTitle}>
              {popoverSource && (
                <span className={styles.sourceBadge} style={{ background: popoverSource.color }}>
                  {popoverSource.code}
                </span>
              )}
              {barLabel(popover.booking)}
            </div>
            <div className={styles.popoverRow}>
              <span className={styles.popoverLabel}>Trạng thái</span>
              <span>{STATUS_META[popover.booking.status].label}</span>
            </div>
            <div className={styles.popoverRow}>
              <span className={styles.popoverLabel}>Nhận phòng</span>
              <span>{formatDMY(popover.booking.checkIn)}</span>
            </div>
            <div className={styles.popoverRow}>
              <span className={styles.popoverLabel}>Trả phòng</span>
              <span>{formatDMY(popover.booking.checkOut)}</span>
            </div>
            {popover.booking.code && (
              <div className={styles.popoverRow}>
                <span className={styles.popoverLabel}>Mã đặt phòng</span>
                <span>#{popover.booking.code}</span>
              </div>
            )}
            {!popoverIsMaintenance && popoverRoom && (
              <>
                <div className={styles.popoverRow}>
                  <span className={styles.popoverLabel}>Giá phòng/đêm</span>
                  <span>{formatCurrency(popoverRate)}</span>
                </div>
                <div className={styles.popoverRow}>
                  <span className={styles.popoverLabel}>Tổng ({popoverNights} đêm)</span>
                  <span>{formatCurrency(popoverRate * popoverNights)}</span>
                </div>
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

export default GanttBoard;
