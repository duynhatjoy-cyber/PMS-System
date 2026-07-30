import { useState } from "react";
import { Save } from "lucide-react";
import styles from "./PrinterTemplateConfig.module.css";

const ROOM_INVOICE_SIZES = [
  "A4",
  "A5",
  "A6_80mm",
  "A6_58mm",
  "A4_v2",
  "A5_v2",
  "A5_80mm",
  "A5_58mm",
];

const RECEIPT_SIZES = ["A4", "A6_80mm", "A6_58mm"];
const SALES_INVOICE_SIZES = ["A4", "A5", "A6", "A6_58"];
const DRAFT_RETENTION_DAYS = ["7", "15", "30"];

function PrinterTemplateConfig() {
  const [settings, setSettings] = useState({
    roomInvoiceSize: "A4_v2",
    receiptSize: "A4",
    salesInvoiceSize: "A4",
    draftExpiryDays: "30",
  });
  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <h1>Máy in & Mẫu in</h1>
        <p>Thiết lập khổ giấy và chu kỳ xóa hóa đơn nháp cho hệ thống PMS.</p>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Cấu hình hóa đơn phòng</h2>
            <p>Chọn khổ giấy phù hợp với mẫu in hóa đơn phòng.</p>
          </div>

          <label className={styles.field}>
            <span>Kích thước hóa đơn phòng</span>
            <select
              value={settings.roomInvoiceSize}
              onChange={(event) => update("roomInvoiceSize", event.target.value)}
            >
              {ROOM_INVOICE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Cấu hình biên lai</h2>
            <p>Chọn khổ giấy phù hợp với máy in biên lai.</p>
          </div>

          <label className={styles.field}>
            <span>Kích thước biên lai</span>
            <select
              value={settings.receiptSize}
              onChange={(event) => update("receiptSize", event.target.value)}
            >
              {RECEIPT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Cấu hình hóa đơn bán hàng</h2>
            <p>Chọn khổ giấy cho hóa đơn bán hàng.</p>
          </div>

          <label className={styles.field}>
            <span>Kích thước hóa đơn bán hàng</span>
            <select
              value={settings.salesInvoiceSize}
              onChange={(event) => update("salesInvoiceSize", event.target.value)}
            >
              {SALES_INVOICE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Thiết lập chu kỳ xóa hóa đơn nháp</h2>
            <p>Chọn số ngày hệ thống tự động xóa hóa đơn nháp chưa được hoàn thành.</p>
          </div>

          <label className={styles.field}>
            <span>Số ngày tự động xóa hóa đơn nháp</span>
            <select
              value={settings.draftExpiryDays}
              onChange={(event) => update("draftExpiryDays", event.target.value)}
            >
              {DRAFT_RETENTION_DAYS.map((days) => (
                <option key={days} value={days}>
                  {days} ngày
                </option>
              ))}
            </select>
          </label>
        </article>
      </section>

      <div className={styles.actions}>
        <button className={styles.saveButton} type="button" onClick={handleSave}>
          <Save size={14} />
          {saved ? "Đã lưu" : "Lưu"}
        </button>
      </div>
    </main>
  );
}

export default PrinterTemplateConfig;
