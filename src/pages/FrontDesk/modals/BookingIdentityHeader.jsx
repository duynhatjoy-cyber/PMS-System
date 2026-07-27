import { CalendarDays } from "lucide-react";
import styles from "./BookingIdentityHeader.module.css";

function BookingIdentityHeader({ title, booking }) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.chip}>
        <CalendarDays size={14} />
        <span className={styles.room}>
          {booking.roomType} {booking.room || ""}
        </span>
        <span className={styles.flag}>VN</span>
        <span className={styles.guest}>{booking.guest.name}</span>
      </div>
    </div>
  );
}

export default BookingIdentityHeader;
