import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import DateRangePicker from "./components/DateRangePicker";
import RevenueBarChart from "./components/RevenueBarChart";
import { REVENUE_BY_DAY } from "./data/revenueData";
import { formatCurrency } from "../../utils/format";
import styles from "./Revenue.module.css";

const GROUP_BY_OPTIONS = ["Theo thời gian", "Theo công ty", "Theo nguồn", "Theo thị trường", "Theo loại phòng"];

function Revenue() {
  const [includeTax, setIncludeTax] = useState(true);
  const [dateBasis, setDateBasis] = useState("checkout");
  const [range, setRange] = useState({ start: new Date(2026, 6, 1), end: new Date(2026, 6, 31) });
  const [groupBy, setGroupBy] = useState(GROUP_BY_OPTIONS[0]);
  const [source, setSource] = useState("Lễ tân");

  const sourceOptions = dateBasis === "checkout" ? ["Lễ tân"] : ["Tất cả", "Lễ tân", "Điểm bán hàng"];

  const chartData = useMemo(() => {
    const taxFactor = includeTax ? 1 : 1 / 1.1;
    return REVENUE_BY_DAY.map((d) => ({
      day: d.day,
      current: d.current != null ? Math.round(d.current * taxFactor) : null,
      previous: d.previous != null ? Math.round(d.previous * taxFactor) : null,
    }));
  }, [includeTax]);

  const totalRevenue = chartData.reduce((sum, d) => sum + (d.current || 0), 0);

  return (
    <div className={styles.page}>
      <section className={styles.filterCard}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Biểu đồ doanh thu</h2>

          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={includeTax} onChange={(e) => setIncludeTax(e.target.checked)} />
            Bao gồm thuế phí
          </label>

          <span className={styles.plainLabel}>Doanh thu ghi nhận vào</span>

          <div className={styles.segmented}>
            <button
              type="button"
              className={dateBasis === "checkout" ? styles.segmentActive : styles.segment}
              onClick={() => setDateBasis("checkout")}
            >
              Ngày trả phòng
            </button>
            <button
              type="button"
              className={dateBasis === "daily" ? styles.segmentActive : styles.segment}
              onClick={() => setDateBasis("daily")}
            >
              Mỗi ngày
            </button>
          </div>
        </div>

        <div className={styles.filterRow}>
          <DateRangePicker
            start={range.start}
            end={range.end}
            onChange={(start, end) => setRange({ start, end })}
          />

          <select className={styles.select} value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            {GROUP_BY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={source}
            disabled={dateBasis === "checkout"}
            onChange={(e) => setSource(e.target.value)}
          >
            {sourceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <button type="button" className={styles.searchBtn}>
            <Search size={15} />
            Tìm kiếm
          </button>
        </div>
      </section>

      <section className={styles.chartCard}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Tổng doanh thu:</span>
          <span className={styles.totalValue}>{formatCurrency(totalRevenue)}</span>
        </div>

        <RevenueBarChart data={chartData} />
      </section>
    </div>
  );
}

export default Revenue;
