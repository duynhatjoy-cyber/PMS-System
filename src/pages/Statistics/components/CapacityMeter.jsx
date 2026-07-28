import styles from "./CapacityMeter.module.css";

function CapacityMeter({ total, segments }) {
  return (
    <div className={styles.root}>
      <div className={styles.track}>
        {segments.map((s) => (
          <div
            key={s.label}
            className={styles.segment}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
          />
        ))}
      </div>

      <div className={styles.legend}>
        {segments.map((s) => (
          <div className={styles.legendItem} key={s.label}>
            <span className={styles.swatch} style={{ background: s.color }} />
            <span className={styles.legendLabel}>{s.label}</span>
            <span className={styles.legendValue}>{s.value}</span>
          </div>
        ))}

        <div className={styles.legendItem}>
          <span className={styles.legendLabel}>Tổng số phòng</span>
          <span className={styles.legendValue}>{total}</span>
        </div>
      </div>
    </div>
  );
}

export default CapacityMeter;
