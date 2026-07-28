import { GripVertical, X } from "lucide-react";
import styles from "./TaxFeeChip.module.css";

function TaxFeeChip({ taxFee, draggable = false, removable = false, onRemove }) {
  return (
    <div
      className={`${styles.chip} ${taxFee.type === "fee" ? styles.chipFee : styles.chipTax}`}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", taxFee.id);
        e.dataTransfer.effectAllowed = "copy";
      }}
      title={taxFee.description || taxFee.name}
    >
      {draggable && <GripVertical size={13} className={styles.gripIcon} />}
      <span className={styles.chipName}>{taxFee.name}</span>
      <span className={styles.chipPercent}>{taxFee.percent}%</span>

      {removable && (
        <button
          type="button"
          className={styles.removeBtn}
          onClick={() => onRemove(taxFee.id)}
          aria-label={`Bỏ áp dụng ${taxFee.name}`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export default TaxFeeChip;
