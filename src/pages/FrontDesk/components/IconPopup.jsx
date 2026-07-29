import { useState } from "react";
import { createPortal } from "react-dom";
import useMenuFlip from "../hooks/useMenuFlip";
import useOutsideClick from "../../../utils/useOutsideClick";
import styles from "./IconPopup.module.css";

function IconPopup({ icon: Icon, title, items, children, filled, align = "right" }) {
  const [open, setOpen] = useState(false);
  const { rootRef, menuRef } = useMenuFlip(open, align);

  useOutsideClick(open, [rootRef, menuRef], () => setOpen(false));

  return (
    <div className={styles.wrap} ref={rootRef}>
      <button
        type="button"
        className={filled ? styles.iconBtnFilled : styles.iconBtn}
        onClick={() => setOpen((v) => !v)}
        title={title}
      >
        <Icon size={16} />
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
