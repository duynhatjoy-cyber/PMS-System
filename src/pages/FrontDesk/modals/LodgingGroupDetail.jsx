import SlidePanelShell from "./SlidePanelShell";
import { computeBill } from "../../../utils/billing";
import { formatCurrency, formatDateTimeDMY } from "../../../utils/format";
import styles from "./LodgingGroupDetail.module.css";

function LodgingGroupDetail({ group, bookings, onClose, onOpenBooking }) {
  if (!group) return null;
  const rows = bookings.filter((booking) => booking.groupId === group.id);
  const totals = rows.reduce((acc, booking) => {
    const bill = computeBill(booking);
    acc.room += bill.roomTotal;
    acc.service += bill.serviceTotal;
    acc.paid += bill.paid;
    return acc;
  }, { room: 0, service: 0, paid: 0 });
  return (
    <SlidePanelShell title={`Chi tiết đoàn · ${group.name}`} onClose={onClose} width={720}>
      <div className={styles.content}>
        <div className={styles.summary}>
          <div><span>Người đại diện</span><strong>{group.leaderName}</strong></div>
          <div><span>Số phòng</span><strong>{rows.length}</strong></div>
          <div><span>Tiền phòng</span><strong>{formatCurrency(totals.room)}</strong></div>
          <div><span>Dịch vụ</span><strong>{formatCurrency(totals.service)}</strong></div>
          <div><span>Đã thanh toán</span><strong>{formatCurrency(totals.paid)}</strong></div>
          <div><span>Còn lại</span><strong>{formatCurrency(totals.room + totals.service - totals.paid)}</strong></div>
        </div>
        <h3>Phòng trong đoàn</h3>
        {rows.length === 0 ? <p>Đoàn chưa có phòng đang hoạt động.</p> : rows.map((booking) => {
          const bill = computeBill(booking);
          return <button key={booking.id} type="button" className={styles.room} onClick={() => onOpenBooking?.(booking)}>
            <span><strong>{booking.room || "Chưa gán phòng"}</strong> · {booking.roomType}</span>
            <span>#{booking.bookingCode} · {booking.guest.name}</span>
            <small>{formatDateTimeDMY(booking.checkIn)} – {formatDateTimeDMY(booking.checkOut)}</small>
            <small>{booking.stage === "inhouse" ? "Đang ở" : booking.stage === "arrival" ? "Sẽ đến" : "Đã đi"} · Còn lại {formatCurrency(bill.remaining)}</small>
          </button>;
        })}
      </div>
    </SlidePanelShell>
  );
}

export default LodgingGroupDetail;
