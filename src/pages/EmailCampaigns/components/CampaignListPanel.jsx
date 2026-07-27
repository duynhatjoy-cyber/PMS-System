import { Monitor, Tablet, Smartphone, CirclePause, Plus } from "lucide-react";
import styles from "../EmailCampaigns.module.css";

function CampaignListPanel({
  campaigns,
  showDeleted,
  onToggleShowDeleted,
  onCreate,
  onSelect,
  onToggleStatus,
}) {
  return (
    <div>
      <div className={styles.headerRow}>
        <div className={styles.title}>Chiến dịch email</div>

        <div className={styles.headerActions}>
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={showDeleted} onChange={onToggleShowDeleted} />
            Hiển thị xóa
          </label>

          <button type="button" className={styles.primaryBtn} onClick={onCreate}>
            <Plus size={16} /> THÊM
          </button>
        </div>
      </div>

      <div className={styles.listCard}>
        {campaigns.length === 0 ? (
          <div className={styles.emptyState}>Chưa có chiến dịch email nào</div>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} className={styles.listRow} onClick={() => onSelect(c.id)}>
              <div className={styles.rowText}>
                <div className={styles.rowTitle}>{c.title}</div>
                <div className={styles.rowSubtitle}>{c.subtitle}</div>
              </div>

              <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                {c.status === "active" && (
                  <button
                    type="button"
                    className={styles.statusBtn}
                    title="Tạm dừng chiến dịch"
                    onClick={() => onToggleStatus(c.id)}
                  >
                    <CirclePause size={18} />
                  </button>
                )}
                <span className={styles.deviceIcon} title="Xem trên máy tính">
                  <Monitor size={18} />
                </span>
                <span className={styles.deviceIcon} title="Xem trên máy tính bảng">
                  <Tablet size={18} />
                </span>
                <span className={styles.deviceIcon} title="Xem trên điện thoại">
                  <Smartphone size={18} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CampaignListPanel;
