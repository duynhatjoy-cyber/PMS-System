import { useState } from "react";
import { BookOpen, Save } from "lucide-react";
import BookingCardPreview from "./BookingCardPreview";
import {
  DEFAULT_CARD_FIELDS,
  GUEST_DISPLAY_OPTIONS,
  PRICE_DISPLAY_OPTIONS,
  TIME_DISPLAY_OPTIONS,
} from "../../../data/bookingConfigData";

function RadioGroup({ styles, name, options, value, onChange }) {
  return (
    <>
      {options.map((opt) => (
        <label key={opt.id} className={styles.optionRow}>
          <input
            type="radio"
            name={name}
            checked={value === opt.id}
            onChange={() => onChange(opt.id)}
          />
          {opt.label}
        </label>
      ))}
    </>
  );
}

function CardFieldsPanel({ styles, onToast }) {
  const [savedFields, setSavedFields] = useState(DEFAULT_CARD_FIELDS);
  const [fields, setFields] = useState(DEFAULT_CARD_FIELDS);

  function patch(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleCancel() {
    setFields(savedFields);
  }

  function handleSave() {
    setSavedFields(fields);
    onToast("Đã lưu cấu hình thẻ đặt phòng");
  }

  return (
    <div className={styles.main}>
      <div className={styles.panelHeaderRow}>
        <div>
          <div className={styles.panelTitle}>Cấu hình thẻ đặt phòng</div>
          <p className={styles.panelSubtitle}>
            Chọn thông tin sẽ hiển thị trên booking card trong sơ đồ phòng.
          </p>
        </div>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={() => onToast("Chức năng đang được phát triển")}
        >
          <BookOpen size={15} /> Xem hướng dẫn
        </button>
      </div>

      <BookingCardPreview styles={styles} fields={fields} />

      <div className={styles.fieldGroupsGrid}>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldGroupTitle}>Khách</div>
          <RadioGroup
            styles={styles}
            name="guestDisplay"
            options={GUEST_DISPLAY_OPTIONS}
            value={fields.guestDisplay}
            onChange={(v) => patch("guestDisplay", v)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.fieldGroupTitle}>Thời gian</div>
          <RadioGroup
            styles={styles}
            name="timeDisplay"
            options={TIME_DISPLAY_OPTIONS}
            value={fields.timeDisplay}
            onChange={(v) => patch("timeDisplay", v)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.fieldGroupTitle}>Giá phòng</div>
          <RadioGroup
            styles={styles}
            name="priceDisplay"
            options={PRICE_DISPLAY_OPTIONS}
            value={fields.priceDisplay}
            onChange={(v) => patch("priceDisplay", v)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.fieldGroupTitle}>Thêm</div>
          <label className={styles.optionRow}>
            <input
              type="checkbox"
              checked={fields.showSourceGroup}
              onChange={(e) => patch("showSourceGroup", e.target.checked)}
            />
            Nhóm nguồn
          </label>
          <label className={styles.optionRow}>
            <input
              type="checkbox"
              checked={fields.showSegment}
              onChange={(e) => patch("showSegment", e.target.checked)}
            />
            Phân khúc khách hàng
          </label>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
          Huỷ
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          <Save size={16} /> Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

export default CardFieldsPanel;
