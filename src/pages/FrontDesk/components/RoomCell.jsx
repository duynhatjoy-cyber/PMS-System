import { BedDouble, PlaneTakeoff } from "lucide-react";
import styles from "./RoomCell.module.css";

function RoomCell({ room, roomType, tone }) {
  const Icon = tone === "arrival" ? PlaneTakeoff : BedDouble;

  return (
    <div className={styles.cell}>
      <div className={`${styles.icon} ${tone === "arrival" ? styles.iconArrival : styles.iconStay}`}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className={styles.text}>
        <div className={styles.room}>{room || "Chưa gán"}</div>
        <div className={styles.type}>{roomType}</div>
      </div>
    </div>
  );
}

export default RoomCell;
