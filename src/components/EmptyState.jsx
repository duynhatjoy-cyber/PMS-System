import { Inbox } from "lucide-react";
import styles from "./EmptyState.module.css";

// Friendlier "no data" state — icon + one clear line, optional next-step hint
// — used in place of bare grey text across tables and list panels.
function EmptyState({ icon: Icon = Inbox, message, hint }) {
  return (
    <div className={styles.wrap}>
      <Icon size={28} className={styles.icon} />
      <div className={styles.message}>{message}</div>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

export default EmptyState;
