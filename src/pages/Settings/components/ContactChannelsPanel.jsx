import { useState } from "react";
import shared from "../../FrontDesk/modals/shared.module.css";
import { CONTACT_CHANNELS_META, INITIAL_CONTACT_CHANNELS } from "../../../data/settingsData";
import styles from "../Settings.module.css";

function ContactChannelsPanel({ onToast }) {
  const [channels, setChannels] = useState(INITIAL_CONTACT_CHANNELS);

  function patchChannel(key, patch) {
    setChannels((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function handleConnectZalo() {
    onToast("Kết nối Zalo OA qua cửa sổ đăng nhập sẽ có ở bản cập nhật tiếp theo");
  }

  function handleSaveChannel(key, label) {
    const channel = channels[key];
    if (!channel.id.trim() || !channel.token.trim()) {
      onToast(`Vui lòng nhập đủ ID và Access Token cho ${label}`);
      return;
    }
    patchChannel(key, { connected: true });
    onToast(`Đã kết nối ${label}`);
  }

  return (
    <div className={styles.panelStack}>
      {CONTACT_CHANNELS_META.map((meta) => {
        const channel = channels[meta.key];
        return (
          <div key={meta.key} className={styles.card}>
            <div className={styles.cardHeadRow}>
              <div className={styles.cardTitle}>{meta.label}</div>
              <span
                className={`${styles.statusBadge} ${channel.connected ? styles.statusBadgeOn : styles.statusBadgeOff}`}
              >
                {channel.connected ? "Đã kết nối" : "Chưa kết nối"}
              </span>
            </div>

            {meta.connectOnly ? (
              <div>
                <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={handleConnectZalo}>
                  Kết nối {meta.label}
                </button>
              </div>
            ) : (
              <>
                <label className={shared.field}>
                  <span className={shared.label}>ID</span>
                  <input
                    className={shared.input}
                    placeholder={`${meta.label} ID`}
                    value={channel.id}
                    onChange={(e) => patchChannel(meta.key, { id: e.target.value })}
                  />
                </label>
                <label className={shared.field}>
                  <span className={shared.label}>Access Token</span>
                  <input
                    type="password"
                    className={shared.input}
                    placeholder="Nhập token"
                    value={channel.token}
                    onChange={(e) => patchChannel(meta.key, { token: e.target.value })}
                  />
                </label>
                <div>
                  <button
                    type="button"
                    className={`${shared.btn} ${shared.btnPrimary}`}
                    onClick={() => handleSaveChannel(meta.key, meta.label)}
                  >
                    Lưu
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ContactChannelsPanel;
