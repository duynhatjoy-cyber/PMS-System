import { useState } from "react";
import { formatCompactVND, formatCurrency } from "../../../utils/format";
import { buildTicks } from "./chartMath";
import styles from "./RevenueBarChart.module.css";

const PLOT_HEIGHT = 260;

function RevenueBarChart({ data }) {
  const [activeDay, setActiveDay] = useState(null);
  const maxValue = Math.max(1, ...data.flatMap((d) => [d.current || 0, d.previous || 0]));
  const ticks = buildTicks(maxValue).slice().reverse();
  const niceMax = ticks[0] || 1;

  return (
    <div className={styles.root}>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchCurrent}`} />
          Hiện tại
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchPrevious}`} />
          Cùng kỳ tháng trước
        </span>
      </div>

      <div className={styles.chartRow}>
        <div className={styles.axis} style={{ height: PLOT_HEIGHT }}>
          {ticks.map((tick) => (
            <span key={tick}>{formatCompactVND(tick)}</span>
          ))}
        </div>

        <div className={styles.plot} style={{ height: PLOT_HEIGHT }}>
          {ticks.map((tick) => (
            <div key={tick} className={styles.gridline} />
          ))}

          <div className={styles.columns}>
            {data.map((d) => (
              <div className={styles.column} key={d.day}>
                <div
                  className={styles.barsGroup}
                  onClick={() => setActiveDay((cur) => (cur === d.day ? null : d.day))}
                >
                  {(d.current != null || d.previous != null) && (
                    <div
                      className={`${styles.tooltip} ${activeDay === d.day ? styles.tooltipVisible : ""}`}
                    >
                      <strong>Ngày {d.day}</strong>
                      {d.current != null && (
                        <span>
                          <i className={`${styles.tooltipKey} ${styles.swatchCurrent}`} />
                          Hiện tại: {formatCurrency(d.current)}
                        </span>
                      )}
                      {d.previous != null && (
                        <span>
                          <i className={`${styles.tooltipKey} ${styles.swatchPrevious}`} />
                          Cùng kỳ: {formatCurrency(d.previous)}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`${styles.bar} ${styles.barCurrent}`}
                    style={{ height: `${((d.current || 0) / niceMax) * 100}%` }}
                  />
                  <div
                    className={`${styles.bar} ${styles.barPrevious}`}
                    style={{ height: `${((d.previous || 0) / niceMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.xAxis}>
        <div className={styles.axisSpacer} />
        <div className={styles.xLabelsRow}>
          {data.map((d) => (
            <div className={styles.xLabel} key={d.day}>
              {d.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RevenueBarChart;
