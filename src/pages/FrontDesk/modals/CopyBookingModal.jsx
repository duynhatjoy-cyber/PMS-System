import { useMemo, useState } from "react";
import ModalShell from "./ModalShell";
import { roomTypes, ratePlans, AVAILABLE_ROOMS } from "../../../data/frontDeskData";
import { formatCurrency, formatDateTimeDMY, toLocalInputValue } from "../../../utils/format";
import shared from "./shared.module.css";
import styles from "./CopyBookingModal.module.css";

function CopyBookingModal({ booking, onClose, onConfirm }) {
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0].id);
  const [room, setRoom] = useState("");
  const [ratePlan, setRatePlan] = useState(ratePlans[0]);
  const [note, setNote] = useState("Walk-in");
  const [newCheckIn, setNewCheckIn] = useState(toLocalInputValue(booking.checkIn));
  const [newCheckOut, setNewCheckOut] = useState(toLocalInputValue(booking.checkOut));

  const selectedRoomType = roomTypes.find((rt) => rt.id === roomTypeId);
  const availableRooms = useMemo(() => AVAILABLE_ROOMS[roomTypeId] || [], [roomTypeId]);

  return (
    <ModalShell
      title="Sao chép đặt phòng"
      tone="brand"
      onClose={onClose}
      width={900}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Bỏ qua
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            disabled={!room}
            onClick={() =>
              onConfirm({
                roomType: selectedRoomType.name,
                room,
                ratePlan,
                note,
                price: selectedRoomType.price,
                checkIn: new Date(newCheckIn),
                checkOut: new Date(newCheckOut),
              })
            }
          >
            Thực hiện
          </button>
        </>
      }
    >
      <div className={styles.split}>
        <div className={styles.col}>
          <div className={styles.colTitle}>Đặt phòng mới</div>

          <div className={shared.field}>
            <span className={shared.label}>Loại phòng</span>
            <select
              className={shared.select}
              value={roomTypeId}
              onChange={(e) => {
                setRoomTypeId(e.target.value);
                setRoom("");
              }}
            >
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>

          <div className={shared.field}>
            <span className={shared.label}>Phòng</span>
            <select className={shared.select} value={room} onChange={(e) => setRoom(e.target.value)}>
              <option value="">Chọn phòng</option>
              {availableRooms.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className={shared.field}>
            <span className={shared.label}>Giá</span>
            <select className={shared.select} value={ratePlan} onChange={(e) => setRatePlan(e.target.value)}>
              {ratePlans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.staticRow}>
            <span>Đơn giá</span>
            <strong>{formatCurrency(selectedRoomType.price)}</strong>
          </div>

          <div className={shared.row}>
            <div className={shared.field}>
              <span className={shared.label}>Sẽ đến</span>
              <input
                type="datetime-local"
                className={shared.input}
                value={newCheckIn}
                onChange={(e) => setNewCheckIn(e.target.value)}
              />
            </div>
            <div className={shared.field}>
              <span className={shared.label}>Sẽ đi</span>
              <input
                type="datetime-local"
                className={shared.input}
                value={newCheckOut}
                onChange={(e) => setNewCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className={shared.field}>
            <span className={shared.label}>Ghi chú</span>
            <input className={shared.input} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Đặt phòng hiện tại</div>

          <div className={styles.readRow}>
            <span>Mã đặt phòng</span>
            <strong>{booking.bookingCode}</strong>
          </div>
          <div className={styles.readRow}>
            <span>Phòng</span>
            <strong>
              {booking.room} ({booking.roomType})
            </strong>
          </div>
          <div className={styles.readRow}>
            <span>Giá phòng</span>
            <strong>Mặc định</strong>
          </div>
          <div className={styles.readRow}>
            <span>Người lớn</span>
            <strong>{booking.adults}</strong>
          </div>
          <div className={styles.readRow}>
            <span>Số trẻ em</span>
            <strong>{booking.children}</strong>
          </div>
          <div className={styles.readRow}>
            <span>Sẽ đến</span>
            <strong>{formatDateTimeDMY(booking.checkIn)}</strong>
          </div>
          <div className={styles.readRow}>
            <span>Sẽ đi</span>
            <strong>{formatDateTimeDMY(booking.checkOut)}</strong>
          </div>
          <div className={styles.readRow}>
            <span>Khách</span>
            <strong>{booking.guest.name}</strong>
          </div>
          <div className={styles.readRow}>
            <span>Nguồn</span>
            <strong>{booking.source}</strong>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export default CopyBookingModal;
