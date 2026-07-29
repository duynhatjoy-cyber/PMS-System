import { useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDMY, isSameDay } from "../utils/format";
import useOutsideClick from "../utils/useOutsideClick";

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

// `styles` is the calling page's own CSS module — each page keeps its exact
// existing look; this component only shares the calendar-picker behavior.
function DateField({ label, value, onChange, styles, showFooter = false }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const wrapRef = useRef(null);

  useOutsideClick(open, [wrapRef], () => setOpen(false));

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
                const selected = isSameDay(day, value);
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

            {showFooter && (
              <div className={styles.calendarFooter}>
                {WEEKDAY_FULL[value.getDay()]}, {MONTH_FULL[value.getMonth()]} {value.getDate()},{" "}
                {value.getFullYear()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DateField;
