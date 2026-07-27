import { useState } from "react";
import ModalShell from "./ModalShell";
import BookingIdentityHeader from "./BookingIdentityHeader";
import shared from "./shared.module.css";

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function ChangeDateModal({ booking, onClose, onSave }) {
  const [checkIn, setCheckIn] = useState(toLocalInputValue(booking.checkIn));
  const [checkOut, setCheckOut] = useState(toLocalInputValue(booking.checkOut));

  function setCheckOutToNow() {
    setCheckOut(toLocalInputValue(new Date()));
  }

  return (
    <ModalShell
      header={<BookingIdentityHeader title="Đổi ngày ở" booking={booking} />}
      onClose={onClose}
      width={480}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            onClick={() => onSave({ checkIn: new Date(checkIn), checkOut: new Date(checkOut) })}
          >
            Lưu
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className={shared.field}>
          <span className={shared.label}>Sẽ đến</span>
          <input
            type="datetime-local"
            className={shared.input}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>

        <div className={shared.field}>
          <span className={shared.label}>Sẽ đi</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="datetime-local"
              className={shared.input}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
            <button
              type="button"
              className={`${shared.btn} ${shared.btnSecondary}`}
              onClick={setCheckOutToNow}
            >
              Hiện tại
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export default ChangeDateModal;
