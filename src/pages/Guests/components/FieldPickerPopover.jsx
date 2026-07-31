import { useEffect, useRef, useState } from "react";
import styles from "./FieldPickerPopover.module.css";

// Popover chọn hiển thị/ẩn một tập "field" (dùng chung cho cả cột bảng và ô
// lọc — 2 khái niệm khác nhau nhưng cùng 1 kiểu tương tác). Chỉnh nháp
// (draft) trong popover, chỉ áp dụng khi bấm "Áp dụng" — tránh đổi layout
// ngay khi đang tick.
function FieldPickerPopover({ triggerLabel, triggerIcon: TriggerIcon, pinnedLabels = [], options, visible, defaultVisible, onApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(visible);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  function open() {
    setDraft(visible);
    setIsOpen(true);
  }

  function toggle(key) {
    setDraft((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function apply() {
    onApply(draft);
    setIsOpen(false);
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button type="button" className={styles.trigger} onClick={() => (isOpen ? setIsOpen(false) : open())}>
        <TriggerIcon size={15} /> {triggerLabel}
      </button>

      {isOpen && (
        <div className={styles.popover}>
          {pinnedLabels.map((label) => (
            <label key={label} className={`${styles.option} ${styles.optionPinned}`}>
              <input type="checkbox" checked disabled />
              {label}
            </label>
          ))}

          {pinnedLabels.length > 0 && <div className={styles.divider} />}

          <div className={styles.list}>
            {options.map((opt) => (
              <label key={opt.key} className={styles.option}>
                <input type="checkbox" checked={draft.includes(opt.key)} onChange={() => toggle(opt.key)} />
                {opt.label}
              </label>
            ))}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.resetLink} onClick={() => setDraft(defaultVisible)}>
              Mặc định
            </button>
            <div className={styles.footerBtns}>
              <button
                type="button"
                className={`${styles.footerBtn} ${styles.footerBtnSecondary}`}
                onClick={() => setIsOpen(false)}
              >
                Huỷ
              </button>
              <button type="button" className={`${styles.footerBtn} ${styles.footerBtnPrimary}`} onClick={apply}>
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FieldPickerPopover;
