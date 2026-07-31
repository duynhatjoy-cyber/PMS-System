import { useState } from "react";
import {
  X,
  Mail,
  Plus,
  Users,
  CalendarClock,
  DollarSign,
  BedDouble,
  ClipboardList,
  History,
  Eye,
  LogOut,
  MoreHorizontal,
  IdCard,
  ChevronDown,
  ChevronRight,
  Printer,
} from "lucide-react";
import IconPopup from "../components/IconPopup";
import ConfirmDialog from "../../../components/ConfirmDialog";
import RoomTaskModal from "../modals/RoomTaskModal";
import UserActivityModal from "../modals/UserActivityModal";
import { computeBill } from "../../../utils/billing";
import { formatCurrency, formatDateTimeDMY } from "../../../utils/format";
import styles from "./BookingDetailPanel.module.css";

const PRINT_MENU_ITEMS = [
  { key: "invoice", label: "Xem/in hóa đơn" },
  { key: "now", label: "Thời điểm hiện tại" },
  { key: "checkout", label: "Thời điểm trả phòng" },
];

const PAYMENT_METHODS = ["Tiền mặt", "Thẻ tín dụng", "Chuyển khoản NH", "Công nợ"];

function BookingDetailPanel({
  booking,
  tab,
  onClose,
  onPrimaryAction,
  onAddServiceClick,
  onPrintOption,
  onOpenChangeDate,
  onOpenAssignRoom,
  onUndoCheckIn,
  onCheckout,
  onOpenEditGuest,
  onRemoveGuest,
  onRecordPayment,
  onToast,
  initialTab = "room",
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [note, setNote] = useState(booking.notes || "");
  const [tags, setTags] = useState(["Traveloka", "OTA", "Central Hotel"]);
  const [removeGuestTarget, setRemoveGuestTarget] = useState(null);
  const [showActivity, setShowActivity] = useState(false);
  const [showTask, setShowTask] = useState(false);

  const [payAsOf, setPayAsOf] = useState("now");
  const [discount, setDiscount] = useState(0);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [serviceExpanded, setServiceExpanded] = useState(true);
  const [paymentMode, setPaymentMode] = useState("pay");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [paymentNote, setPaymentNote] = useState("");
  const [amount, setAmount] = useState(0);

  const bill = computeBill(booking, { asOf: payAsOf, discount, vatEnabled });

  const [prevRemaining, setPrevRemaining] = useState(bill.remaining);
  if (bill.remaining !== prevRemaining) {
    setPrevRemaining(bill.remaining);
    setAmount(Math.max(0, bill.remaining));
  }

  const headBill = computeBill(booking, { asOf: "checkout" });

  const primaryLabel =
    tab === "arrivals" && !booking.assigned
      ? "Gán phòng"
      : tab === "arrivals"
      ? "Nhận phòng"
      : booking.stage === "inhouse"
      ? "Trả phòng"
      : null;

  const primaryHandler =
    tab === "arrivals"
      ? onPrimaryAction
      : primaryLabel === "Trả phòng" && activeTab !== "payment"
      ? () => setActiveTab("payment")
      : () => onCheckout(booking);

  const primaryClass =
    primaryLabel === "Trả phòng"
      ? styles.primaryBtnCheckout
      : primaryLabel === "Nhận phòng"
      ? styles.primaryBtnCheckin
      : styles.primaryBtnAssign;

  function handleRecordPayment() {
    if (amount <= 0) return;
    onRecordPayment(booking, { amount, method: paymentMethod, note: paymentNote });
    setPaymentNote("");
  }

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={styles.panel}>
        <div className={styles.topBar}>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "room" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("room")}
            >
              Phòng
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "payment" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("payment")}
            >
              Thanh toán
            </button>
          </div>

          <div className={styles.topActions}>
            <span className={styles.balance}>
              #{booking.bookingCode} · Còn lại {formatCurrency(headBill.remaining)}
            </span>

            <div className={styles.topDivider} />

            <IconPopup
              icon={ClipboardList}
              title="Danh sách đặt phòng"
              align="left"
            >
              <div className={styles.bookingInfoCard}>
                <div className={styles.bookingInfoTitle}>Mã đặt phòng: {booking.bookingCode}</div>
                <div>Khách hàng: {booking.guest.name}</div>
                <div>Sẽ đến: {formatDateTimeDMY(booking.checkIn)}</div>
                <div>Sẽ đi: {formatDateTimeDMY(booking.checkOut)}</div>
                <div>Ghi chú: {booking.notes || "—"}</div>
              </div>
            </IconPopup>

            <button type="button" className={styles.iconBtn} title="Gửi email">
              <Mail size={16} />
            </button>
            <IconPopup
              icon={Printer}
              title="In"
              items={PRINT_MENU_ITEMS.map((item) => ({
                ...item,
                onClick: () => onPrintOption(booking, item.key),
              }))}
            />
            <button type="button" className={styles.iconBtn} title="Việc cần làm" onClick={() => setShowTask(true)}>
              <History size={16} />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              title="Thao tác người dùng"
              onClick={() => setShowActivity(true)}
            >
              <Eye size={16} />
            </button>

            <div className={styles.topDivider} />

            <IconPopup
              icon={Plus}
              title="Thêm phòng / Gộp phòng"
              filled
              items={[
                { key: "add", label: "Thêm phòng", onClick: () => onToast("Tính năng thêm phòng sẽ sớm ra mắt") },
                { key: "merge", label: "Gộp phòng", onClick: () => onToast("Tính năng gộp phòng sẽ sớm ra mắt") },
              ]}
            />
          </div>
        </div>

        {activeTab === "room" ? (
          <div className={styles.body}>
            <div className={styles.col}>
              <div className={styles.roomHead}>
                <div className={styles.roomTitle}>
                  <BedDouble size={16} />
                  <span className={styles.roomName}>
                    {booking.roomType} {booking.room || ""}
                  </span>
                  <IconPopup
                    icon={MoreHorizontal}
                    title="Thao tác phòng"
                    items={[
                      { key: "transfer", label: "Chuyển phòng", onClick: () => onOpenAssignRoom(booking) },
                      ...(booking.stage === "inhouse"
                        ? [{ key: "undo", label: "Undo check-in", onClick: () => onUndoCheckIn(booking) }]
                        : []),
                    ]}
                  />
                </div>
                {primaryLabel && (
                  <button type="button" className={primaryClass} onClick={primaryHandler}>
                    {primaryLabel === "Trả phòng" && <LogOut size={13} />}
                    {primaryLabel}
                  </button>
                )}
              </div>

              <button type="button" className={styles.metaRowBtn} onClick={() => onOpenChangeDate(booking)}>
                <CalendarClock size={15} />
                <span>
                  {formatDateTimeDMY(booking.checkIn)} - {formatDateTimeDMY(booking.checkOut)}
                </span>
              </button>

              <div className={styles.metaRow}>
                <DollarSign size={15} />
                <span>
                  OFF (CN-T6) (Tổng: {formatCurrency(headBill.roomTotal)})
                </span>
              </div>

              <div className={styles.guestCountRow}>
                <Users size={15} />
                <span>
                  {booking.adults} người lớn, {booking.children} trẻ em
                </span>
                <button
                  type="button"
                  className={styles.addGuestBtn}
                  onClick={() => onOpenEditGuest(booking)}
                  title="Thêm khách"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className={styles.guestList}>
                {(booking.guests || []).map((g) => (
                  <div key={g.id} className={styles.guestRow}>
                    <span className={styles.flag}>{g.flag}</span>
                    <span className={styles.guestName}>
                      {g.name}
                    </span>
                    <button
                      type="button"
                      className={styles.guestIconBtn}
                      onClick={() => onOpenEditGuest(booking, g.id)}
                      title="Sửa khách"
                    >
                      <IdCard size={14} />
                    </button>
                    <button
                      type="button"
                      className={styles.guestRemoveBtn}
                      onClick={() => setRemoveGuestTarget(g)}
                      title="Xoá khách"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.col}>
              <div className={styles.fieldLabel}>Ghi chú</div>
              <textarea
                className={styles.noteBox}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú đặt phòng"
              />

              <div className={styles.tagRow}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>

              <div className={styles.bookingId}>Booking ID: {booking.bookingCode}</div>

              <button type="button" className={styles.saveBtn}>
                Lưu
              </button>
            </div>

            <div className={styles.col}>
              <div className={styles.serviceHead}>
                <span>Dịch vụ</span>
                <button type="button" className={styles.addServiceBtn} onClick={onAddServiceClick}>
                  Thêm dịch vụ
                </button>
              </div>
              <div className={styles.serviceTotalLine}>Tổng (VND): {formatCurrency(headBill.serviceTotal)}</div>

              {booking.services.length === 0 ? (
                <div className={styles.serviceEmpty}>Chưa có dịch vụ phát sinh</div>
              ) : (
                <div className={styles.serviceList}>
                  {booking.services.map((s, i) => (
                    <div key={i} className={styles.serviceItem}>
                      <span>{s.name}</span>
                      <span className={styles.muted}>{s.range}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.paymentLayout}>
            <div className={styles.paymentMain}>
              <div className={styles.asOfTabs}>
                <button
                  type="button"
                  className={`${styles.asOfTab} ${payAsOf === "now" ? styles.asOfTabActive : ""}`}
                  onClick={() => setPayAsOf("now")}
                >
                  Đến hiện tại
                </button>
                <button
                  type="button"
                  className={`${styles.asOfTab} ${payAsOf === "checkout" ? styles.asOfTabActive : ""}`}
                  onClick={() => setPayAsOf("checkout")}
                >
                  Đến khi trả phòng
                </button>
              </div>

              <div className={styles.invoiceHead}>
                <span>Hóa đơn</span>
                <strong>{formatCurrency(bill.grandTotal)}</strong>
              </div>

              <div className={styles.billSection}>
                <div className={styles.billSectionTitle}>Tiền phòng</div>
                {bill.roomLines.map((l, i) => (
                  <div key={i} className={styles.billRow}>
                    <span>{l.label}</span>
                    <span>{formatCurrency(l.amount)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.billSection}>
                <div className={styles.billSectionHeadRow}>
                  <button
                    type="button"
                    className={styles.billSectionToggle}
                    onClick={() => setServiceExpanded((v) => !v)}
                  >
                    {serviceExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Dịch vụ
                  </button>
                  <button
                    type="button"
                    className={styles.billAddServiceBtn}
                    onClick={onAddServiceClick}
                    title="Thêm dịch vụ"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {serviceExpanded &&
                  bill.serviceLines.map((l, i) => (
                    <div key={i} className={styles.billRow}>
                      <span>{l.label}</span>
                      <span>{formatCurrency(l.amount)}</span>
                    </div>
                  ))}
              </div>

              <div className={styles.billRow}>
                {editingDiscount ? (
                  <input
                    type="number"
                    autoFocus
                    className={styles.discountInput}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    onBlur={() => setEditingDiscount(false)}
                  />
                ) : (
                  <button type="button" className={styles.linkBtn} onClick={() => setEditingDiscount(true)}>
                    Chiết khấu
                  </button>
                )}
                <span className={`${styles.discountAmount} ${discount > 0 ? styles.discountAmountActive : ""}`}>
                  {formatCurrency(discount)}
                </span>
              </div>

              <label className={styles.vatRow}>
                <input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} />
                <span>Thuế/Phí</span>
                <span className={styles.vatLabel}>VAT (8%)</span>
              </label>

              <div className={styles.billSummary}>
                <div className={styles.billRow}>
                  <span>Cần thanh toán</span>
                  <strong>{formatCurrency(bill.grandTotal)}</strong>
                </div>
                <div className={styles.billRow}>
                  <span>Đã thanh toán</span>
                  <strong>{formatCurrency(bill.paid)}</strong>
                </div>
                <div className={`${styles.billRow} ${styles.billRowTotal}`}>
                  <span>Còn lại</span>
                  <strong>{formatCurrency(bill.remaining)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.paymentSide}>
              {primaryLabel && (
                <button type="button" className={primaryClass} onClick={primaryHandler} style={{ alignSelf: "flex-end" }}>
                  {primaryLabel === "Trả phòng" && <LogOut size={13} />}
                  {primaryLabel}
                </button>
              )}

              <div className={styles.modeRow}>
                {[
                  { id: "pay", label: "Thanh toán" },
                  { id: "refund", label: "Hoàn tiền" },
                  { id: "qr", label: "QR Code" },
                ].map((opt) => (
                  <label key={opt.id} className={styles.radioLabel}>
                    <input
                      type="radio"
                      checked={paymentMode === opt.id}
                      onChange={() => setPaymentMode(opt.id)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <div className={styles.payFieldsRow}>
                <div className={styles.payField}>
                  <span className={styles.payLabel}>Hình thức TT</span>
                  <select
                    className={styles.paySelect}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.payField}>
                  <span className={styles.payLabel}>Tiền Tệ</span>
                  <select className={styles.paySelect} value="VND" disabled>
                    <option>VND</option>
                  </select>
                </div>
                <div className={styles.payField}>
                  <span className={styles.payLabel}>Số tiền</span>
                  <input
                    type="number"
                    className={styles.payInput}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <input
                type="text"
                className={styles.payNoteInput}
                placeholder="Note"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />

              <button
                type="button"
                className={styles.payBtn}
                disabled={amount <= 0}
                onClick={handleRecordPayment}
              >
                <DollarSign size={15} /> Thanh toán
              </button>

              <div className={styles.paidHistory}>
                <div className={styles.paidHistoryTitle}>Đã thanh toán</div>
                {(booking.paymentRecords || []).length === 0 ? (
                  <div className={styles.paidEmpty}>Chưa có thanh toán nào</div>
                ) : (
                  (booking.paymentRecords || [])
                    .slice()
                    .reverse()
                    .map((p) => (
                      <div key={p.id} className={styles.paidRow}>
                        <span>{p.method}</span>
                        <span>{formatCurrency(p.amount)}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      {removeGuestTarget && (
        <ConfirmDialog
          title="Xoá khách"
          message={`Bạn có chắc muốn xoá khách "${removeGuestTarget.name}" khỏi đặt phòng này?`}
          confirmLabel="Xoá khách"
          danger
          onConfirm={() => {
            onRemoveGuest(booking, removeGuestTarget.id);
            setRemoveGuestTarget(null);
          }}
          onClose={() => setRemoveGuestTarget(null)}
        />
      )}
      {showActivity && <UserActivityModal booking={booking} onClose={() => setShowActivity(false)} />}
      {showTask && (
        <RoomTaskModal
          booking={booking}
          onClose={() => setShowTask(false)}
          onSave={() => {
            setShowTask(false);
            onToast("Đã lưu việc cần làm");
          }}
        />
      )}
    </div>
  );
}

export default BookingDetailPanel;
