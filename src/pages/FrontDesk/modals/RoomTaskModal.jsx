import { useState } from "react";
import ModalShell from "./ModalShell";
import shared from "./shared.module.css";
import { toLocalInputValue } from "../../../utils/format";

function RoomTaskModal({ booking, onClose, onSave }) {
  const [dueAt, setDueAt] = useState(toLocalInputValue(new Date()));
  const [assignee, setAssignee] = useState("Lễ Tân");
  const [action, setAction] = useState("Booked");
  const [content, setContent] = useState("");

  return (
    <ModalShell
      title="Việc cần làm"
      onClose={onClose}
      width={640}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>Đóng</button>
          <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} disabled={!content.trim()} onClick={() => onSave({ dueAt, assignee, action, content })}>Lưu</button>
        </>
      }
    >
      <div className={shared.stack}>
        <div className={shared.row}>
          <input className={shared.input} value={`${booking.room} (#${booking.bookingCode}) - ${booking.guest.name}`} disabled />
          <input className={shared.input} type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </div>
        <div className={shared.row}>
          <label className={shared.field}><span className={shared.label}>Người thực hiện</span><select className={shared.select} value={assignee} onChange={(e) => setAssignee(e.target.value)}><option>Lễ Tân</option><option>Buồng phòng</option></select></label>
          <label className={shared.field}><span className={shared.label}>Thao tác</span><select className={shared.select} value={action} onChange={(e) => setAction(e.target.value)}><option>Booked</option><option>Cleaning</option><option>Maintenance</option></select></label>
        </div>
        <label className={shared.field}><span className={shared.label}>Nội dung *</span><textarea className={shared.textarea} maxLength={400} value={content} onChange={(e) => setContent(e.target.value)} /><span className={shared.label}>{content.length}/400</span></label>
      </div>
    </ModalShell>
  );
}

export default RoomTaskModal;
