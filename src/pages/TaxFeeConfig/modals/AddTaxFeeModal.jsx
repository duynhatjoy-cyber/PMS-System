import { useState } from "react";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { TAX_FEE_TYPES } from "../../../data/taxFeeData";
import styles from "./AddTaxFeeModal.module.css";

function AddTaxFeeModal({ onClose, onSave }) {
  const [type, setType] = useState("tax");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [percent, setPercent] = useState("0");

  const typeLabel = TAX_FEE_TYPES.find((t) => t.value === type)?.label ?? "Tiền thuế";
  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    onSave({
      id: `tf-${Date.now()}`,
      type,
      name: name.trim(),
      description: description.trim(),
      percent: Number(percent) || 0,
    });
  }

  return (
    <ModalShell title={`Thêm ${typeLabel}`} onClose={onClose} width={460}>
      <div className={shared.field}>
        <label className={shared.label}>Loại</label>
        <select className={shared.select} value={type} onChange={(e) => setType(e.target.value)}>
          {TAX_FEE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className={shared.field} style={{ marginTop: 14 }}>
        <label className={shared.label}>Tên {typeLabel}*</label>
        <input
          type="text"
          className={shared.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Nhập tên ${typeLabel.toLowerCase()}`}
        />
      </div>

      <div className={shared.field} style={{ marginTop: 14 }}>
        <label className={shared.label}>Mô tả</label>
        <textarea
          className={shared.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn (không bắt buộc)"
        />
      </div>

      <div className={shared.field} style={{ marginTop: 14 }}>
        <label className={shared.label}>Áp dụng theo %</label>
        <div className={styles.percentGroup}>
          <span className={styles.percentSign}>%</span>
          <input
            type="number"
            min="0"
            max="100"
            className={styles.percentInput}
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
          />
        </div>
      </div>

      <p className={styles.note}>
        Thay đổi Thuế/Phí không áp dụng cho các đặt phòng đang áp dụng
      </p>

      <div className={styles.footerBtns}>
        <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
          Đóng
        </button>
        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary}`}
          disabled={!canSave}
          onClick={handleSave}
        >
          Lưu {typeLabel}
        </button>
      </div>
    </ModalShell>
  );
}

export default AddTaxFeeModal;
