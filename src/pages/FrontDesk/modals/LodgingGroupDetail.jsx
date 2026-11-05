import { useState } from "react";
import { BedDouble, X } from "lucide-react";
import { computeBill } from "../../../utils/billing";
import { formatCurrency, formatDateTimeDMY } from "../../../utils/format";
import styles from "./LodgingGroupDetail.module.css";

function LodgingGroupDetail({ group, bookings, onClose, onOpenBooking }) {
  const [selectedId, setSelectedId] = useState("__group__");
  const [tab, setTab] = useState("room");
  if (!group) return null;
  const rows = bookings.filter((booking) => booking.groupId === group.id);
  const isGroupSelected = selectedId === "__group__";
  const selected = isGroupSelected ? null : rows.find((booking) => booking.id === selectedId) || rows[0];
  const bills = rows.map((booking) => ({ booking, bill: computeBill(booking) }));
  const total = bills.reduce((sum, { bill }) => sum + bill.grandTotal, 0);
  const paid = bills.reduce((sum, { bill }) => sum + bill.paid, 0);
  const selectedBill = selected && computeBill(selected);
  const payments = selected?.paymentRecords || [];
  return <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={styles.dialog} role="dialog" aria-modal="true" aria-label={`Chi tiết đoàn ${group.name}`}>
      <header className={styles.toolbar}><span>Áp dụng cho {rows.length} phòng</span><strong>{group.name}</strong><span>#{selected?.bookingCode || group.id}</span><span>Còn lại <b>{formatCurrency(total - paid)}</b></span><button type="button" onClick={onClose} aria-label="Đóng"><X size={17} /></button></header>
      <div className={styles.columns}>
        <aside className={styles.sidebar}>
          <button type="button" className={`${styles.sidebarTitle} ${isGroupSelected ? styles.groupSelected : ""}`} onClick={() => { setSelectedId("__group__"); setTab("room"); }}>Thông tin đoàn ({rows.length})</button>
          <h3>{group.name} ({rows.length})</h3>
          {rows.length === 0 && <p>Đoàn chưa có phòng đang hoạt động.</p>}
          {rows.map((booking) => <button key={booking.id} type="button" className={`${styles.roomItem} ${selected?.id === booking.id ? styles.selected : ""}`} aria-pressed={selected?.id === booking.id} onClick={() => { setSelectedId(booking.id); setTab("room"); }}><span><BedDouble size={16} /> {booking.room || "Chưa gán phòng"}</span><span>{booking.guest?.name || "Chưa có khách"}</span></button>)}
        </aside>
        <main className={styles.main}>
          <nav className={styles.tabs}><button type="button" className={tab === "room" ? styles.active : ""} onClick={() => setTab("room")}>Phòng</button><button type="button" className={tab === "payment" ? styles.active : ""} onClick={() => setTab("payment")}>Thanh toán</button></nav>
          {isGroupSelected ? tab === "room" ? <div className={styles.groupPanel}><h2>👥 Group: {group.leaderName || group.name}</h2><div className={styles.groupFields}><div className={styles.groupNote}>{group.notes || "Chưa có ghi chú đoàn"}</div><div className={styles.groupField}>Khách gọi điện: {group.contactName || group.leaderName || "—"}</div><div className={styles.groupField}>{group.source || "Direct"}</div>{group.company && <div className={styles.groupField}>{group.company}</div>}</div><div className={styles.breakfast}>Điều chỉnh ăn sáng</div></div> : <><div className={styles.tableHead}><span>Phòng / Thời gian ở</span><span>Thuế / phí</span><span>Tổng</span><span>Đã thanh toán</span></div>{bills.map(({ booking, bill }) => <button key={booking.id} type="button" className={styles.billRow} onClick={() => setSelectedId(booking.id)}><span><b>{booking.roomType} · {booking.room || "Chưa gán phòng"}</b><small>{formatDateTimeDMY(booking.checkIn)} – {formatDateTimeDMY(booking.checkOut)}</small></span><span>{bill.vat ? formatCurrency(bill.vat) : "—"}</span><span>{formatCurrency(bill.grandTotal)}</span><span>{formatCurrency(bill.paid)}</span></button>)}<div className={styles.total}><b>Tổng đoàn</b><b>{formatCurrency(total)}</b><b>{formatCurrency(paid)}</b></div></> : selected && (tab === "room" ? <div className={styles.roomPanel}>
            <h2><BedDouble size={18} /> {selected.roomType} {selected.room || "Chưa gán phòng"}</h2>
            <div className={styles.infoLine}>▦ &nbsp; {formatDateTimeDMY(selected.checkIn)} – {formatDateTimeDMY(selected.checkOut)}</div>
            <div className={styles.infoLine}>$ &nbsp; {selected.ratePlan || selected.source || "Giá phòng"}</div>
            <div className={styles.infoLine}>♟ &nbsp; {selected.adults || 0} người lớn, {selected.children || 0} trẻ em</div>
            <div className={styles.guestList}>{(selected.guests?.length ? selected.guests : [selected.guest]).filter(Boolean).map((guest, index) => <div key={guest.id || index}>🇻🇳 &nbsp; {guest.name}</div>)}</div>
            <div className={styles.note}>{selected.notes || "Chưa có ghi chú"}</div>
          </div> : <div className={styles.paymentPanel}>
            <h2>{selected.roomType} {selected.room || "Chưa gán phòng"}<b>{formatCurrency(selectedBill.grandTotal)} VND</b></h2>
            <div className={styles.sectionTitle}>Tiền phòng</div>
            {selectedBill.roomLines.map((line, index) => <div className={styles.line} key={index}><span>{line.label}</span><b>{formatCurrency(line.amount)}</b></div>)}
            <div className={styles.sectionTitle}>Dịch vụ</div>
            {selectedBill.serviceLines.length ? selectedBill.serviceLines.map((line, index) => <div className={styles.line} key={index}><span>{line.label}</span><b>{formatCurrency(line.amount)}</b></div>) : <div className={styles.line}><span>Chưa có dịch vụ</span><b>0</b></div>}
            {(selected.roomDiscountAmount || selected.roomDiscountPercent) && <div className={styles.line}><span>Chiết khấu</span><b>{selected.roomDiscountPercent ? `${selected.roomDiscountPercent}%` : formatCurrency(selected.roomDiscountAmount)}</b></div>}
            <div className={styles.sectionTitle}>Thuế / Phí</div><div className={styles.line}><span>VAT</span><b>{formatCurrency(selectedBill.vat)}</b></div>
            <div className={styles.sumLine}><span>Cần thanh toán</span><b>{formatCurrency(selectedBill.grandTotal)}</b></div>
            <div className={styles.sumLine}><span>Đã thanh toán</span><b>{formatCurrency(selectedBill.paid)}</b></div>
            <div className={styles.sumLine}><span>Còn lại</span><b>{formatCurrency(selectedBill.remaining)}</b></div>
          </div>)}
        </main>
        <aside className={styles.details}>{selected ? <>{tab === "room" ? <><h3>Dịch vụ Tổng (VND): {formatCurrency(selectedBill.serviceTotal)}</h3>{selected.services?.length ? selected.services.map((service, index) => <div className={styles.payment} key={index}><span>{service.name}<small>{service.range || ""}</small></span><b>{formatCurrency(service.price * (service.qty || 1))}</b></div>) : <p>Chưa có dịch vụ</p>}</> : <><h3>Danh sách đã thanh toán</h3>{payments.length ? payments.map((p) => <div className={styles.payment} key={p.id}><span>{selected.room} · {p.method}<small>{formatDateTimeDMY(p.date)}</small></span><b>+ {formatCurrency(p.amount)}</b></div>) : <p>Chưa có thanh toán</p>}</>}{onOpenBooking && <button type="button" className={styles.openBooking} onClick={() => onOpenBooking(selected)}>Xem chi tiết đặt phòng</button>}</> : null}</aside>
      </div>
    </section>
  </div>;
}

export default LodgingGroupDetail;
