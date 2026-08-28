import { useRef, useState } from "react";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code2, Eraser,
  Image, IndentDecrease, IndentIncrease, Italic, Link, List, ListOrdered,
  Printer, Quote, Redo2, Save, Strikethrough, Table2, Underline, Undo2, Unlink,
} from "lucide-react";
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
  const [htmlMode, setHtmlMode] = useState(false);
  const editorRef = useRef(null);

  const update = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  function runEditorCommand(command, value = null) {
    if (htmlMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }

  function toggleHtmlMode() {
    const editor = editorRef.current;
    if (!editor) return;
    if (htmlMode) editor.innerHTML = editor.textContent;
    else editor.textContent = editor.innerHTML;
    setHtmlMode((current) => !current);
    window.requestAnimationFrame(() => editor.focus());
  }

  function insertLink() {
    const url = window.prompt("Nhập địa chỉ liên kết (URL):", "https://");
    if (url) runEditorCommand("createLink", url);
  }

  function insertImage() {
    const url = window.prompt("Nhập địa chỉ ảnh (URL):", "https://");
    if (url) runEditorCommand("insertImage", url);
  }

  function insertTable() {
    const rowInput = window.prompt("Số hàng (1–10):", "2");
    if (rowInput === null || !Number(rowInput)) return;
    const columnInput = window.prompt("Số cột (1–10):", "2");
    if (columnInput === null || !Number(columnInput)) return;
    const rows = Math.max(1, Math.min(10, Math.floor(Number(rowInput))));
    const columns = Math.max(1, Math.min(10, Math.floor(Number(columnInput))));
    const cells = Array.from({ length: rows }, () => `<tr>${"<td>&nbsp;</td>".repeat(columns)}</tr>`).join("");
    runEditorCommand("insertHTML", `<table border="1" style="width:100%;border-collapse:collapse"><tbody>${cells}</tbody></table>`);
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
                <div className={styles.toolGroup}>
                  <button type="button" title="In biểu mẫu" onMouseDown={(e) => e.preventDefault()} onClick={() => window.print()}><Printer size={15} /></button>
                  <button type="button" title={htmlMode ? "Quay lại trình soạn thảo" : "Chỉnh sửa mã HTML"} className={htmlMode ? styles.toolActive : ""} onMouseDown={(e) => e.preventDefault()} onClick={toggleHtmlMode}><Code2 size={15} /> Mã HTML</button>
                </div>
                <div className={styles.toolGroup}>
                  <button type="button" title="Hoàn tác" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("undo")}><Undo2 size={15} /></button>
                  <button type="button" title="Làm lại" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("redo")}><Redo2 size={15} /></button>
                </div>
                <select title="Định dạng đoạn" defaultValue="" onChange={(e) => { runEditorCommand("formatBlock", e.target.value); e.target.value = ""; }} disabled={htmlMode}>
                  <option value="" disabled>Định dạng</option><option value="p">Đoạn văn</option><option value="h1">Tiêu đề 1</option><option value="h2">Tiêu đề 2</option><option value="h3">Tiêu đề 3</option><option value="blockquote">Trích dẫn</option>
                </select>
                <select title="Phông chữ" defaultValue="" onChange={(e) => { runEditorCommand("fontName", e.target.value); e.target.value = ""; }} disabled={htmlMode}>
                  <option value="" disabled>Phông</option><option value="Arial">Arial</option><option value="Times New Roman">Times New Roman</option><option value="Georgia">Georgia</option><option value="Tahoma">Tahoma</option><option value="Verdana">Verdana</option>
                </select>
                <select title="Cỡ chữ" defaultValue="" onChange={(e) => { runEditorCommand("fontSize", e.target.value); e.target.value = ""; }} disabled={htmlMode}>
                  <option value="" disabled>Cỡ chữ</option><option value="1">8 px</option><option value="2">10 px</option><option value="3">12 px</option><option value="4">14 px</option><option value="5">18 px</option><option value="6">24 px</option><option value="7">32 px</option>
                </select>
                <div className={styles.toolGroup}>
                  <button type="button" title="In đậm" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("bold")}><Bold size={15} /></button>
                  <button type="button" title="In nghiêng" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("italic")}><Italic size={15} /></button>
                  <button type="button" title="Gạch chân" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("underline")}><Underline size={15} /></button>
                  <button type="button" title="Gạch ngang" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("strikeThrough")}><Strikethrough size={15} /></button>
                  <button type="button" title="Xóa định dạng" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("removeFormat")}><Eraser size={15} /></button>
                </div>
                <label className={styles.colorTool} title="Màu chữ"><span>A</span><input type="color" defaultValue="#111111" disabled={htmlMode} onChange={(e) => runEditorCommand("foreColor", e.target.value)} /></label>
                <label className={styles.colorTool} title="Màu nền chữ"><span>A</span><input type="color" defaultValue="#fff200" disabled={htmlMode} onChange={(e) => runEditorCommand("hiliteColor", e.target.value)} /></label>
                <div className={styles.toolGroup}>
                  <button type="button" title="Căn trái" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("justifyLeft")}><AlignLeft size={15} /></button>
                  <button type="button" title="Căn giữa" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("justifyCenter")}><AlignCenter size={15} /></button>
                  <button type="button" title="Căn phải" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("justifyRight")}><AlignRight size={15} /></button>
                  <button type="button" title="Căn đều" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("justifyFull")}><AlignJustify size={15} /></button>
                </div>
                <div className={styles.toolGroup}>
                  <button type="button" title="Chèn liên kết" onMouseDown={(e) => e.preventDefault()} onClick={insertLink}><Link size={15} /></button>
                  <button type="button" title="Xóa liên kết" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("unlink")}><Unlink size={15} /></button>
                  <button type="button" title="Danh sách dấu đầu dòng" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("insertUnorderedList")}><List size={15} /></button>
                  <button type="button" title="Danh sách đánh số" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("insertOrderedList")}><ListOrdered size={15} /></button>
                  <button type="button" title="Giảm thụt lề" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("outdent")}><IndentDecrease size={15} /></button>
                  <button type="button" title="Tăng thụt lề" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("indent")}><IndentIncrease size={15} /></button>
                  <button type="button" title="Trích dẫn" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand("formatBlock", "blockquote")}><Quote size={15} /></button>
                  <button type="button" title="Chèn ảnh" onMouseDown={(e) => e.preventDefault()} onClick={insertImage}><Image size={15} /></button>
                  <button type="button" title="Chèn bảng" onMouseDown={(e) => e.preventDefault()} onClick={insertTable}><Table2 size={15} /></button>
                </div>
              </div>
              <article ref={editorRef} className={`${styles.paper} ${htmlMode ? styles.htmlEditor : ""}`} contentEditable suppressContentEditableWarning tabIndex={0}>
                <h2>PHIẾU ĐĂNG KÝ/REGISTRATION FORM</h2>
                <div className={styles.registrationGrid}>
                  <div className={styles.registrationColumn}>
                    <p>Họ Tên/<i>Full Name:</i> <mark>[Full_name]</mark></p>
                    <p>Mã đặt phòng/<i>Bks ID:</i> <mark>[Code]</mark></p>
                    <p>CCCD/ ID: <mark>[Customer_identity_number]</mark></p>
                    <p>Ngày sinh/<i>DOB:</i> <mark>[Customer_birthday]</mark></p>
                    <p>Số điện thoại/<i>Phone no.:</i> <mark>[Customer_phone]</mark></p>
                    <p>Số phòng/<i>Room no.:</i> <mark>[Room_name]</mark></p>
                  </div>
                  <div className={styles.registrationColumn}>
                    <p>Tổng tiền/<i>Total price:</i> <mark>[Total_price]</mark></p>
                    <p>Đã cọc/<i>Deposited:</i> ................ Còn lại/<i>Amount:</i> ................</p>
                    <p>Loại phòng/<i>Room type:</i> <mark>[Room_type]</mark></p>
                    <p>Đêm phòng/<i>Room night:</i> <mark>[Total_night]</mark></p>
                    <p>Ngày đến/<i>Arrival date:</i> <mark>[Arrival]</mark></p>
                    <p>Ngày đi/<i>Departure date:</i> <mark>[Departure]</mark></p>
                  </div>
                </div>
                <section className={styles.otherInfo}>
                  <h3>Thông tin khác:</h3>
                  <div className={styles.otherInfoGrid}>
                    <p>- Biển số xe hơi: ...........................................</p>
                    <p>- Yêu cầu đặc biệt: ...........................................</p>
                    <p>- Thuê xe máy: ...............................................</p>
                    <p>- Chèo SUP: ....................................................</p>
                  </div>
                </section>
                <section className={styles.terms}>
                  <p>- Tất cả các khách lưu trú tại khách sạn cần được đăng ký lưu trú với lễ tân khách sạn. Trường hợp có ý không đăng ký đầy đủ với lễ tân, phía khách sạn sẽ không chịu trách nhiệm. <i>Guests stay at hotel must be registered at reception desk.</i></p>
                  <p>- Giờ nhận phòng quy định của Joi là 14:00 và trả phòng trước 12:00 ngày check out. Trường hợp quý khách có nhu cầu nhận phòng sớm/trả phòng trễ vui lòng báo trước với lễ tân để được hỗ trợ tùy theo tình trạng phòng trống của khách sạn. <i>Check-in time is 14:00 and check-out before 12:00 noon. In case you need request for late check-out/early check-in, it depend on our availability, please contact to receptionist for more information.</i></p>
                  <p>- Phí phụ thu dọn dẹp 500,000 VNĐ sẽ được áp dụng cho các trường hợp có ý hút thuốc, mang thú cưng vào và ăn uống trong phòng không dọn dẹp. <i>Our hotel rooms are non-smoking, pet are not allowed and do not bring strong smell food to our rooms like durian, seafood. 500,000 surcharge fee will be apply if you violate.</i></p>
                  <p>- Trong phòng Joi có cung cấp 02 chai nước suối nhỏ miễn phí, còn lại sẽ được tính phí nếu quý khách sử dụng minibar gồm 02 nước suối lớn, 02 mì ly, 01 coca, 01 trà, 01 bánh oreo, 01 đậu phộng và 01 bánh khoai tây. <i>We have 02 complimentary small water bottles in room, other minibar will be charged included 02 water bottle, 02 instant noodle, 01 for coke, tea, cookies, chips, crispy peanuts.</i></p>
                </section>
                <footer className={styles.signatures}>
                  <div>Chữ ký khách hàng/<i>Guest signature</i></div>
                  <div>Chữ ký của nhân viên/<i>Staff signature</i></div>
                </footer>
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
