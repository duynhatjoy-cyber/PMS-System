import { CURRENT_PLAN } from "../../../data/settingsData";
import styles from "../Settings.module.css";

function UsageBar({ label, used, limit }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className={styles.usageRow}>
      <div className={styles.usageHead}>
        <span>{label}</span>
        <span className={styles.usageCount}>
          {used} / {limit}
        </span>
      </div>
      <div className={styles.usageTrack}>
        <div className={styles.usageFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PlanPanel() {
  return (
    <div className={styles.panelStack}>
      <div className={styles.card}>
        <div>
          <div className={styles.cardSubtitle}>Gói hiện tại</div>
          <div className={styles.planNameRow}>
            <span className={styles.planName}>{CURRENT_PLAN.name}</span>
            <span className={styles.planBadge}>{CURRENT_PLAN.badge}</span>
          </div>
        </div>

        <div>
          <div className={styles.cardSubtitle}>Sử dụng tháng này</div>
          <div className={styles.usageStack}>
            <UsageBar {...CURRENT_PLAN.usage.conversations} />
            <UsageBar {...CURRENT_PLAN.usage.knowledgeEntries} />
          </div>
        </div>

        <div>
          <button type="button" className={styles.upgradeBtn} disabled>
            Nâng cấp gói (sắp ra mắt)
          </button>
          <p className={styles.starHint} style={{ marginTop: 8 }}>
            Liên hệ team Bellhop để nâng cấp gói dịch vụ.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PlanPanel;
