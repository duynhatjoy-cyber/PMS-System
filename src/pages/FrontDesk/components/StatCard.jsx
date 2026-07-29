import styles from "./StatCard.module.css";

function StatCard({ label, value, valueClassName, hint }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.value} ${valueClassName || ""}`}>{value}</div>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

export default StatCard;
