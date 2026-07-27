import styles from "./StatCard.module.css";

function StatCard({ label, value, valueClassName, hint, flex }) {
  return (
    <div className={styles.card} style={flex ? { flex } : undefined}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.value} ${valueClassName || ""}`}>{value}</div>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

export default StatCard;
