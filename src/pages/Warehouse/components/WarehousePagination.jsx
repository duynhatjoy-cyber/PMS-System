import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./WarehousePagination.module.css";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const DEFAULT_LABELS = { page: "Trang:", rowsPerPage: "Số dòng mỗi trang:", of: "trên" };

function WarehousePagination({ page, pageSize, total, onPageChange, onPageSizeChange, labels }) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className={styles.bar}>
      <div className={styles.control}>
        <span>{L.page}</span>
        <select
          className={styles.select}
          value={page}
          onChange={(e) => onPageChange(Number(e.target.value))}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.control}>
        <span>{L.rowsPerPage}</span>
        <select
          className={styles.select}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <span className={styles.range}>
        {total === 0 ? `0 - ${L.of}` : `${from} - ${to} ${L.of} ${total}`}
      </span>

      <button
        type="button"
        className={styles.navBtn}
        title="Trang trước"
        aria-label="Trang trước"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        className={styles.navBtn}
        title="Trang sau"
        aria-label="Trang sau"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default WarehousePagination;
