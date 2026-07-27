import { Pencil } from "lucide-react";
import { formatCurrency } from "../../../utils/format";
import { CATEGORY_BADGES } from "../../../data/invoiceServiceData";
import styles from "./ServiceCard.module.css";

const TONE_CLASS = {
  minibar: "categoryMinibar",
  other: "categoryOther",
  extra: "categoryExtra",
};

function ServiceCard({ item, onSelect }) {
  const badge = CATEGORY_BADGES[item.category];

  return (
    <button type="button" className={styles.card} onClick={() => onSelect(item)}>
      {badge && (
        <span
          className={`${styles.categoryBadge} ${styles[TONE_CLASS[badge.tone]] || ""}`}
          title={item.category}
        >
          {badge.label}
        </span>
      )}
      <span className={styles.name}>{item.name}</span>
      <span className={styles.priceBar}>
        {formatCurrency(item.price)}
        {item.editable && <Pencil size={11} className={styles.editIcon} />}
      </span>
    </button>
  );
}

export default ServiceCard;
