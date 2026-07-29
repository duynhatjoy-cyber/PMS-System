import {
  Code2,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Quote,
  Image,
  Table2,
  Type,
  Highlighter,
} from "lucide-react";
import styles from "./EmailToolbar.module.css";

// Not wired to a real rich-text editor yet — every control gives the same
// "coming soon" feedback (matching the pattern already used elsewhere, e.g.
// Warehouse's chip "add material" button) instead of silently doing nothing.
function EmailToolbar({ onToast }) {
  function notReady() {
    onToast("Chức năng đang được phát triển");
  }

  return (
    <div className={styles.toolbar}>
      <button type="button" className={styles.toolbarBtn} title="Mã HTML" onClick={notReady}>
        <Code2 size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Hoàn tác" onClick={notReady}>
        <Undo2 size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Làm lại" onClick={notReady}>
        <Redo2 size={16} />
      </button>
      <span className={styles.toolbarDivider} />
      <select className={styles.toolbarSelect} defaultValue="Định dạng" onChange={notReady}>
        <option>Định dạng</option>
        <option>Đoạn văn</option>
        <option>Tiêu đề 1</option>
        <option>Tiêu đề 2</option>
      </select>
      <select className={styles.toolbarSelect} defaultValue="Phông" onChange={notReady}>
        <option>Phông</option>
        <option>Inter</option>
        <option>Arial</option>
        <option>Times New Roman</option>
      </select>
      <select className={styles.toolbarSelect} defaultValue="Cỡ chữ" onChange={notReady}>
        <option>Cỡ chữ</option>
        <option>12px</option>
        <option>14px</option>
        <option>16px</option>
      </select>
      <span className={styles.toolbarDivider} />
      <button type="button" className={styles.toolbarBtn} title="Đậm" onClick={notReady}>
        <Bold size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Nghiêng" onClick={notReady}>
        <Italic size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Gạch chân" onClick={notReady}>
        <Underline size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Gạch ngang" onClick={notReady}>
        <Strikethrough size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Xóa định dạng" onClick={notReady}>
        <Eraser size={16} />
      </button>
      <button type="button" className={styles.toolbarSwatch} title="Màu chữ" onClick={notReady}>
        <Type size={15} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Tô sáng" onClick={notReady}>
        <Highlighter size={16} />
      </button>
      <span className={styles.toolbarDivider} />
      <button type="button" className={styles.toolbarBtn} title="Căn trái" onClick={notReady}>
        <AlignLeft size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Căn giữa" onClick={notReady}>
        <AlignCenter size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Căn phải" onClick={notReady}>
        <AlignRight size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Căn đều" onClick={notReady}>
        <AlignJustify size={16} />
      </button>
      <span className={styles.toolbarDivider} />
      <button type="button" className={styles.toolbarBtn} title="Danh sách không thứ tự" onClick={notReady}>
        <List size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Danh sách có thứ tự" onClick={notReady}>
        <ListOrdered size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Giảm thụt lề" onClick={notReady}>
        <Outdent size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Tăng thụt lề" onClick={notReady}>
        <Indent size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Trích dẫn" onClick={notReady}>
        <Quote size={16} />
      </button>
      <span className={styles.toolbarDivider} />
      <button type="button" className={styles.toolbarBtn} title="Chèn ảnh" onClick={notReady}>
        <Image size={16} />
      </button>
      <button type="button" className={styles.toolbarBtn} title="Chèn bảng" onClick={notReady}>
        <Table2 size={16} />
      </button>
    </div>
  );
}

export default EmailToolbar;
