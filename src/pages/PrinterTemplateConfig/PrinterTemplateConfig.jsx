import { useRef, useState } from "react";
import { AlignLeft, Bold, Image, Italic, Link, List, Printer, Save, Underline } from "lucide-react";
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
const TEMPLATE_PARAMS = {
  Phòng: ["Arrival", "Number_Children", "Room_name", "Source", "Company_name", "Note", "Deposit", "Booking_number", "PassCode_Lock", "Departure", "Number_Adults", "Room_type", "Price_room_per_night", "Total_price", "Total_night"],
  "Khách hàng": ["Code", "Full_name", "Customer_phone", "Customer_address", "Customer_email", "Customer_identity_number", "Customer_country", "Customer_sex", "Customer_birthday"],
};

function PrinterTemplateConfig() {
  const [settings, setSettings] = useState({
    roomInvoiceSize: "A4_v2",
    receiptSize: "A4",
    salesInvoiceSize: "A4",
    draftExpiryDays: "30",
  });
  const [saved, setSaved] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateType, setTemplateType] = useState("Đăng ký");
  const [language, setLanguage] = useState("Vietnam");
  const editorRef = useRef(null);

  const update = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  function runEditorCommand(command, value = null) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }

  function insertParameter(param) {
    editorRef.current?.focus();
    document.execCommand("insertText", false, `[${param}]`);
  }

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <h1>Máy in & Mẫu in</h1>
        <p>Thiết lập khổ giấy và chu kỳ xóa hóa đơn nháp cho hệ thống PMS.</p>
      </header>

      <section className={styles.configLayout}>
        <aside className={styles.configSide}>
          <ConfigGroup title="Cấu hình hóa đơn phòng">
            <SelectField label="Kích thước hóa đơn phòng" value={settings.roomInvoiceSize} options={ROOM_INVOICE_SIZES} onChange={(value) => update("roomInvoiceSize", value)} />
            <SelectField label="Kích thước biên lai" value={settings.receiptSize} options={RECEIPT_SIZES} onChange={(value) => update("receiptSize", value)} />
          </ConfigGroup>
          <ConfigGroup title="Cấu hình hóa đơn bán hàng">
            <SelectField label="Kích thước hóa đơn bán hàng" value={settings.salesInvoiceSize} options={SALES_INVOICE_SIZES} onChange={(value) => update("salesInvoiceSize", value)} />
            <SelectField label="Số ngày tự động xóa hóa đơn nháp" value={settings.draftExpiryDays} options={DRAFT_RETENTION_DAYS} onChange={(value) => update("draftExpiryDays", value)} />
          </ConfigGroup>
          <button className={`${styles.templateNav} ${showTemplate ? styles.templateNavActive : ""}`} onClick={() => setShowTemplate(true)}>Thiết lập biểu mẫu</button>
          <button className={styles.saveButton} type="button" onClick={handleSave}><Save size={14} />{saved ? "Đã lưu" : "Lưu"}</button>
        </aside>

        {showTemplate ? (
          <div className={styles.templateWorkspace}>
            <section className={styles.editorColumn}>
              <div className={styles.templateControls}>
                <select value={templateType} onChange={(e) => setTemplateType(e.target.value)}><option>Đăng ký</option><option>Hóa đơn phòng</option><option>Biên lai</option></select>
                <label>Ngôn ngữ<select value={language} onChange={(e) => setLanguage(e.target.value)}><option>Vietnam</option><option>English</option></select></label>
                <button type="button" onClick={() => {
                  const text = editorRef.current?.innerText || "";
                  navigator.clipboard?.writeText(text);
                }}>Copy mẫu</button>
              </div>
              <div className={styles.toolbar}>
                <button type="button" title="In" onMouseDown={(e) => e.preventDefault()} onClick={() => window.print()}><Printer size={16} /></button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("formatBlock", "pre")}>Mã HTML</button>
                <button type="button" title="In đậm" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("bold")}><Bold size={16} /></button>
                <button type="button" title="In nghiêng" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("italic")}><Italic size={16} /></button>
                <button type="button" title="Gạch chân" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("underline")}><Underline size={16} /></button>
                <button type="button" title="Căn trái" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("justifyLeft")}><AlignLeft size={16} /></button>
                <button type="button" title="Danh sách" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("insertUnorderedList")}><List size={16} /></button>
                <button type="button" title="Chèn liên kết" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("createLink", "https://")}><Link size={16} /></button>
                <button type="button" title="Chèn ảnh" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("insertImage", "https://")}><Image size={16} /></button>
              </div>
              <article ref={editorRef} className={styles.paper} contentEditable suppressContentEditableWarning tabIndex={0}>
                <h2>PHIẾU ĐĂNG KÝ / REGISTRATION FORM</h2>
                <div className={styles.formGrid}>
                  <p>Họ Tên/Full Name: <mark>[Full_name]</mark></p><p>Tổng tiền/Total price: <mark>[Total_price]</mark></p>
                  <p>Mã đặt phòng: <mark>[Booking_number]</mark></p><p>Loại phòng: <mark>[Room_type]</mark></p>
                  <p>Số điện thoại: <mark>[Customer_phone]</mark></p><p>Ngày đến: <mark>[Arrival]</mark></p>
                  <p>Số phòng: <mark>[Room_name]</mark></p><p>Ngày đi: <mark>[Departure]</mark></p>
                </div>
                <h3>Thông tin khác</h3>
                <p>Khách lưu trú vui lòng đăng ký đầy đủ thông tin tại quầy lễ tân. Giờ nhận phòng từ 14:00 và trả phòng trước 12:00.</p>
                <p>Mọi dịch vụ phát sinh trong thời gian lưu trú sẽ được cập nhật vào hóa đơn phòng.</p>
              </article>
            </section>
            <aside className={styles.paramsColumn}>
              <h2>Tham số</h2><p>Copy mã vào form để hệ thống thay thế thông tin.</p>
              {Object.entries(TEMPLATE_PARAMS).map(([group, params]) => <section key={group}><h3>{group}</h3>{params.map((param) => <button type="button" key={param} onMouseDown={(e) => e.preventDefault()} onClick={() => insertParameter(param)}>[{param}]</button>)}</section>)}
            </aside>
          </div>
        ) : <div className={styles.templateEmpty}>Chọn “Thiết lập biểu mẫu” để mở trình soạn thảo mẫu in.</div>}
      </section>
    </main>
  );
}

function ConfigGroup({ title, children }) { return <section className={styles.configGroup}><h2>{title}</h2>{children}</section>; }
function SelectField({ label, value, options, onChange }) { return <label className={styles.field}><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }

export default PrinterTemplateConfig;
