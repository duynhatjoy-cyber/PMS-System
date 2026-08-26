import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import styles from "./ImageUploadField.module.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Ô tải ảnh lưu thành data URL trong state (không có backend upload thật) —
// dùng chung cho QR/số tài khoản NCC (Cấu hình > Quản lý kho) và ảnh hóa đơn
// chuyển khoản (phiếu thanh toán NCC) thay vì lặp lại FileReader ở 2 nơi.
function ImageUploadField({ value, onChange, label, hint = "PNG, JPG, WEBP — tối đa 5 MB", changeLabel = "Đổi ảnh" }) {
  const [error, setError] = useState("");

  function handleChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp hình ảnh.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Dung lượng ảnh không được vượt quá 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      setError("");
    };
    reader.onerror = () => setError("Không thể đọc ảnh. Vui lòng thử lại.");
    reader.readAsDataURL(file);
  }

  return (
    <div className={styles.field}>
      {value ? (
        <div className={styles.previewWrap}>
          <img className={styles.preview} src={value} alt={label} />
          <button
            type="button"
            className={styles.removeBtn}
            aria-label="Xóa hình ảnh"
            title="Xóa hình ảnh"
            onClick={() => {
              onChange("");
              setError("");
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className={styles.upload}>
          <ImagePlus size={24} />
          <span>{label}</span>
          <small>{hint}</small>
          <input type="file" accept="image/*" onChange={handleChange} />
        </label>
      )}
      {value && (
        <label className={styles.changeBtn}>
          <ImagePlus size={15} /> {changeLabel}
          <input type="file" accept="image/*" onChange={handleChange} />
        </label>
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export default ImageUploadField;
