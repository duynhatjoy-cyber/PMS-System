import { useState } from "react";
import TaxFeeChip from "./TaxFeeChip";
import styles from "./ApplyTargetCard.module.css";

function ApplyTargetCard({
  icon: Icon,
  title,
  subtitle,
  variant,
  onVariantChange,
  slotKey,
  appliedIds,
  taxFeesById,
  onDrop,
  onRemove,
  formula,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const appliedChips = appliedIds.map((id) => taxFeesById[id]).filter(Boolean);

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardIcon}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <div>
          <div className={styles.cardTitle}>{title}</div>
          {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
        </div>
      </div>

      {variant !== undefined && (
        <div className={styles.segmented} role="tablist" aria-label="Thời điểm áp dụng">
          <button
            type="button"
            className={variant === "before" ? styles.segmentActive : styles.segment}
            onClick={() => onVariantChange("before")}
          >
            Trước giảm giá
          </button>
          <button
            type="button"
            className={variant === "after" ? styles.segmentActive : styles.segment}
            onClick={() => onVariantChange("after")}
          >
            Sau giảm giá
          </button>
        </div>
      )}

      <div
        className={`${styles.well} ${isDragOver ? styles.wellDragOver : ""} ${
          appliedChips.length ? styles.wellFilled : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const taxFeeId = e.dataTransfer.getData("text/plain");
          if (taxFeeId) onDrop(slotKey, taxFeeId);
        }}
      >
        {appliedChips.length > 0 ? (
          appliedChips.map((taxFee) => (
            <TaxFeeChip key={taxFee.id} taxFee={taxFee} removable onRemove={(id) => onRemove(slotKey, id)} />
          ))
        ) : (
          <span className={styles.wellPlaceholder}>Kéo Thuế/Phí vào đây để áp dụng</span>
        )}
      </div>

      <div className={styles.formulaRow}>
        <span className={styles.formulaLabel}>Công thức áp dụng</span>
        <code className={styles.formulaText}>{formula}</code>
      </div>
    </div>
  );
}

export default ApplyTargetCard;
