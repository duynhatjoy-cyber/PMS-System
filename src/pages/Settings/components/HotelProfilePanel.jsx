import { useState } from "react";
import { Save, Star } from "lucide-react";
import shared from "../../FrontDesk/modals/shared.module.css";
import {
  FACILITY_TYPES,
  INITIAL_HOTEL_PROFILE,
  LANGUAGES,
  OPERATION_MODELS,
  TIMEZONES,
} from "../../../data/settingsData";
import styles from "../Settings.module.css";

function StarRating({ value, onChange }) {
  return (
    <div>
      <div className={styles.starRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={styles.starBtn}
            onClick={() => onChange(value === n ? 0 : n)}
          >
            <Star size={22} fill={n <= value ? "currentColor" : "none"} className={n <= value ? styles.starBtnFilled : ""} />
          </button>
        ))}
      </div>
      <p className={styles.starHint}>Nhấn vào sao để chọn hạng (nhấn lại để bỏ chọn)</p>
    </div>
  );
}

function HotelProfilePanel({ onToast }) {
  const [form, setForm] = useState(INITIAL_HOTEL_PROFILE);

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onToast("Đã lưu hồ sơ khách sạn");
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Hồ sơ khách sạn</div>

        <label className={shared.field}>
          <span className={shared.label}>Tên khách sạn</span>
          <input className={shared.input} value={form.name} onChange={(e) => patch("name", e.target.value)} />
        </label>

        <div className={styles.fieldGrid}>
          <label className={shared.field}>
            <span className={shared.label}>Loại hình cơ sở</span>
            <select
              className={shared.select}
              value={form.facilityType}
              onChange={(e) => patch("facilityType", e.target.value)}
            >
              {FACILITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className={shared.field}>
            <span className={shared.label}>Mô hình vận hành</span>
            <select
              className={shared.select}
              value={form.operationModel}
              onChange={(e) => patch("operationModel", e.target.value)}
            >
              <option value="">-- Chọn --</option>
              {OPERATION_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.fieldGrid}>
          <label className={shared.field}>
            <span className={shared.label}>MST (Mã số thuế)</span>
            <input className={shared.input} value={form.taxCode} onChange={(e) => patch("taxCode", e.target.value)} />
          </label>

          <label className={shared.field}>
            <span className={shared.label}>Hạng sao khách sạn</span>
            <StarRating value={form.starRating} onChange={(v) => patch("starRating", v)} />
          </label>
        </div>

        <label className={shared.field}>
          <span className={shared.label}>Múi giờ</span>
          <select className={shared.select} value={form.timezone} onChange={(e) => patch("timezone", e.target.value)}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>

        <label className={shared.field}>
          <span className={shared.label}>Ngôn ngữ mặc định</span>
          <select className={shared.select} value={form.language} onChange={(e) => patch("language", e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
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

export default HotelProfilePanel;
