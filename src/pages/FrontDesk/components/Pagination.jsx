import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className={styles.bar}>
      <div className={styles.sizeControl}>
        <span>Số lượng mỗi trang</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className={styles.select}
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.info}>
        <span>
          {from} - {to} trên {total}
        </span>
        <button
          type="button"
          className={styles.navBtn}
          title="Trang trước"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          className={styles.navBtn}
          title="Trang sau"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
