import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import styles from "./FieldPickerPopover.module.css";

// Popover chọn hiển thị/ẩn một tập "field" (dùng chung cho cả cột bảng và ô
// lọc — 2 khái niệm khác nhau nhưng cùng 1 kiểu tương tác). Chỉnh nháp
// (draft) trong popover, chỉ áp dụng khi bấm "Áp dụng" — tránh đổi layout
// ngay khi đang tick.
function FieldPickerPopover({ triggerLabel, triggerIcon: TriggerIcon, pinnedLabels = [], options, visible, defaultVisible, onApply, searchable = false, mode = "multi", align = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(visible);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

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
    setQuery("");
    setIsOpen(true);
  }

  function toggle(key) {
    setDraft((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function apply() {
    onApply(draft);
    setIsOpen(false);
  }

  function selectSingle(key) {
    onApply([key]);
    setIsOpen(false);
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button type="button" className={styles.trigger} onClick={() => (isOpen ? setIsOpen(false) : open())}>
        <TriggerIcon size={15} /> {triggerLabel}
      </button>

      {isOpen && (
        <div className={`${styles.popover} ${align === "left" ? styles.popoverLeft : ""}`}>
          {pinnedLabels.map((label) => (
            <label key={label} className={`${styles.option} ${styles.optionPinned}`}>
              <input type="checkbox" checked disabled />
              {label}
            </label>
          ))}

          {pinnedLabels.length > 0 && <div className={styles.divider} />}

          {searchable && (
            <div className={styles.search}>
              <Search size={13} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className={styles.list}>
            {mode === "single"
              ? filteredOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.key}
                    className={`${styles.singleOption} ${visible[0] === opt.key ? styles.singleOptionActive : ""}`}
                    onClick={() => selectSingle(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))
              : filteredOptions.map((opt) => (
                  <label key={opt.key} className={styles.option}>
                    <input type="checkbox" checked={draft.includes(opt.key)} onChange={() => toggle(opt.key)} />
                    {opt.label}
                  </label>
                ))}
            {searchable && !filteredOptions.length && <div className={styles.noResults}>Không có kết quả</div>}
          </div>

          {mode !== "single" && (
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
          )}
        </div>
      )}
    </div>
  );
}

export default FieldPickerPopover;
