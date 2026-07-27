import styles from "./StatusBadge.module.css";

const VARIANTS = {
  arrival: styles.arrival,
  departure: styles.departure,
  inhouse: styles.inhouse,
};

function StatusBadge({ tone, children }) {
  return <span className={`${styles.badge} ${VARIANTS[tone] || ""}`}>{children}</span>;
}

export default StatusBadge;
