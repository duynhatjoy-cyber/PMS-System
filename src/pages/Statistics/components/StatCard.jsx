import styles from "./StatCard.module.css";

function StatCard({ icon: Icon, title, extra, children }) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.iconChip}>
            <Icon size={16} strokeWidth={1.8} />
          </div>
          <span className={styles.title}>{title}</span>
        </div>
        {extra}
      </div>

      <div className={styles.body}>{children}</div>
    </div>
  );
}

export function StatRow({ label, value }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}

export function StatTripleRow({ label, treEm, nguoiLon, tong }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowTriple}>
        {treEm} / {nguoiLon} / {tong}
      </span>
    </div>
  );
}

export default StatCard;
