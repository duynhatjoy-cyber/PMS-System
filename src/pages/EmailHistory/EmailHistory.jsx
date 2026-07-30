import { useMemo, useState } from "react";
import { Mail, LayoutGrid, CheckCircle2, TriangleAlert, Clock } from "lucide-react";
import DateField from "../../components/DateField";
import HistoryListPanel from "./components/HistoryListPanel";
import EmailPreviewModal from "./components/EmailPreviewModal";
import { EMAIL_CAMPAIGNS } from "../../data/emailCampaignData";
import { EMAIL_HISTORY, HISTORY_STATUS } from "../../data/emailHistoryData";
import { isSameDay } from "../../utils/format";
import styles from "./EmailHistory.module.css";

function EmailHistory() {
  const [campaignId, setCampaignId] = useState("all");
  const [bookingCode, setBookingCode] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(new Date(2026, 6, 27));
  const [previewEntry, setPreviewEntry] = useState(null);

  const campaignById = useMemo(
    () => Object.fromEntries(EMAIL_CAMPAIGNS.map((c) => [c.id, c.title])),
    []
  );

  const filteredEntries = useMemo(() => {
    return EMAIL_HISTORY.filter((entry) => {
      if (campaignId !== "all" && entry.campaignId !== campaignId) return false;
      if (bookingCode && !entry.bookingCode.toLowerCase().includes(bookingCode.toLowerCase())) return false;
      if (email && !entry.email.toLowerCase().includes(email.toLowerCase())) return false;
      if (!isSameDay(entry.createdAt, date)) return false;
      return true;
    }).map((entry) => ({ ...entry, campaignTitle: campaignById[entry.campaignId] || "" }));
  }, [campaignId, bookingCode, email, date, campaignById]);

  const stats = useMemo(() => {
    return filteredEntries.reduce(
      (acc, entry) => {
        acc.total += 1;
        if (entry.status === HISTORY_STATUS.SUCCESS) acc.success += 1;
        else if (entry.status === HISTORY_STATUS.ERROR) acc.error += 1;
        else acc.pending += 1;
        return acc;
      },
      { total: 0, success: 0, error: 0, pending: 0 }
    );
  }, [filteredEntries]);

  return (
    <div className={styles.page}>
      <div className={styles.title}>Lịch sử</div>

      <div className={styles.filterCard}>
        <div className={styles.filterBar}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Chiến dịch email</label>
            <select
              className={styles.selectBox}
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {EMAIL_CAMPAIGNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Mã đặt phòng</label>
            <input
              type="text"
              className={styles.textBox}
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Email</label>
            <div className={styles.textBoxIconWrap}>
              <Mail size={15} />
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <DateField label="Ngày" value={date} onChange={setDate} styles={styles} />
        </div>
      </div>

      <div className={styles.statsCard}>
        <div className={styles.statItem}>
          <span className={`${styles.statIcon} ${styles.statIconTotal}`}>
            <LayoutGrid size={16} />
          </span>
          <div>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Tổng số</div>
          </div>
        </div>
        <div className={styles.statItem}>
          <span className={`${styles.statIcon} ${styles.statIconSuccess}`}>
            <CheckCircle2 size={16} />
          </span>
          <div>
            <div className={styles.statValue}>{stats.success}</div>
            <div className={styles.statLabel}>Thành công</div>
          </div>
        </div>
        <div className={styles.statItem}>
          <span className={`${styles.statIcon} ${styles.statIconError}`}>
            <TriangleAlert size={16} />
          </span>
          <div>
            <div className={styles.statValue}>{stats.error}</div>
            <div className={styles.statLabel}>Lỗi</div>
          </div>
        </div>
        <div className={styles.statItem}>
          <span className={`${styles.statIcon} ${styles.statIconPending}`}>
            <Clock size={16} />
          </span>
          <div>
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statLabel}>Đang chờ</div>
          </div>
        </div>
      </div>

      <HistoryListPanel entries={filteredEntries} onPreview={setPreviewEntry} />

      {previewEntry && (
        <EmailPreviewModal entry={previewEntry} onClose={() => setPreviewEntry(null)} />
      )}
    </div>
  );
}

export default EmailHistory;
