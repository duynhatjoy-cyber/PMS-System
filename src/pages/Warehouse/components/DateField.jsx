import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDMY } from "../../../utils/format";
import styles from "../Warehouse.module.css";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function buildMonthGrid(viewYear, viewMonth) {
  const firstDay = new Date(viewYear, viewMonth, 1);
  const startOffset = firstDay.getDay();
  const gridStart = new Date(viewYear, viewMonth, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function DateField({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggleOpen() {
    if (!open) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
    setOpen((prev) => !prev);
  }

  function changeMonth(delta) {
    let nextMonth = viewMonth + delta;
    let nextYear = viewYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setViewMonth(nextMonth);
    setViewYear(nextYear);
  }

  function selectDay(day) {
    onChange(day);
    setOpen(false);
  }

  const days = buildMonthGrid(viewYear, viewMonth);

  return (
    <div className={styles.field}>
      {label && <label className={styles.fieldLabel}>{label}</label>}
      <div className={styles.dateFieldWrap} ref={wrapRef}>
        <div className={styles.dateInputBox}>
          <input type="text" readOnly value={formatDMY(value)} onClick={toggleOpen} />
          <button type="button" className={styles.dateIconBtn} onClick={toggleOpen}>
            <Calendar size={15} />
          </button>
        </div>

        {open && (
          <div className={styles.calendarPopover}>
            <div className={styles.calendarHeader}>
              <button type="button" className={styles.calendarNavBtn} onClick={() => changeMonth(-1)}>
                <ChevronLeft size={15} />
              </button>
              <span className={styles.calendarTitle}>
                {MONTH_FULL[viewMonth]} {viewYear}
              </span>
              <button type="button" className={styles.calendarNavBtn} onClick={() => changeMonth(1)}>
                <ChevronRight size={15} />
              </button>
            </div>

            <div className={styles.calendarGrid}>
              {WEEKDAYS.map((wd) => (
                <div key={wd} className={styles.calendarWeekday}>
                  {wd}
                </div>
              ))}
              {days.map((day) => {
                const outside = day.getMonth() !== viewMonth;
                const selected = isSameDate(day, value);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    className={`${styles.calendarDay} ${outside ? styles.calendarDayMuted : ""} ${
                      selected ? styles.calendarDaySelected : ""
                    }`}
                    onClick={() => selectDay(day)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className={styles.calendarFooter}>
              {WEEKDAY_FULL[value.getDay()]}, {MONTH_FULL[value.getMonth()]} {value.getDate()},{" "}
              {value.getFullYear()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DateField;
