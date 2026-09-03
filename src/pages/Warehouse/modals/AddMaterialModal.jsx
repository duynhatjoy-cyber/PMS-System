import { useState } from "react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { createIdSequence } from "../../../utils/id";
import styles from "./WarehouseModal.module.css";

const nextId = createIdSequence();

const SERVICE_TYPES = ["Hàng hóa", "Dịch vụ", "Đền bù"];
const CATEGORIES = ["Đồ uống", "Thực phẩm", "Vật dụng phòng", "Khác"];

function emptyForm() {
  return {
    serviceType: SERVICE_TYPES[0],
    category: CATEGORIES[0],
    name: "",
    unit: "",
    minQty: "0",
    price: "",
    editablePrice: false,
    excludeFromInvoice: false,
    description: "",
  };
}

// Mở khi bấm "+" cạnh ô chọn nguyên vật liệu trong phiếu nhập/xuất/chuyển kho —
// tạo nhanh một nguyên vật liệu mới (thêm vào MATERIAL_RECORDS dùng chung) mà
// không phải rời sang Cấu hình > Quản lý kho.
function AddMaterialModal({ onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);

  const canSave = form.name.trim() && Number(form.price) > 0;

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      id: nextId("nvl-quick"),
      name: form.name.trim(),
      unit: form.unit.trim(),
      supplierId: "",
      active: true,
      price: Number(form.price),
    });
  }

  return (
    <SlidePanelShell title="Thêm dịch vụ" onClose={onClose} tone="brand" width={1080}>
      <div className={styles.formGrid}>
        <div>
          <div className={styles.field}>
            <label className={styles.label}>Loại dịch vụ</label>
            <select
              className={styles.underlineSelect}
              value={form.serviceType}
              onChange={(e) => patch("serviceType", e.target.value)}
            >
              {SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tên danh mục</label>
            <select
              className={styles.underlineSelect}
              value={form.category}
              onChange={(e) => patch("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tên dịch vụ (*)</label>
            <input
              type="text"
              className={styles.underlineInput}
              value={form.name}
              onChange={(e) => patch("name", e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Đơn vị</label>
            <input
              type="text"
              className={styles.underlineInput}
              value={form.unit}
              onChange={(e) => patch("unit", e.target.value)}
              placeholder="Lần, cái, chai..."
            />
          </div>
        </div>

        <div>
          <div className={styles.field}>
            <label className={styles.label}>Số lượng tối thiểu</label>
            <input
              type="number"
              min="0"
              className={styles.underlineInput}
              value={form.minQty}
              onChange={(e) => patch("minQty", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Đơn giá (*)</label>
            <input
              type="number"
              min="0"
              className={styles.underlineInput}
              value={form.price}
              onChange={(e) => patch("price", e.target.value)}
            />
          </div>

          <label className={shared.checkboxRow}>
            <input
              type="checkbox"
              checked={form.editablePrice}
              onChange={(e) => patch("editablePrice", e.target.checked)}
            />
            Được sửa giá
          </label>

          <label className={shared.checkboxRow}>
            <input type="checkbox" checked readOnly disabled />
            Được quản lý nhập kho
          </label>

          <label className={shared.checkboxRow}>
            <input
              type="checkbox"
              checked={form.excludeFromInvoice}
              onChange={(e) => patch("excludeFromInvoice", e.target.checked)}
            />
            Không cho phép thêm vào hóa đơn
          </label>

          <div className={styles.field} style={{ marginTop: 12 }}>
            <label className={styles.label}>Mô tả</label>
            <textarea
              className={styles.underlineTextarea}
              value={form.description}
              onChange={(e) => patch("description", e.target.value.slice(0, 250))}
              maxLength={250}
              rows={2}
            />
            <span className={styles.charCount}>{form.description.length}/250</span>
          </div>
        </div>
      </div>

      <div className={styles.footerBtns}>
        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary}`}
          disabled={!canSave}
          onClick={handleSave}
        >
          LƯU
        </button>
        <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
          BỎ QUA
        </button>
      </div>
    </SlidePanelShell>
  );
}

export default AddMaterialModal;
