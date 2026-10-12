import { useState } from "react";
import SlidePanelShell from "./SlidePanelShell";
import BookingIdentityHeader from "./BookingIdentityHeader";
import { formatDateTimeDMY } from "../../../utils/format";
import shared from "./shared.module.css";
import choiceStyles from "./groupChoice.module.css";

function MergeRoomGroupModal({ booking, candidates, onClose, onConfirm }) {
  const [query, setQuery] = useState("");
  const [targetId, setTargetId] = useState("");
  const filtered = candidates.filter((item) =>
    `${item.bookingCode} ${item.room || ""} ${item.guest.name}`.toLowerCase().includes(query.trim().toLowerCase())
  );
  const target = candidates.find((item) => item.id === targetId);
  return (
    <SlidePanelShell header={<BookingIdentityHeader title="Gộp phòng thành đoàn" booking={booking} />} onClose={onClose} width={540}
      footer={<><button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>Hủy</button>
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} disabled={!target} onClick={() => onConfirm(target)}>Xác nhận gộp phòng</button></>}>
      <div className={shared.stack}>
        <p className={shared.bodyText}>Tìm đặt phòng theo mã, số phòng hoặc tên khách. Sau xác nhận, các phòng xuất hiện trong cùng chi tiết đoàn.</p>
        <label className={shared.field}><span className={shared.label}>Tìm đặt phòng</span>
          <input className={shared.input} value={query} placeholder="Mã đặt phòng, số phòng, tên khách" onChange={(event) => { setQuery(event.target.value); setTargetId(""); }} /></label>
        <div className={shared.field}><span className={shared.label}>Đặt phòng cần gộp ({filtered.length})</span>
          <div className={choiceStyles.list} role="group" aria-label="Chọn đặt phòng cần gộp">
            {filtered.map((item) => <button key={item.id} type="button"
              className={`${choiceStyles.choice} ${targetId === item.id ? choiceStyles.selected : ""}`}
              aria-pressed={targetId === item.id} onClick={() => setTargetId(item.id)}>
              <span><strong>#{item.bookingCode} · phòng {item.room}</strong><small>{item.guest.name}</small></span>
              <small>{targetId === item.id ? "Đã chọn" : "Chọn"}</small>
            </button>)}
          </div></div>
        {filtered.length === 0 && <p className={shared.hint}>Không tìm thấy đặt phòng phù hợp.</p>}
        {target && <div className={shared.field}>
          <span className={shared.label}>Xem trước</span>
          <p className={shared.bodyText}>Phòng {target.room} · {target.guest.name}<br />{formatDateTimeDMY(target.checkIn)} – {formatDateTimeDMY(target.checkOut)}</p>
        </div>}
      </div>
    </SlidePanelShell>
  );
}

export default MergeRoomGroupModal;
