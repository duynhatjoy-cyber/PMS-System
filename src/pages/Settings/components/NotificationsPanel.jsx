import { useState } from "react";
import shared from "../../FrontDesk/modals/shared.module.css";
import { INITIAL_NOTIFICATIONS, NOTIFICATION_FREQUENCIES } from "../../../data/settingsData";
import styles from "../Settings.module.css";

function NotificationsPanel({ onToast }) {
  const [form, setForm] = useState(INITIAL_NOTIFICATIONS);

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Telegram</div>
        <p className={shared.hint}>Bellhop sẽ gửi cảnh báo vào nhóm Telegram của nhân viên.</p>
        <ol className={styles.instructionList}>
          <li>
            Thêm bot <strong>@BellhopBot</strong> vào nhóm Telegram của nhân viên và cấp quyền gửi tin nhắn
          </li>
          <li>Nhập Chat ID của nhóm bên dưới (ví dụ: -1001234567890)</li>
        </ol>
        <div className={styles.copyRow}>
          <input
            className={shared.input}
            placeholder="-1001234567890"
            value={form.telegramChatId}
            onChange={(e) => patch("telegramChatId", e.target.value)}
          />
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            onClick={() => onToast("Đã lưu Chat ID Telegram")}
          >
            Lưu
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Email</div>
        <label className={shared.field}>
          <span className={shared.label}>Địa chỉ email</span>
          <input
            type="email"
            className={shared.input}
            placeholder="quanly@khachsan.vn"
            value={form.email}
            onChange={(e) => patch("email", e.target.value)}
          />
        </label>
        <label className={shared.field}>
          <span className={shared.label}>Tần suất</span>
          <select
            className={shared.select}
            value={form.frequency}
            onChange={(e) => patch("frequency", e.target.value)}
          >
            {NOTIFICATION_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <div>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            onClick={() => onToast("Đã lưu cài đặt email")}
          >
            Lưu email
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPanel;
