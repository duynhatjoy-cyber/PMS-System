import { useMemo, useState } from "react";
import ModalShell from "./ModalShell";
import BookingIdentityHeader from "./BookingIdentityHeader";
import { roomTypes, ratePlans, AVAILABLE_ROOMS } from "../../../data/frontDeskData";
import shared from "./shared.module.css";

function AssignRoomModal({ booking, onClose, onSave }) {
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0].id);
  const [room, setRoom] = useState(booking.room || "");
  const [overridePrice, setOverridePrice] = useState(false);
  const [ratePlan, setRatePlan] = useState(ratePlans[0]);

  const availableRooms = useMemo(() => AVAILABLE_ROOMS[roomTypeId] || [], [roomTypeId]);

  const roomTypeLabel = roomTypes.find((rt) => rt.id === roomTypeId)?.name || "";

  return (
    <ModalShell
      header={<BookingIdentityHeader title="Gán phòng" booking={booking} />}
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
            disabled={!room}
            onClick={() => onSave({ room, roomType: roomTypeLabel, ratePlan: overridePrice ? ratePlan : null })}
          >
            Lưu
          </button>
        </>
      }
    >
      <div className={shared.stack}>
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
          <span className={shared.label}>Chọn phòng</span>
          <select className={shared.select} value={room} onChange={(e) => setRoom(e.target.value)}>
            <option value="">-- Chọn phòng --</option>
            {availableRooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <label className={shared.checkboxRow}>
          <input
            type="checkbox"
            checked={overridePrice}
            onChange={(e) => setOverridePrice(e.target.checked)}
          />
          Đổi loại giá
        </label>

        {overridePrice && (
          <div className={shared.field}>
            <select className={shared.select} value={ratePlan} onChange={(e) => setRatePlan(e.target.value)}>
              {ratePlans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

export default AssignRoomModal;
