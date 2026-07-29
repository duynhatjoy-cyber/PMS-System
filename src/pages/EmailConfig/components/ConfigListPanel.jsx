import { CirclePause, CirclePlay, Plus } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import styles from "../EmailConfig.module.css";

function ConfigListPanel({ configs, onCreate, onSelect, onToggleStatus }) {
  return (
    <div>
      <div className={styles.headerRow}>
        <div className={styles.title}>Cấu hình</div>
        <button type="button" className={styles.primaryBtn} onClick={onCreate}>
          <Plus size={16} /> THÊM
        </button>
      </div>

      <div className={styles.listCard}>
        {configs.length === 0 ? (
          <EmptyState message="Chưa có cấu hình email nào" hint="Nhấn THÊM ở góc trên để tạo cấu hình đầu tiên." />
        ) : (
          configs.map((c) => (
            <div key={c.id} className={styles.listRow} onClick={() => onSelect(c.id)}>
              <div>
                <div className={styles.rowTitle}>{c.name}</div>
                <div className={styles.rowSubtitle}>{c.email}</div>
              </div>

              <button
                type="button"
                className={styles.statusBtn}
                title={c.status === "active" ? "Tạm dừng" : "Kích hoạt"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(c.id);
                }}
              >
                {c.status === "active" ? <CirclePause size={18} /> : <CirclePlay size={18} />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ConfigListPanel;
