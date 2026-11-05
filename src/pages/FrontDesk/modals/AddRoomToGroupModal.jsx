import { useState } from "react";
import { Baby, Minus, Plus, User } from "lucide-react";
import SlidePanelShell from "./SlidePanelShell";
import BookingIdentityHeader from "./BookingIdentityHeader";
import { roomTypes } from "../../../data/frontDeskData";
import { searchAvailableRooms } from "../../../utils/bookingGroups";
import { formatCurrency, toLocalInputValue } from "../../../utils/format";
import shared from "./shared.module.css";
import styles from "./AddRoomToGroupModal.module.css";

function AddRoomToGroupModal({ booking, bookings, roomOptions, onClose, onConfirm }) {
  const initialFrom = toLocalInputValue(booking.checkIn);
  const initialTo = toLocalInputValue(booking.checkOut);
  const [from, setFrom] = useState(initialFrom.slice(0, 10));
  const [to, setTo] = useState(initialTo.slice(0, 10));
  const [selected, setSelected] = useState("");
  const [searched, setSearched] = useState(false);
  const [showDateError, setShowDateError] = useState(false);
  const checkIn = from ? new Date(`${from}T${initialFrom.slice(11) || "14:00"}`) : null;
  const checkOut = to ? new Date(`${to}T${initialTo.slice(11) || "12:00"}`) : null;
  const validRange = checkIn && checkOut && checkOut > checkIn;
  const results = searched && validRange ? searchAvailableRooms(bookings, checkIn, checkOut, "", roomOptions) : [];
  const roomsByType = roomTypes.map((type) => ({ ...type, rooms: results.filter((room) => room.typeId === type.id) }));

  return <SlidePanelShell header={<BookingIdentityHeader title="Thêm phòng vào đoàn" booking={booking} />} onClose={onClose} width={760}
    footer={<><button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>Hủy</button>
      <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} disabled={!selected || !validRange} onClick={() => {
        const room = results.find((item) => item.room === selected);
        if (room) onConfirm({ ...room, checkIn, checkOut });
      }}>Xác nhận thêm phòng</button></>}>
    <div className={styles.content}>
      <div className={styles.dates}>
        <label className={shared.field}><span className={shared.label}>Ngày đến *</span><input className={shared.input} type="date" value={from} onChange={(event) => { setFrom(event.target.value); setSelected(""); setSearched(false); setShowDateError(false); }} /></label>
        <label className={shared.field}><span className={shared.label}>Ngày đi *</span><input className={shared.input} type="date" value={to} onChange={(event) => { setTo(event.target.value); setSelected(""); setSearched(false); setShowDateError(false); }} /></label>
      </div>
      <button type="button" className={`${shared.btn} ${shared.btnPrimary} ${styles.searchButton}`} onClick={() => { setShowDateError(!validRange); setSearched(Boolean(validRange)); }}>Tìm phòng trống</button>
      {showDateError && <p role="alert" className={styles.error}>Ngày đi phải sau ngày đến.</p>}
      {searched && <div className={styles.table}>
        <div className={`${styles.row} ${styles.heading}`}><span>Loại phòng</span><span>Loại giá</span><span>Giá mặc định</span><span>Khách</span><span>Số lượng</span></div>
        {roomsByType.map((type) => {
          const chosen = type.rooms.find((room) => room.room === selected);
          return <div className={styles.row} key={type.id}>
            <div className={styles.roomType}><strong>{type.name}</strong><small>{type.rooms.length ? `${type.rooms.length} còn lại` : "Hết phòng"}</small></div>
            <select className={styles.rateSelect} aria-label={`Loại giá ${type.name}`} defaultValue="default"><option value="default">Giá niêm yết</option></select>
            <span className={styles.price}>{formatCurrency(type.price)}</span>
            <span className={styles.guests}><User size={13} /> {type.maxOccupancy} <Baby size={13} /> 0</span>
            <div className={styles.stepper}><button type="button" aria-label={`Bỏ chọn ${type.name}`} disabled={!chosen} onClick={() => setSelected("")}><Minus size={13} /></button><span>{chosen ? 1 : 0}</span><button type="button" aria-label={`Chọn ${type.name}`} disabled={!type.rooms.length || Boolean(chosen)} onClick={() => setSelected(type.rooms[0].room)}><Plus size={13} /></button></div>
            {chosen && <div className={styles.roomPicker}><label>Phòng cụ thể <select value={selected} onChange={(event) => setSelected(event.target.value)}>{type.rooms.map((room) => <option key={room.room} value={room.room}>Phòng {room.room}</option>)}</select></label></div>}
          </div>;
        })}
      </div>}
    </div>
  </SlidePanelShell>;
}

export default AddRoomToGroupModal;
