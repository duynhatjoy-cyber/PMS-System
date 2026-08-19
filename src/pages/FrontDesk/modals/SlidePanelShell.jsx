import { X } from "lucide-react";
import styles from "./SlidePanelShell.module.css";

// Drop-in cho ModalShell với cùng API (title/header/onClose/children/footer/width/tone)
// nhưng hiển thị dạng panel trượt từ phải thay vì modal giữa màn hình — dùng cho
// các nội dung thêm/sửa/xem chi tiết. Thông báo/xác nhận vẫn dùng ModalShell.
function SlidePanelShell({ title, header, onClose, children, footer, width = 440, tone = "default" }) {
  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={styles.panel} style={{ width: `min(${width}px, 100%)` }}>
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

        <div className={styles.panelBody}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </aside>
    </div>
  );
}

export default SlidePanelShell;
