import { Baby, ChevronRight, User } from "lucide-react";
import { formatCurrency, formatDateTimeDMY } from "../../../utils/format";
import shared from "../../FrontDesk/modals/shared.module.css";
import styles from "../CreateBooking.module.css";

function BookingCartPanel({
  checkIn,
  checkOut,
  nights,
  cartLines,
  availabilityByType,
  rateForType,
  onUpdateLine,
  subtotal,
  tax,
  total,
  remaining,
  taxEnabled,
  onTaxEnabledChange,
  paymentMethod,
  onPaymentMethodChange,
  amountPaid,
  onAmountPaidChange,
  paymentMethods,
  onContinue,
}) {
  const totalAdults = cartLines.reduce((sum, l) => sum + l.adults, 0);
  const totalChildren = cartLines.reduce((sum, l) => sum + l.children, 0);

  function roomOptionsFor(line) {
    const availableRooms = availabilityByType[line.typeKey].availableRooms;
    const usedByOthers = new Set(
      cartLines.filter((l) => l.id !== line.id && l.typeKey === line.typeKey && l.roomNumber).map((l) => l.roomNumber)
    );
    return availableRooms.filter((r) => !usedByOthers.has(r.number));
  }

  return (
    <div className={styles.cartPanel}>
      <button type="button" className={`${shared.btn} ${shared.btnPrimary} ${styles.continueBtn}`} onClick={onContinue}>
        Tiếp tục <ChevronRight size={16} />
      </button>

      <div className={styles.cartSummaryLine}>
        {formatDateTimeDMY(checkIn)} - {formatDateTimeDMY(checkOut)} <strong>{nights} đêm</strong>
      </div>

      <div className={styles.cartLines}>
        {cartLines.map((line) => (
          <div key={line.id} className={styles.cartLine}>
            <div className={styles.cartLineHead}>
              <span className={styles.cartLineType}>{line.typeKey}</span>
              <select
                className={shared.select}
                value={line.roomNumber ?? ""}
                onChange={(e) => onUpdateLine(line.id, { roomNumber: e.target.value || null })}
              >
                <option value="">Chọn phòng</option>
                {roomOptionsFor(line).map((r) => (
                  <option key={r.number} value={r.number}>
                    {r.number}
                  </option>
                ))}
              </select>
              <span className={styles.cartLinePrice}>{formatCurrency(rateForType(line.typeKey) * nights)}</span>
            </div>
            <div className={styles.guestRow}>
              <label className={styles.guestInput}>
                <User size={13} />
                <input
                  type="number"
                  min={0}
                  className={shared.input}
                  value={line.adults}
                  onChange={(e) => onUpdateLine(line.id, { adults: Math.max(0, Number(e.target.value)) })}
                />
              </label>
              <label className={styles.guestInput}>
                <Baby size={13} />
                <input
                  type="number"
                  min={0}
                  className={shared.input}
                  value={line.children}
                  onChange={(e) => onUpdateLine(line.id, { children: Math.max(0, Number(e.target.value)) })}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cartTotalsRow}>
        <span>
          <User size={13} /> {totalAdults} <Baby size={13} /> {totalChildren}
        </span>
        <span>{cartLines.length} Phòng</span>
      </div>

      <div className={styles.cartMoneyRow}>
        <span>Thành tiền</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <label className={styles.cartMoneyRow}>
        <span className={styles.taxLabel}>
          <input type="checkbox" checked={taxEnabled} onChange={(e) => onTaxEnabledChange(e.target.checked)} /> Thuế/Phí
        </span>
        <span>{formatCurrency(tax)}</span>
      </label>
      <div className={`${styles.cartMoneyRow} ${styles.cartTotalRow}`}>
        <span>Tổng tiền</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <div className={styles.paymentSection}>
        <div className={styles.paymentLabel}>Thanh toán</div>
        <div className={styles.paymentRow}>
          <span className={styles.currencyStatic}>VND</span>
          <select className={shared.select} value={paymentMethod} onChange={(e) => onPaymentMethodChange(e.target.value)}>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            className={`${shared.input} ${styles.amountInput}`}
            value={amountPaid}
            onChange={(e) => onAmountPaidChange(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className={`${styles.cartMoneyRow} ${remaining > 0 ? styles.remainingDue : styles.remainingOk}`}>
        <span>Còn lại</span>
        <span>{formatCurrency(Math.max(0, remaining))}</span>
      </div>
    </div>
  );
}

export default BookingCartPanel;
