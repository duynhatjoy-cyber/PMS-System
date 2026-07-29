import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useMenuFlip from "../../FrontDesk/hooks/useMenuFlip";
import useOutsideClick from "../../../utils/useOutsideClick";
import { addDays, addMonths, isSameDay, startOfMonth, endOfMonth } from "../../../utils/format";
import { WEEKDAY_HEAD } from "../../../data/roomMapData";
import styles from "../RoomMap.module.css";

function buildGrid(viewedMonth) {
  const first = startOfMonth(viewedMonth);
  const last = endOfMonth(viewedMonth);
  const gridStart = addDays(first, -first.getDay());
  const days = [];
  let d = gridStart;
  while (d <= last || d.getDay() !== 0) {
    days.push(d);
    d = addDays(d, 1);
    if (days.length > 42) break;
  }
  return { days, first };
}

function DateNavPopover({ selectedDate, onSelect }) {
  const [open, setOpen] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(selectedDate);
  const { rootRef, menuRef } = useMenuFlip(open, "left");
  useOutsideClick(open, [rootRef, menuRef], () => setOpen(false));

  function handleOpen() {
    setViewedMonth(selectedDate);
    setOpen(true);
  }

  const { days, first } = buildGrid(viewedMonth);

  return (
    <div className={styles.dateNavRoot} ref={rootRef}>
      <button type="button" className={styles.dateBtn} onClick={handleOpen}>
        {selectedDate.toLocaleDateString("vi-VN")}
      </button>

      {open &&
        createPortal(
          <div ref={menuRef} className={styles.calendarPopover}>
            <div className={styles.calendarHead}>
              <button type="button" className={styles.calendarNavBtn} onClick={() => setViewedMonth((d) => addMonths(d, -1))}>
                <ChevronLeft size={15} />
              </button>
              <span>
                Tháng {first.getMonth() + 1} - {first.getFullYear()}
              </span>
              <button type="button" className={styles.calendarNavBtn} onClick={() => setViewedMonth((d) => addMonths(d, 1))}>
                <ChevronRight size={15} />
              </button>
            </div>
            <div className={styles.calendarWeekHead}>
              {WEEKDAY_HEAD.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className={styles.calendarGrid}>
              {days.map((d) => (
                <button
                  key={d.getTime()}
                  type="button"
                  className={`${styles.calendarDay} ${d.getMonth() !== first.getMonth() ? styles.calendarDayMuted : ""} ${
                    isSameDay(d, selectedDate) ? styles.calendarDaySelected : ""
                  }`}
                  onClick={() => {
                    onSelect(d);
                    setOpen(false);
                  }}
                >
                  {d.getDate()}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default DateNavPopover;
