import { useState } from "react";
import SlidePanelShell from "./SlidePanelShell";
import shared from "./shared.module.css";
import styles from "./CheckInModal.module.css";
import { formatCurrency } from "../../../utils/format";

const steps = ["Phòng", "Giấy tờ", "Đặt cọc", "Xác nhận"];
const dateText = (value) => value ? new Date(value).toLocaleDateString("en-CA") : "—";

function CheckInModal({ booking, onClose, onConfirm }) {
  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState({
    nationality: booking.identity?.nationality || booking.nationality || booking.guest?.flag || "VN",
    documentType: booking.identity?.documentType || booking.documentType || "CCCD",
    documentNumber: booking.identity?.documentNumber || booking.documentNumber || booking.idNumber || "",
    birthDate: booking.identity?.birthDate || booking.birthDate || "",
  });
  const [deposit, setDeposit] = useState(String(booking.deposit || ""));
  const [paymentMethod, setPaymentMethod] = useState(booking.paymentMethod || "Tiền mặt");
  const guestName = typeof booking.guest === "string" ? booking.guest : booking.guest?.name || "—";
  const nights = booking.checkIn && booking.checkOut ? Math.max(1, Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000)) : 1;
  const nightlyRate = booking.nightlyRate || booking.price || booking.roomPrice || 700000;
  const updateIdentity = (field, value) => setIdentity((current) => ({ ...current, [field]: value }));
  const canContinue = step !== 1 || identity.documentNumber.trim().length > 0;
  const rows = [
    ["Khách", guestName], ["Nguồn", booking.source || "—"], ["Phòng", booking.room || "Chưa phân phòng"],
    ["Check-in", dateText(booking.checkIn)], ["Check-out", dateText(booking.checkOut)],
    ["Số đêm", `${nights} đêm`], ["Giá/đêm", formatCurrency(nightlyRate)],
    ["Giấy tờ", `${identity.documentType} ${identity.documentNumber}`],
  ];

  return <SlidePanelShell width={380} onClose={onClose} header={<div><h2 className={styles.title}>Check-in</h2><div className={styles.subtitle}>{booking.bookingCode || booking.code} · {guestName}</div><div className={styles.steps}>{steps.map((label, index) => <span key={label} className={index === step ? styles.activeStep : index < step ? styles.doneStep : ""}>{label}</span>)}</div></div>} footer={<><button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={step === 0 ? onClose : () => setStep(step - 1)}>{step === 0 ? "Hủy" : "Quay lại"}</button><button type="button" className={`${shared.btn} ${shared.btnSuccess}`} disabled={!canContinue || !booking.room} onClick={() => step === 3 ? onConfirm({ identity, deposit: Number(deposit) || 0, paymentMethod }) : setStep(step + 1)}>{step === 3 ? "Xác nhận check-in" : "Tiếp theo"}</button></>}>
    {step === 0 && <section className={styles.section}><h3>PHÂN CÔNG PHÒNG</h3><div className={styles.roomCard}><div>Phòng đã xác nhận <strong>{booking.room || "Chưa phân phòng"}</strong></div><div>Check-in <strong>{dateText(booking.checkIn)}</strong></div><div>Check-out <strong>{dateText(booking.checkOut)}</strong></div><div>Số đêm <strong>{nights} đêm</strong></div></div></section>}
    {step === 1 && <section className={styles.section}><h3>GIẤY TỜ TÙY THÂN</h3><label className={shared.field}><span className={shared.label}>Quốc tịch</span><select className={shared.select} value={identity.nationality} onChange={(e) => updateIdentity("nationality", e.target.value)}><option value="VN">Việt Nam</option><option value="OTHER">Khác</option></select></label><label className={shared.field}><span className={shared.label}>Loại giấy tờ *</span><select className={shared.select} value={identity.documentType} onChange={(e) => updateIdentity("documentType", e.target.value)}><option>CCCD</option><option>Hộ chiếu</option><option>CMND</option></select></label><label className={shared.field}><span className={shared.label}>Số giấy tờ *</span><input className={shared.input} value={identity.documentNumber} onChange={(e) => updateIdentity("documentNumber", e.target.value)} placeholder="012345678901" /></label><label className={shared.field}><span className={shared.label}>Ngày sinh (tùy chọn)</span><input className={shared.input} type="date" value={identity.birthDate} onChange={(e) => updateIdentity("birthDate", e.target.value)} /></label></section>}
    {step === 2 && <section className={styles.section}><h3>ĐẶT CỌC</h3><label className={shared.field}><span className={shared.label}>Số tiền cọc (VND)</span><input className={shared.input} type="number" min="0" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="0 (bỏ qua nếu không cọc)" /></label><label className={shared.field}><span className={shared.label}>Hình thức thanh toán</span><select className={shared.select} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option>Tiền mặt</option><option>Chuyển khoản</option><option>Thẻ</option></select></label></section>}
    {step === 3 && <section className={styles.section}><h3>XÁC NHẬN CHECK-IN</h3><div className={styles.summary}>{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}{Number(deposit) > 0 && <div><span>Đặt cọc</span><strong>{formatCurrency(Number(deposit))} · {paymentMethod}</strong></div>}</div><p className={styles.hint}>Nhấn “Xác nhận” để check-in, mở folio và ghi nhận đặt cọc (nếu có).</p></section>}
  </SlidePanelShell>;
}

export default CheckInModal;
