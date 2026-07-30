import { useState } from "react";
import { useNavigate } from "react-router-dom";
import shared from "../../FrontDesk/modals/shared.module.css";
import { INITIAL_APPLIED_SLOTS, INITIAL_TAX_FEES } from "../../../data/taxFeeData";
import {
  buildInitialPrintTemplates,
  CHECKIN_WINDOW_TYPES,
  FX_CURRENCIES,
  INITIAL_CHECKIN_WINDOWS,
  INITIAL_FX_RATES,
  PAPER_SIZES,
  PRINT_TEMPLATE_TYPES,
} from "../../../data/settingsData";
import styles from "../Settings.module.css";

function PmsSettingsPanel({ onToast }) {
  const navigate = useNavigate();
  const [fxRates, setFxRates] = useState(INITIAL_FX_RATES);
  const [windows, setWindows] = useState(INITIAL_CHECKIN_WINDOWS);
  const [templates, setTemplates] = useState(() => buildInitialPrintTemplates());

  function patchFx(currency, value) {
    setFxRates((prev) => ({ ...prev, [currency]: value }));
  }

  function patchWindow(key, field, value) {
    setWindows((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  function patchTemplate(key, field, value) {
    setTemplates((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.card}>
        <div className={styles.cardHeadRow}>
          <div>
            <div className={styles.cardTitle}>Thuế & Phí</div>
            <div className={styles.cardSubtitle}>
              {INITIAL_TAX_FEES.length} loại thuế/phí đã thiết lập · Áp dụng cho Tiền phòng & phụ thu
            </div>
          </div>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnSecondary}`}
            onClick={() => navigate("/cau-hinh/thue-phi")}
          >
            Quản lý chi tiết →
          </button>
        </div>
        <div className={styles.chipRow}>
          {INITIAL_TAX_FEES.map((tf) => (
            <span key={tf.id} className={styles.taxChip}>
              {tf.name} {tf.percent}%
            </span>
          ))}
          {INITIAL_APPLIED_SLOTS.room.length === 0 && (
            <span className={shared.hint}>Chưa áp dụng thuế/phí nào cho doanh thu phòng.</span>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Tỷ giá (FX)</div>
        <div className={styles.fxList}>
          {FX_CURRENCIES.map((cur) => (
            <div key={cur} className={styles.fxRow}>
              <span className={styles.fxCode}>{cur}</span>
              <input
                className={shared.input}
                placeholder="Tỷ giá → VND"
                value={fxRates[cur]}
                onChange={(e) => patchFx(cur, e.target.value)}
              />
              <span className={styles.fxSuffix}>VND</span>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnSecondary}`}
                onClick={() => onToast(`Đã lưu tỷ giá ${cur}`)}
              >
                Lưu
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Khung giờ check-in / check-out</div>
        {CHECKIN_WINDOW_TYPES.map((w) => (
          <div key={w.key} className={styles.windowRow}>
            <span className={styles.windowLabel}>{w.label}</span>
            <div className={styles.windowTimes}>
              <label className={shared.field}>
                <span className={shared.label}>Check-in</span>
                <input
                  type="time"
                  className={shared.input}
                  value={windows[w.key].checkIn}
                  onChange={(e) => patchWindow(w.key, "checkIn", e.target.value)}
                />
              </label>
              <label className={shared.field}>
                <span className={shared.label}>Check-out</span>
                <input
                  type="time"
                  className={shared.input}
                  value={windows[w.key].checkOut}
                  onChange={(e) => patchWindow(w.key, "checkOut", e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              className={`${shared.btn} ${shared.btnSecondary}`}
              onClick={() => onToast(`Đã lưu khung giờ ${w.label}`)}
            >
              Lưu
            </button>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Máy in</div>
        <div className={styles.templateGrid}>
          {PRINT_TEMPLATE_TYPES.map((t) => {
            const tpl = templates[t.key];
            return (
              <div key={t.key} className={styles.templateCard}>
                <div className={styles.templateCardTitle}>{t.label}</div>
                <div className={styles.fieldGrid}>
                  <label className={shared.field}>
                    <span className={shared.label}>Khổ giấy</span>
                    <select
                      className={shared.select}
                      value={tpl.paperSize}
                      onChange={(e) => patchTemplate(t.key, "paperSize", e.target.value)}
                    >
                      {PAPER_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={shared.field}>
                    <span className={shared.label}>Mã số thuế</span>
                    <input
                      className={shared.input}
                      placeholder="0123456789"
                      value={tpl.taxCode}
                      onChange={(e) => patchTemplate(t.key, "taxCode", e.target.value)}
                    />
                  </label>
                </div>
                <label className={shared.field}>
                  <span className={shared.label}>Tên tiêu đề</span>
                  <input
                    className={shared.input}
                    placeholder="Tên khách sạn in trên tài liệu"
                    value={tpl.title}
                    onChange={(e) => patchTemplate(t.key, "title", e.target.value)}
                  />
                </label>
                <label className={shared.field}>
                  <span className={shared.label}>Địa chỉ</span>
                  <input
                    className={shared.input}
                    placeholder="123 Đường ABC, TP.HCM"
                    value={tpl.address}
                    onChange={(e) => patchTemplate(t.key, "address", e.target.value)}
                  />
                </label>
                <div>
                  <button
                    type="button"
                    className={`${shared.btn} ${shared.btnSecondary}`}
                    onClick={() => onToast(`Đã lưu mẫu in — ${t.label}`)}
                  >
                    Lưu {t.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PmsSettingsPanel;
