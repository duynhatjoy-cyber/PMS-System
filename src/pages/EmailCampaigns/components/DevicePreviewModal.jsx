import { Monitor, Tablet, Smartphone } from "lucide-react";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import EmailRenderedContent from "../../../components/EmailRenderedContent";
import { fillTemplate } from "../../../data/emailHistoryData";
import { TEMPLATES_BY_TRIGGER } from "../../../data/emailCampaignData";
import styles from "../EmailCampaigns.module.css";

const DEVICE_CONFIG = {
  desktop: { label: "Máy tính", width: 720, icon: Monitor },
  tablet: { label: "Máy tính bảng", width: 560, icon: Tablet },
  mobile: { label: "Điện thoại", width: 360, icon: Smartphone },
};

function DevicePreviewModal({ campaign, device, onClose }) {
  const config = DEVICE_CONFIG[device] || DEVICE_CONFIG.desktop;
  const Icon = config.icon;

  const template = campaign.bodyHtml || TEMPLATES_BY_TRIGGER[campaign.trigger] || TEMPLATES_BY_TRIGGER.upcoming;
  const html = fillTemplate(template, { Guest_Name: "Nguyễn Văn A" });
  const hotelName = "Nhà Của My";

  return (
    <ModalShell
      title={
        <span className={styles.deviceModalTitle}>
          <Icon size={17} /> Xem trước · {config.label}
        </span>
      }
      onClose={onClose}
      width={config.width + 64}
    >
      <div className={styles.deviceFrame} style={{ width: config.width }}>
        <div className={styles.mailSubject}>{campaign.subject || campaign.title}</div>

        <div className={styles.mailMeta}>
          <span className={styles.mailAvatar}>NC</span>
          <div className={styles.mailMetaText}>
            <div className={styles.mailSender}>
              {hotelName} <span className={styles.mailAddr}>&lt;noreply@nhacuamy.vn&gt;</span>
            </div>
            <div className={styles.mailTo}>đến tôi</div>
          </div>
        </div>

        <div className={styles.mailBody}>
          <EmailRenderedContent html={html} stacked={device === "mobile"} />
        </div>
      </div>
    </ModalShell>
  );
}

export default DevicePreviewModal;
