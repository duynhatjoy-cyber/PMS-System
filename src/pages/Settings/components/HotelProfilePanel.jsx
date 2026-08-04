import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { INITIAL_HOTEL_PROFILE } from "../../../data/settingsData";
import styles from "../Settings.module.css";

function Field({ label, children, className = "" }) {
  return (
    <label className={`${styles.hotelField} ${className}`}>
      <span className={styles.hotelLabel}>{label}</span>
      {children}
    </label>
  );
}

function ClearableSelect({ value, options, onChange, ariaLabel }) {
  return (
    <div className={styles.clearableSelect}>
      <select aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">-- Chọn --</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {value && (
        <button type="button" aria-label={`Xóa ${ariaLabel}`} onClick={() => onChange("")}>
          <X size={17} />
        </button>
      )}
    </div>
  );
}

function HotelLogo({ src, onChange }) {
  const inputRef = useRef(null);

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className={styles.logoField}>
      <span className={styles.hotelLabel}>Logo khách sạn</span>
      <button type="button" className={styles.logoUpload} onClick={() => inputRef.current?.click()} aria-label="Tải logo khách sạn lên">
        {src ? (
          <img src={src} alt="Logo khách sạn" />
        ) : (
          <span className={styles.logoPlaceholder}>
            <span className={styles.logoScript}>lifrooms</span>
            <span>BOUTIQUE HOTEL</span>
            <span className={styles.logoEdit}><ImagePlus size={16} /> Thay logo</span>
          </span>
        )}
      </button>
      <input ref={inputRef} className={styles.visuallyHidden} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFile} />
    </div>
  );
}

function HotelProfilePanel({ onToast }) {
  const [form, setForm] = useState(INITIAL_HOTEL_PROFILE);

  function patch(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onToast("Đã lưu thông tin khách sạn");
  }

  return (
    <form className={styles.hotelProfile} onSubmit={handleSubmit}>
      <div className={styles.hotelProfileBody}>
        <section className={styles.hotelSection}>
          <h2 className={styles.hotelSectionTitle}>Thông tin khách sạn</h2>
          <div className={styles.hotelMainGrid}>
            <div className={styles.hotelFields}>
              <Field label="Tên khách sạn">
                <input required autoFocus value={form.name} onChange={(event) => patch("name", event.target.value)} />
              </Field>
              <Field label="SĐT khách sạn">
                <input inputMode="tel" value={form.phone} onChange={(event) => patch("phone", event.target.value)} />
              </Field>
              <Field label="Email khách sạn">
                <input type="email" value={form.email} onChange={(event) => patch("email", event.target.value)} />
              </Field>
              <Field label="Website (không bắt buộc)">
                <input value={form.website} onChange={(event) => patch("website", event.target.value)} />
              </Field>
              <Field label="Địa chỉ khách sạn">
                <input value={form.address} onChange={(event) => patch("address", event.target.value)} />
              </Field>
              <Field label="Quốc gia">
                <ClearableSelect ariaLabel="quốc gia" value={form.country} options={["Vietnam", "Thailand", "Singapore"]} onChange={(value) => patch("country", value)} />
              </Field>
              <Field label="Tỉnh">
                <ClearableSelect ariaLabel="tỉnh" value={form.province} options={["Bà Rịa - Vũng Tàu", "Hà Nội", "Hồ Chí Minh", "Đà Nẵng"]} onChange={(value) => patch("province", value)} />
              </Field>
              <Field label="Loại hình kinh doanh">
                <ClearableSelect ariaLabel="loại hình kinh doanh" value={form.businessType} options={["Khách sạn lưu trú", "Resort", "Căn hộ dịch vụ", "Homestay"]} onChange={(value) => patch("businessType", value)} />
              </Field>
            </div>
            <HotelLogo src={form.logo} onChange={(value) => patch("logo", value)} />
          </div>
        </section>

        <section className={`${styles.hotelSection} ${styles.ownerSection}`}>
          <h2 className={styles.hotelSectionTitle}>Thông tin chủ khách sạn</h2>
          <div className={styles.ownerFields}>
            <Field label="Tên chủ khách sạn"><input disabled value={form.ownerName} /></Field>
            <Field label="Email chủ khách sạn"><input disabled value={form.ownerEmail} /></Field>
            <Field label="SĐT chủ khách sạn"><input disabled value={form.ownerPhone} /></Field>
          </div>
        </section>
      </div>

      <footer className={styles.hotelFooter}>
        <div className={styles.hotelNotes}>
          <p><span>*</span> Thông tin khách sạn được hiển thị trên báo cáo, hóa đơn in ra cho khách</p>
          <p><span>*</span> Thông tin chủ khách sạn giúp xác định quyền sở hữu khách sạn, tránh các trường hợp tranh chấp</p>
        </div>
        <button type="submit" className={styles.hotelSave}>Lưu</button>
      </footer>
    </form>
  );
}

export default HotelProfilePanel;
