import { Check } from "lucide-react";
import styles from "./ReportCategoryCard.module.css";

function ReportCategoryCard({ icon: Icon, title, items, isPinned, onTogglePin }) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.iconChip}>
          <Icon size={16} strokeWidth={1.8} />
        </div>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.body}>
        {items.map((item) => {
          const pinned = isPinned(item.id);
          const ItemIcon = item.icon;

          return (
            <button
              type="button"
              key={item.id}
              className={`${styles.row} ${pinned ? styles.rowActive : ""}`}
              onClick={() => onTogglePin(item)}
              aria-pressed={pinned}
            >
              <span className={styles.rowLeft}>
                <ItemIcon size={16} strokeWidth={1.8} className={styles.rowIcon} />
                <span className={styles.rowLabel}>{item.label}</span>
              </span>

              <span className={`${styles.checkbox} ${pinned ? styles.checkboxChecked : ""}`}>
                {pinned && <Check size={12} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ReportCategoryCard;
