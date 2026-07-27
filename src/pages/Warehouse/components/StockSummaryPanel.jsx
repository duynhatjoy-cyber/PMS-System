import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import FilterBar from "./FilterBar";
import WarehousePagination from "./WarehousePagination";
import StockDetailModal from "../modals/StockDetailModal";
import { STOCK_SUMMARY_ROWS, WAREHOUSES } from "../../../data/warehouseData";
import { startOfDay } from "../../../utils/format";
import styles from "../Warehouse.module.css";

const today = startOfDay(new Date());
const KHO_OPTIONS = ["Tất cả", ...WAREHOUSES];
const NHOM_NVL_OPTIONS = ["Tất cả"];

function StockSummaryPanel({ onToast }) {
  const [preset, setPreset] = useState("Hôm nay");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [kho, setKho] = useState(KHO_OPTIONS[0]);
  const [nhomNvl, setNhomNvl] = useState(NHOM_NVL_OPTIONS[0]);
  const [rows] = useState(STOCK_SUMMARY_ROWS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailRow, setDetailRow] = useState(null);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return (
    <div>
      <FilterBar
        preset={preset}
        onPresetChange={setPreset}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        combinedDateLabel="Khoảng ngày"
        onSubmit={() => onToast("Đã lấy dữ liệu tồn kho")}
      >
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Kho</label>
          <select className={styles.selectBox} value={kho} onChange={(e) => setKho(e.target.value)}>
            {KHO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Nhóm NVL</label>
          <select
            className={styles.selectBox}
            value={nhomNvl}
            onChange={(e) => setNhomNvl(e.target.value)}
          >
            {NHOM_NVL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nguyên vật liệu</th>
              <th className={styles.numCell}>Đơn vị</th>
              <th className={styles.numCell}>Tồn đầu kỳ</th>
              <th className={styles.numCell}>Số lượng nhập</th>
              <th className={styles.numCell}>Số lượng xuất</th>
              <th className={styles.numCell}>Tồn cuối kỳ</th>
              <th className={styles.thActionCell} />
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr className={styles.emptyRow}>
                <td colSpan={7}>Không tìm thấy dữ liệu</td>
              </tr>
            ) : (
              pagedRows.map((row) => (
                <tr key={row.material}>
                  <td>{row.material}</td>
                  <td className={styles.numCell}>{row.unit}</td>
                  <td className={styles.numCell}>{row.opening}</td>
                  <td className={styles.numCell}>{row.imported}</td>
                  <td className={styles.numCell}>{row.exported}</td>
                  <td className={styles.numCell}>{row.closing}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.viewBtn}
                      title={`Xem chi tiết ${row.material}`}
                      onClick={() => setDetailRow(row)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <WarehousePagination
        page={page}
        pageSize={pageSize}
        total={rows.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {detailRow && (
        <StockDetailModal
          kho={kho}
          material={detailRow}
          fromDate={fromDate}
          toDate={toDate}
          onClose={() => setDetailRow(null)}
          onToast={onToast}
        />
      )}
    </div>
  );
}

export default StockSummaryPanel;
