import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DATE_PRESETS } from "../../../data/warehouseData";
import styles from "../Warehouse.module.css";

function PresetDateDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
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

  return (
    <div className={styles.presetWrap} ref={wrapRef}>
      <button type="button" className={styles.presetBtn} onClick={() => setOpen((prev) => !prev)}>
        {value}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className={styles.presetMenu}>
          {DATE_PRESETS.map((preset) => (
            <div
              key={preset}
              className={`${styles.presetMenuItem} ${
                preset === value ? styles.presetMenuItemActive : ""
              }`}
              onClick={() => {
                onChange(preset);
                setOpen(false);
              }}
            >
              {preset}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PresetDateDropdown;
