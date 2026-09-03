import { X } from "lucide-react";
import styles from "./SlidePanelShell.module.css";

// Drop-in cho ModalShell với cùng API (title/header/onClose/children/footer/width/tone)
// nhưng hiển thị dạng panel trượt từ phải thay vì modal giữa màn hình — dùng cho
// các nội dung thêm/sửa/xem chi tiết. Thông báo/xác nhận vẫn dùng ModalShell.
// "brand" panels (the wide "Thêm phiếu ..." forms-with-a-table) scale up on
// larger screens instead of staying pinned at `width`px forever — `width` is
// treated as the size at a 1440px-wide viewport, growing up to 1.8x that on
// bigger monitors so they read as roomy, not cramped, on modern displays.
function panelWidth(width, tone) {
  if (tone !== "brand") return `min(${width}px, 100%)`;
  return `clamp(${width}px, ${(width / 1440) * 100}vw, ${Math.round(width * 1.8)}px)`;
}

function SlidePanelShell({ title, header, onClose, children, footer, width = 440, tone = "default" }) {
  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={styles.panel} style={{ width: panelWidth(width, tone) }}>
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
