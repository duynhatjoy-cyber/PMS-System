import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import EmailRenderedContent from "../../../components/EmailRenderedContent";
import { buildPreviewHtml } from "../../../data/emailHistoryData";
import styles from "../EmailHistory.module.css";

function EmailPreviewModal({ entry, onClose }) {
  const html = buildPreviewHtml(entry);

  return (
    <SlidePanelShell title="Xem trước email" onClose={onClose} width={620}>
      <div className={styles.previewBanner}>Nhà Của My</div>

      <EmailRenderedContent html={html} className={styles.previewBody} />

      <div className={styles.previewFooter}>
        <div className={styles.previewFooterLabel}>*** MỌI THẮC MẮC XIN LIÊN HỆ ***</div>
        <div>P: 028 3822 9988</div>
        <div>A: 12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</div>
        <div>E: info@nhacuamy.vn</div>
      </div>
    </SlidePanelShell>
  );
}

export default EmailPreviewModal;
