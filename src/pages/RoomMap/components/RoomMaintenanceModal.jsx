import { useState } from "react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { addDays, toLocalInputValue } from "../../../utils/format";

function RoomMaintenanceModal({ room, initialValue, onClose, onSave, onDelete }) {
  const editing = Boolean(initialValue);
  const now = new Date();
  const [start, setStart] = useState(
    toLocalInputValue(initialValue?.start || now)
  );
  const [end, setEnd] = useState(
    toLocalInputValue(initialValue?.end || addDays(now, 1))
  );
  const [reason, setReason] = useState(initialValue?.reason || "");

  return (
    <SlidePanelShell
      title={`${editing ? "Điều chỉnh khóa/sửa phòng" : "Thiết lập sửa phòng"} - Phòng ${room.number}`}
      onClose={onClose}
      width={620}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            {editing ? "Đóng" : "Bỏ qua"}
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            disabled={!start || !end || new Date(end) <= new Date(start)}
            onClick={() => onSave({ start: new Date(start), end: new Date(end), reason })}
          >
            {editing ? "Lưu thiết lập" : "Thêm"}
          </button>
        </>
      }
    >
      <div className={shared.stack}>
        <label className={shared.field}>
          <span className={shared.label}>Ngày bắt đầu</span>
          <input className={shared.input} type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className={shared.field}>
          <span className={shared.label}>Ngày kết thúc</span>
          <input className={shared.input} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <label className={shared.field}>
          <span className={shared.label}>Lý do</span>
          <textarea className={shared.textarea} value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        {editing && (
          <button
            type="button"
            className={`${shared.btn} ${shared.btnDanger}`}
            style={{ alignSelf: "flex-start" }}
            onClick={onDelete}
          >
            Xóa sửa phòng
          </button>
        )}
      </div>
    </SlidePanelShell>
  );
}

export default RoomMaintenanceModal;
