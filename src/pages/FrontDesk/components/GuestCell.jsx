import { User } from "lucide-react";
import styles from "./GuestCell.module.css";

function GuestCell({ guest, onOpen }) {
  return (
    <div className={styles.cell}>
      <span className={styles.flag} title="Việt Nam">
        VN
      </span>
      <span className={styles.avatar}>
        <User size={13} strokeWidth={2} />
      </span>
      <button type="button" className={styles.name} onClick={onOpen}>
        {guest.name}
      </button>
    </div>
  );
}

export default GuestCell;
