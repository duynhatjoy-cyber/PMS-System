import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  formatDMY,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeekMonday,
  startOfYear,
} from "../../../utils/format";
import styles from "./DateRangePicker.module.css";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function buildPresets(today) {
  const lastMonth = addMonths(today, -1);
  const lastQuarterAnchor = addMonths(today, -3);
  const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  return [
    { label: "Hôm nay", range: () => [today, today] },
    { label: "Tuần này", range: () => [startOfWeekMonday(today), addDays(startOfWeekMonday(today), 6)] },
    { label: "Tháng này", range: () => [startOfMonth(today), endOfMonth(today)] },
    { label: "Tháng trước", range: () => [startOfMonth(lastMonth), endOfMonth(lastMonth)] },
    { label: "Quý này", range: () => [startOfQuarter(today), endOfQuarter(today)] },
    { label: "Quý trước", range: () => [startOfQuarter(lastQuarterAnchor), endOfQuarter(lastQuarterAnchor)] },
    { label: "6 tháng trước", range: () => [addMonths(today, -6), today] },
    { label: "Năm nay", range: () => [startOfYear(today), endOfYear(today)] },
    { label: "Năm trước", range: () => [startOfYear(lastYear), endOfYear(lastYear)] },
  ];
}

function buildMonthGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const leadingBlanks = (first.getDay() + 7) % 7;
  const daysInMonth = endOfMonth(monthDate).getDate();

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
  return cells;
}

function MonthGrid({ monthDate, start, end, onPick }) {
  const cells = buildMonthGrid(monthDate);

  function isInRange(date) {
    if (!date || !start || !end) return false;
    return date >= startOfDay(start) && date <= startOfDay(end);
  }

  return (
    <div className={styles.month}>
      <div className={styles.monthLabel}>
        Tháng {monthDate.getMonth() + 1}, {monthDate.getFullYear()}
      </div>

      <div className={styles.weekdayRow}>
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className={styles.dayGrid}>
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;

          const isStart = start && isSameDay(date, start);
          const isEnd = end && isSameDay(date, end);
          const inRange = isInRange(date);

          return (
            <button
              type="button"
              key={date.toISOString()}
              className={`${styles.day} ${inRange ? styles.dayInRange : ""} ${
                isStart || isEnd ? styles.dayEdge : ""
              }`}
              onClick={() => onPick(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({ start, end, onChange, months = 2 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(start || new Date()));
  const [draftStart, setDraftStart] = useState(start);
  const [draftEnd, setDraftEnd] = useState(end);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  function openPicker() {
    setDraftStart(start);
    setDraftEnd(end);
    setViewMonth(startOfMonth(start || new Date()));
    setIsOpen(true);
  }

  function pickDate(date) {
    if (!draftStart || draftEnd) {
      setDraftStart(date);
      setDraftEnd(null);
      return;
    }

    const newStart = date < draftStart ? date : draftStart;
    const newEnd = date < draftStart ? draftStart : date;
    setDraftStart(newStart);
    setDraftEnd(newEnd);
    onChange(newStart, newEnd);
    setIsOpen(false);
  }

  function applyPreset(preset) {
    const [presetStart, presetEnd] = preset.range();
    onChange(startOfDay(presetStart), startOfDay(presetEnd));
    setIsOpen(false);
  }

  const secondMonth = addMonths(viewMonth, 1);

  return (
    <div className={styles.root} ref={rootRef}>
      <button type="button" className={styles.trigger} onClick={() => (isOpen ? setIsOpen(false) : openPicker())}>
        <Calendar size={15} />
        {formatDMY(start)} - {formatDMY(end)}
      </button>

      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.calendars}>
            <button type="button" className={styles.navBtn} onClick={() => setViewMonth((m) => addMonths(m, -1))}>
              <ChevronLeft size={16} />
            </button>

            <MonthGrid monthDate={viewMonth} start={draftStart} end={draftEnd} onPick={pickDate} />
            {months > 1 && <MonthGrid monthDate={secondMonth} start={draftStart} end={draftEnd} onPick={pickDate} />}

            <button type="button" className={styles.navBtn} onClick={() => setViewMonth((m) => addMonths(m, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.presets} style={{ gridTemplateColumns: `repeat(${months > 1 ? 3 : 2}, minmax(0, 1fr))` }}>
            {buildPresets(startOfDay(new Date())).map((preset) => (
              <button
                type="button"
                key={preset.label}
                className={styles.presetBtn}
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
