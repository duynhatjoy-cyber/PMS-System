import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useMenuFlip from "../hooks/useMenuFlip";
import styles from "./IconPopup.module.css";

function IconPopup({ icon: Icon, label, title, items, children, filled, align = "right" }) {
  const [open, setOpen] = useState(false);
  const { rootRef, menuRef } = useMenuFlip(open, align);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, rootRef, menuRef]);

  return (
    <div className={styles.wrap} ref={rootRef}>
      <button
        type="button"
        className={filled ? styles.iconBtnFilled : styles.iconBtn}
        onClick={() => setOpen((v) => !v)}
        title={title}
      >
        <Icon size={16} />
        {label && <span>{label}</span>}
      </button>

      {open &&
        createPortal(
          <div ref={menuRef} className={styles.menu}>
            {items
              ? items.map((item, index) => (
                  <button
                    key={item.key || index}
                    type="button"
                    className={styles.menuItem}
                    onClick={() => {
                      setOpen(false);
                      item.onClick();
                    }}
                  >
                    {item.label}
                  </button>
                ))
              : children}
          </div>,
          document.body
        )}
    </div>
  );
}

export default IconPopup;
