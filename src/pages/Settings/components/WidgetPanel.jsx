import { useState } from "react";
import { Copy, Save } from "lucide-react";
import shared from "../../FrontDesk/modals/shared.module.css";
import { INITIAL_WIDGET } from "../../../data/settingsData";
import styles from "../Settings.module.css";

function WidgetPanel({ onToast }) {
  const [form, setForm] = useState(INITIAL_WIDGET);

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(form.url);
      onToast("Đã sao chép URL widget");
    } catch {
      onToast("Không thể sao chép — vui lòng copy thủ công");
    }
  }

  function handleSave() {
    onToast("Đã lưu cấu hình widget");
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Widget QR</div>

        <label className={shared.field}>
          <span className={shared.label}>Widget URL</span>
          <div className={styles.copyRow}>
            <input className={shared.input} value={form.url} readOnly />
            <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={handleCopy}>
              <Copy size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              Sao chép
            </button>
          </div>
        </label>

        <label className={shared.field}>
          <span className={shared.label}>Màu thương hiệu</span>
          <div className={styles.colorRow}>
            <input
              type="color"
              className={styles.colorSwatch}
              value={form.brandColor}
              onChange={(e) => patch("brandColor", e.target.value)}
            />
            <input className={shared.input} value={form.brandColor} onChange={(e) => patch("brandColor", e.target.value)} />
          </div>
        </label>

        <label className={shared.field}>
          <span className={shared.label}>Tin nhắn chào mừng</span>
          <textarea
            className={shared.textarea}
            value={form.welcomeMessage}
            onChange={(e) => patch("welcomeMessage", e.target.value)}
          />
        </label>

        <div>
          <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={handleSave}>
            <Save size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default WidgetPanel;
