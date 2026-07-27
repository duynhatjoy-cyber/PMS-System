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

function EmailToolbar() {
  return (
    <div className={styles.toolbar}>
      <span className={styles.toolbarBtn} title="Mã HTML">
        <Code2 size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Hoàn tác">
        <Undo2 size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Làm lại">
        <Redo2 size={16} />
      </span>
      <span className={styles.toolbarDivider} />
      <select className={styles.toolbarSelect} defaultValue="Định dạng">
        <option>Định dạng</option>
        <option>Đoạn văn</option>
        <option>Tiêu đề 1</option>
        <option>Tiêu đề 2</option>
      </select>
      <select className={styles.toolbarSelect} defaultValue="Phông">
        <option>Phông</option>
        <option>Inter</option>
        <option>Arial</option>
        <option>Times New Roman</option>
      </select>
      <select className={styles.toolbarSelect} defaultValue="Cỡ chữ">
        <option>Cỡ chữ</option>
        <option>12px</option>
        <option>14px</option>
        <option>16px</option>
      </select>
      <span className={styles.toolbarDivider} />
      <span className={styles.toolbarBtn} title="Đậm">
        <Bold size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Nghiêng">
        <Italic size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Gạch chân">
        <Underline size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Gạch ngang">
        <Strikethrough size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Xóa định dạng">
        <Eraser size={16} />
      </span>
      <span className={styles.toolbarSwatch} title="Màu chữ">
        <Type size={15} />
      </span>
      <span className={styles.toolbarBtn} title="Tô sáng">
        <Highlighter size={16} />
      </span>
      <span className={styles.toolbarDivider} />
      <span className={styles.toolbarBtn} title="Căn trái">
        <AlignLeft size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Căn giữa">
        <AlignCenter size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Căn phải">
        <AlignRight size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Căn đều">
        <AlignJustify size={16} />
      </span>
      <span className={styles.toolbarDivider} />
      <span className={styles.toolbarBtn} title="Danh sách không thứ tự">
        <List size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Danh sách có thứ tự">
        <ListOrdered size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Giảm thụt lề">
        <Outdent size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Tăng thụt lề">
        <Indent size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Trích dẫn">
        <Quote size={16} />
      </span>
      <span className={styles.toolbarDivider} />
      <span className={styles.toolbarBtn} title="Chèn ảnh">
        <Image size={16} />
      </span>
      <span className={styles.toolbarBtn} title="Chèn bảng">
        <Table2 size={16} />
      </span>
    </div>
  );
}

export default EmailToolbar;
