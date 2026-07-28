import styles from "./CompareBarChart.module.css";

function CompareBarChart({ categories, series, valueFormatter = (v) => v }) {
  const maxValue = Math.max(1, ...series.flatMap((s) => s.values));
  const showLegend = series.length > 1;

  return (
    <div className={styles.root}>
      {showLegend && (
        <div className={styles.legend}>
          {series.map((s) => (
            <span className={styles.legendItem} key={s.name}>
              <span className={styles.swatch} style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}

      <div className={styles.rows}>
        {categories.map((category, i) => (
          <div className={styles.row} key={category}>
            <span className={styles.rowLabel}>{category}</span>

            <div className={styles.track}>
              {series.map((s) => {
                const value = s.values[i] ?? 0;
                const widthPct = (value / maxValue) * 100;
                return (
                  <div className={styles.barLine} key={s.name}>
                    <div
                      className={styles.bar}
                      style={{ width: `${widthPct}%`, background: s.color }}
                    />
                    <span className={styles.valueLabel}>{valueFormatter(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompareBarChart;
