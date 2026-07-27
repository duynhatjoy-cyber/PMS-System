import { Mail, CheckCircle2, TriangleAlert, Clock, Eye } from "lucide-react";
import { HISTORY_STATUS } from "../../../data/emailHistoryData";
import { formatDMY, formatTime } from "../../../utils/format";
import styles from "../EmailHistory.module.css";

function StatusLine({ entry }) {
  if (entry.status === HISTORY_STATUS.ERROR) {
    return (
      <div className={styles.statusLine}>
        <TriangleAlert size={16} className={styles.statusIconError} />
        {entry.campaignTitle}
      </div>
    );
  }
  if (entry.status === HISTORY_STATUS.PENDING) {
    return (
      <div className={styles.statusLine}>
        <Clock size={16} className={styles.statusIconPending} />
        {entry.campaignTitle}
      </div>
    );
  }
  return (
    <div className={styles.statusLine}>
      <CheckCircle2 size={16} className={styles.statusIconSuccess} />
      {entry.campaignTitle}
    </div>
  );
}

function SubLines({ entry }) {
  return (
    <>
      <div className={styles.subLine}>
        + {entry.bookingCode}: {formatDMY(entry.createdAt)}, {formatTime(entry.createdAt)}
      </div>
      {entry.status === HISTORY_STATUS.SUCCESS && entry.sentAt && (
        <div className={styles.subLine}>
          →Gửi: {formatDMY(entry.sentAt)}, {formatTime(entry.sentAt)}
        </div>
      )}
      {entry.status === HISTORY_STATUS.PENDING && (
        <div className={styles.subLine}>→Đang chờ gửi</div>
      )}
      {entry.status === HISTORY_STATUS.ERROR && (
        <div className={`${styles.subLine} ${styles.subLineError}`}>→{entry.errorMessage}</div>
      )}
    </>
  );
}

function HistoryListPanel({ entries, onPreview }) {
  if (entries.length === 0) {
    return (
      <div className={styles.listCard}>
        <div className={styles.emptyState}>Không có lịch sử email nào phù hợp</div>
      </div>
    );
  }

  return (
    <div className={styles.listCard}>
      {entries.map((entry) => (
        <div key={entry.id} className={styles.listRow}>
          <div className={styles.rowMain}>
            <div className={styles.guestName}>{entry.guestName}</div>
            <div className={styles.metaLine}>
              <Mail size={14} />
              <span>{entry.email}</span>
              <span className={styles.roomTag}>Phòng.{entry.room}</span>
            </div>
            <StatusLine entry={entry} />
            <SubLines entry={entry} />
          </div>

          <div className={styles.rowActions}>
            <button
              type="button"
              className={styles.viewBtn}
              title="Xem trước email"
              onClick={() => onPreview(entry)}
            >
              <Eye size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HistoryListPanel;
