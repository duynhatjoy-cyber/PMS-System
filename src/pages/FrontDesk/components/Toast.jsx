import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import styles from "./Toast.module.css";

function Toast({ message, onDismiss }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3200);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className={styles.toast} role="status">
      <CheckCircle2 size={17} />
      <span>{message}</span>
    </div>
  );
}

export default Toast;
