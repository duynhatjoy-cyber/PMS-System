import { useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import useMenuFlip from "../hooks/useMenuFlip";
import useOutsideClick from "../../../utils/useOutsideClick";
import styles from "./RowActionMenu.module.css";

function RowActionMenu({ items }) {
  const [open, setOpen] = useState(false);
  const { rootRef, menuRef } = useMenuFlip(open);

  useOutsideClick(open, [rootRef, menuRef], () => setOpen(false));

  return (
    <div className={styles.wrap} ref={rootRef}>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={() => setOpen((v) => !v)}
        title="Thao tác khác"
      >
        <MoreHorizontal size={16} />
      </button>

      {open &&
        createPortal(
          <div ref={menuRef} className={styles.menu}>
            {items.map((item, index) => (
              <div key={item.key || index}>
                {item.divider && <div className={styles.divider} />}
                <button
                  type="button"
                  className={`${styles.menuItem} ${item.danger ? styles.danger : ""}`}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

export default RowActionMenu;
