import { X } from "lucide-react";
import styles from "./ModalShell.module.css";

function ModalShell({ title, header, onClose, children, footer, width = 440, tone = "default" }) {
  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.card} style={{ maxWidth: width }}>
        <div className={`${styles.head} ${tone === "brand" ? styles.headBrand : ""}`}>
          {header || <h2 className={styles.title}>{title}</h2>}
          <button
            type="button"
            className={`${styles.closeBtn} ${tone === "brand" ? styles.closeBtnBrand : ""}`}
            onClick={onClose}
            title="Đóng"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

export default ModalShell;
