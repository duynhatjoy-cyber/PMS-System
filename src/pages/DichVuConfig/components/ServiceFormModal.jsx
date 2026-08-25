import { useState } from "react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import styles from "../DichVuConfig.module.css";

function emptyForm() {
  return {
    name: "",
    price: "",
    unit: "",
    code: "",
    editablePrice: true,
    stockManaged: false,
    minQty: "0",
    excludeFromInvoice: false,
  };
}

function ServiceFormModal({ onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);

  const canSave = form.name.trim() && Number(form.price) > 0;

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: form.name.trim(),
      price: Number(form.price),
      unit: form.unit.trim(),
      code: form.code.trim(),
      editablePrice: form.editablePrice,
      stockManaged: form.stockManaged,
      minQty: Number(form.minQty) || 0,
      excludeFromInvoice: form.excludeFromInvoice,
    });
  }

  return (
    <SlidePanelShell
      title="Thêm dịch vụ"
      onClose={onClose}
      width={640}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Bỏ qua
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            disabled={!canSave}
            onClick={handleSave}
          >
            Lưu
          </button>
        </>
      }
    >
      <div className={styles.formGrid}>
        <div>
          <div className={styles.formSectionTitle}>Dịch vụ mở rộng</div>
          <div className={styles.formStack}>
            <label className={shared.field}>
              <span className={shared.label}>Tên dịch vụ *</span>
              <input
                className={shared.input}
                value={form.name}
                onChange={(e) => patch("name", e.target.value)}
                autoFocus
              />
            </label>

            <div className={shared.row}>
              <label className={shared.field}>
                <span className={shared.label}>Đơn giá *</span>
                <input
                  type="number"
                  min="0"
                  className={shared.input}
                  value={form.price}
                  onChange={(e) => patch("price", e.target.value)}
                />
              </label>
              <label className={shared.field}>
                <span className={shared.label}>Đơn vị</span>
                <input
                  className={shared.input}
                  placeholder="Lần, cái, chai..."
                  value={form.unit}
                  onChange={(e) => patch("unit", e.target.value)}
                />
              </label>
            </div>

            <label className={shared.field}>
              <span className={shared.label}>Mã dịch vụ</span>
              <input className={shared.input} value={form.code} onChange={(e) => patch("code", e.target.value)} />
            </label>

            <label className={shared.checkboxRow}>
              <input
                type="checkbox"
                checked={form.editablePrice}
                onChange={(e) => patch("editablePrice", e.target.checked)}
              />
              Được sửa giá
            </label>
          </div>
        </div>

        <div>
          <div className={styles.formSectionTitle}>Cấu hình kho</div>
          <div className={styles.formStack}>
            <label className={shared.field}>
              <span className={shared.label}>Số lượng tối thiểu</span>
              <input
                type="number"
                min="0"
                className={shared.input}
                value={form.minQty}
                onChange={(e) => patch("minQty", e.target.value)}
              />
            </label>

            <p className={styles.formHint}>
              Cảnh báo trong "Báo Cáo Kho" khi số lượng nhỏ hơn số lượng tối thiểu
            </p>

            <label className={shared.checkboxRow}>
              <input
                type="checkbox"
                checked={form.stockManaged}
                onChange={(e) => patch("stockManaged", e.target.checked)}
              />
              Được quản lý nhập kho
            </label>

            <label className={shared.checkboxRow}>
              <input
                type="checkbox"
                checked={form.excludeFromInvoice}
                onChange={(e) => patch("excludeFromInvoice", e.target.checked)}
              />
              Không được thêm vào hóa đơn
            </label>
          </div>
        </div>
      </div>
    </SlidePanelShell>
  );
}

export default ServiceFormModal;
