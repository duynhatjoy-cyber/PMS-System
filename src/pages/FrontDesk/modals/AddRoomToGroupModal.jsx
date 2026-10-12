import { useState } from "react";
import SlidePanelShell from "./SlidePanelShell";
import BookingIdentityHeader from "./BookingIdentityHeader";
import { roomTypes } from "../../../data/frontDeskData";
import { searchAvailableRooms } from "../../../utils/bookingGroups";
import { toLocalInputValue } from "../../../utils/format";
import shared from "./shared.module.css";
import choiceStyles from "./groupChoice.module.css";

function AddRoomToGroupModal({ booking, bookings, roomOptions, onClose, onConfirm }) {
  const [from, setFrom] = useState(toLocalInputValue(booking.checkIn));
  const [to, setTo] = useState(toLocalInputValue(booking.checkOut));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  function search() {
    const checkIn = new Date(from);
    const checkOut = new Date(to);
    if (!from || !to || !(checkOut > checkIn)) {
      setError("Ngày đi phải sau ngày đến.");
      setResults(null);
      return;
    }
    setError("");
    setSelected("");
    setResults(searchAvailableRooms(bookings, checkIn, checkOut, query, roomOptions));
  }

  function invalidate(setter, value) {
    setter(value);
    setResults(null);
    setSelected("");
    setError("");
  }

  return (
    <SlidePanelShell header={<BookingIdentityHeader title="Thêm phòng vào đoàn" booking={booking} />} onClose={onClose} width={540}
      footer={<><button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>Hủy</button>
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} disabled={!selected} onClick={() => {
          const room = results?.find((item) => item.room === selected);
          if (room) onConfirm({ ...room, checkIn: new Date(from), checkOut: new Date(to) });
        }}>Xác nhận thêm phòng</button></>}>
      <div className={shared.stack}>
        <p className={shared.bodyText}>Chọn khoảng ngày, tìm phòng còn trống rồi xác nhận. Phòng mới sẽ thuộc cùng đoàn với đặt phòng hiện tại.</p>
        <div className={shared.row}>
          <label className={shared.field}><span className={shared.label}>Ngày đến *</span><input className={shared.input} type="datetime-local" value={from} onChange={(event) => invalidate(setFrom, event.target.value)} /></label>
          <label className={shared.field}><span className={shared.label}>Ngày đi *</span><input className={shared.input} type="datetime-local" value={to} onChange={(event) => invalidate(setTo, event.target.value)} /></label>
        </div>
        <label className={shared.field}><span className={shared.label}>Tìm số phòng</span><input className={shared.input} value={query} placeholder="Ví dụ: 201" onChange={(event) => invalidate(setQuery, event.target.value)} /></label>
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={search}>Tìm kiếm phòng trống</button>
        {error && <p role="alert" className={shared.hint}>{error}</p>}
        {results && <div className={shared.field}>
          <span className={shared.label}>Phòng còn trống ({results.length})</span>
          {results.length === 0 ? <p className={shared.hint}>Không tìm thấy phòng trống trong khoảng ngày đã chọn.</p> :
            <div className={choiceStyles.list} role="group" aria-label="Chọn phòng trống">
              {results.map((item) => <button key={item.room} type="button"
                className={`${choiceStyles.choice} ${selected === item.room ? choiceStyles.selected : ""}`}
                aria-pressed={selected === item.room} onClick={() => setSelected(item.room)}>
                <span><strong>Phòng {item.room}</strong><small>{roomTypes.find((type) => type.id === item.typeId)?.name || item.typeId}</small></span>
                <small>{selected === item.room ? "Đã chọn" : "Chọn phòng"}</small>
              </button>)}
            </div>}
        </div>}
      </div>
    </SlidePanelShell>
  );
}

export default AddRoomToGroupModal;
