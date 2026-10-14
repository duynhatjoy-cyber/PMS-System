import { useState } from "react";
import { NIGHTLY_RATE, ratePlans } from "../../../data/frontDeskData";
import { formatCurrency, formatDMYShort } from "../../../utils/format";
import styles from "./ChangePriceModal.module.css";

function ChangePriceModal({ booking, onClose, onSave }) {
  const nights = Math.max(1, Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000));
  const [plan, setPlan] = useState(booking.ratePlan || "Mặc định");
  const [rates, setRates] = useState(() => Array.from({ length: nights }, (_, index) => booking.nightlyRates?.[index] ?? NIGHTLY_RATE));
  const [percent, setPercent] = useState(booking.roomDiscountPercent || 0);
  const [amount, setAmount] = useState(booking.roomDiscountAmount || 0);
  const [waived, setWaived] = useState(Boolean(booking.roomFeeWaived));
  const base = rates.reduce((sum, rate) => sum + (Number(rate) || 0), 0);
  const total = waived ? 0 : Math.max(0, Math.round(base * (1 - Math.min(100, Number(percent) || 0) / 100) - (Number(amount) || 0)));

  return <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Đổi giá">
      <header><strong>Đổi giá</strong><div><b>{booking.roomType} {booking.room || ""}</b><span>{booking.guest?.name}</span></div></header>
      <div className={styles.content}>
        <div className={styles.left}>
          <select value={plan} onChange={(event) => setPlan(event.target.value)}>
            <option>Mặc định</option>
            {ratePlans.filter((item) => !item.startsWith("--")).map((item) => <option key={item}>{item}</option>)}
          </select>
          {rates.map((rate, index) => {
            const date = new Date(booking.checkIn);
            date.setDate(date.getDate() + index);
            return <label key={index}><span>{formatDMYShort(date)}</span><input type="number" min="0" value={rate} onChange={(event) => setRates((previous) => previous.map((value, i) => i === index ? event.target.value : value))} aria-label={`Giá ngày ${formatDMYShort(date)}`} /></label>;
          })}
          <div className={styles.total}><b>Tổng</b><b>{formatCurrency(total)}</b></div>
        </div>
        <div className={styles.right}>
          <div className={styles.discounts}>
            <label>Giảm giá (%)<input type="number" min="0" max="100" value={percent} onChange={(event) => setPercent(event.target.value)} /></label>
            <label>Giảm giá (số tiền)<input type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
          </div>
          <label className={styles.checkbox}><input type="checkbox" checked={waived} onChange={(event) => setWaived(event.target.checked)} /> Miễn phí tiền phòng</label>
          <p>Giảm giá % áp dụng cho tiền phòng trước khi trừ giảm giá số tiền.</p>
        </div>
      </div>
      <footer><button type="button" onClick={onClose}>Đóng</button><button type="button" onClick={() => onSave({ ratePlan: plan, nightlyRates: rates.map((rate) => Math.max(0, Number(rate) || 0)), roomDiscountPercent: Math.min(100, Math.max(0, Number(percent) || 0)), roomDiscountAmount: Math.max(0, Number(amount) || 0), roomFeeWaived: waived })}>Lưu</button></footer>
    </div>
  </div>;
}

export default ChangePriceModal;
