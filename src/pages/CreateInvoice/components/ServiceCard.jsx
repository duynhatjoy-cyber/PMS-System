import { Pencil } from "lucide-react";
import { formatCurrency } from "../../../utils/format";
import styles from "./ServiceCard.module.css";

function ServiceCard({ item, onSelect }) {
  return (
    <button type="button" className={styles.card} onClick={() => onSelect(item)}>
      <span className={styles.name}>{item.name}</span>
      <span className={styles.priceBar}>
        {formatCurrency(item.price)}
        {item.editable && <Pencil size={11} className={styles.editIcon} />}
      </span>
    </button>
  );
}

export default ServiceCard;
