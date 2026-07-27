import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer } from "lucide-react";
import useMenuFlip from "../hooks/useMenuFlip";
import styles from "./PrintMenu.module.css";

function PrintMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const { rootRef, menuRef } = useMenuFlip(open);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, rootRef, menuRef]);

  function choose(key) {
    setOpen(false);
    onSelect(key);
  }

  return (
    <div className={styles.wrap} ref={rootRef}>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={() => setOpen((v) => !v)}
        title="In"
      >
        <Printer size={16} />
      </button>

      {open &&
        createPortal(
          <div ref={menuRef} className={styles.menu}>
            <button type="button" className={styles.menuItem} onClick={() => choose("invoice")}>
              Xem/in hóa đơn
            </button>
            <button type="button" className={styles.menuItem} onClick={() => choose("now")}>
              Thời điểm hiện tại
            </button>
            <button type="button" className={styles.menuItem} onClick={() => choose("checkout")}>
              Thời điểm trả phòng
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

export default PrintMenu;
