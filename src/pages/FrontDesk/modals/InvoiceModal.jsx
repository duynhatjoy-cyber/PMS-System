import { useMemo, useState } from "react";
import {
  X,
  RotateCcw,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Printer,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDMY, formatDateTimeDMY, startOfDay, addDays } from "../../../utils/format";
import { NIGHTLY_RATE } from "../../../data/frontDeskData";
import styles from "./InvoiceModal.module.css";

const HOTEL = {
  name: "Nhà Của My Hotel",
  address: "12 Đường Bãi Sau, Phường Thắng Tam, TP. Vũng Tàu",
  email: "contact@nhacuamyhotel.vn",
  phone: "0254 3 522 866",
};

function buildNights(checkIn, effectiveEnd) {
  const nights = [];
  let cursor = startOfDay(checkIn);
  const endDay = startOfDay(effectiveEnd);
  while (cursor < endDay) {
    nights.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  if (nights.length === 0) nights.push(startOfDay(checkIn));
  return nights;
}

function InvoiceModal({ booking, asOfDefault = "checkout", onClose }) {
  const [asOf, setAsOf] = useState(asOfDefault);
  const [roomDisplay, setRoomDisplay] = useState("detail");
  const [serviceDisplay, setServiceDisplay] = useState("detail");
  const [groupDisplay, setGroupDisplay] = useState("all");
  const [currencyConv, setCurrencyConv] = useState("none");
  const [showPaymentList, setShowPaymentList] = useState(false);
  const [showExchangeRate, setShowExchangeRate] = useState(false);
  const [showInvoiceInfo, setShowInvoiceInfo] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [zoom, setZoom] = useState(100);

  const now = useMemo(() => new Date(), []);
  const effectiveEnd = asOf === "now" ? (now < booking.checkOut ? now : booking.checkOut) : booking.checkOut;

  const nights = useMemo(() => buildNights(booking.checkIn, effectiveEnd), [booking.checkIn, effectiveEnd]);

  const roomLines = useMemo(() => {
    if (roomDisplay === "summary") {
      return [{ label: `Tiền phòng (${nights.length} đêm)`, amount: nights.length * NIGHTLY_RATE }];
    }
    return nights.map((n) => ({ label: `Tiền phòng ${formatDMY(n)}`, amount: NIGHTLY_RATE }));
  }, [roomDisplay, nights]);

  const serviceLines = useMemo(() => {
    if (booking.services.length === 0) return [];
    if (serviceDisplay === "summary") {
      const total = booking.services.reduce((sum, s) => sum + s.price * (s.qty || 1), 0);
      return [{ label: "Dịch vụ", amount: total }];
    }
    return booking.services.map((s) => ({
      label: `${s.name}${s.qty > 1 ? ` x${s.qty}` : ""}`,
      amount: s.price * (s.qty || 1),
    }));
  }, [serviceDisplay, booking.services]);

  const roomTotal = roomLines.reduce((sum, l) => sum + l.amount, 0);
  const serviceTotal = serviceLines.reduce((sum, l) => sum + l.amount, 0);
  const grandTotal = roomTotal + serviceTotal;

  const paidAmount = booking.paid ? grandTotal : Math.round((grandTotal * 0.4) / 1000) * 1000;
  const remaining = grandTotal - paidAmount;

  const paymentList = paidAmount > 0 ? [{ date: booking.checkIn, cashier: "Lễ Tân", method: "Tiền mặt", amount: paidAmount }] : [];

  function handlePrint() {
    window.print();
  }

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.card}>
        <div className={styles.headBar}>
          <span className={styles.headTitle}>In hóa đơn</span>
          <div className={styles.headRight}>
            <Eye size={16} />
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={asOf === "now"}
                onChange={(e) => setAsOf(e.target.checked ? "now" : "checkout")}
              />
              <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb} />
              </span>
              Tính đến thời điểm hiện tại
            </label>
            <button type="button" className={styles.headCloseBtn} onClick={onClose} aria-label="Đóng">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.toolbar}>
          <button type="button" className={styles.toolBtn} title="Làm mới">
            <RotateCcw size={15} />
          </button>
          <div className={styles.toolDivider} />
          <button type="button" className={styles.toolBtn} disabled title="Trang đầu">
            <ChevronsLeft size={15} />
          </button>
          <button type="button" className={styles.toolBtn} disabled title="Trang trước">
            <ChevronLeft size={15} />
          </button>
          <span className={styles.pageIndicator}>1 / 1</span>
          <button type="button" className={styles.toolBtn} disabled title="Trang sau">
            <ChevronRight size={15} />
          </button>
          <button type="button" className={styles.toolBtn} disabled title="Trang cuối">
            <ChevronsRight size={15} />
          </button>
          <div className={styles.toolDivider} />
          <button type="button" className={styles.toolBtnAccent} onClick={handlePrint} title="In">
            <Printer size={15} />
          </button>
          <div className={styles.toolDivider} />
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => setZoom((z) => Math.max(60, z - 10))}
            title="Thu nhỏ"
          >
            <ZoomOut size={15} />
          </button>
          <span className={styles.zoomLabel}>{zoom}%</span>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => setZoom((z) => Math.min(160, z + 10))}
            title="Phóng to"
          >
            <ZoomIn size={15} />
          </button>
          <div className={styles.toolDivider} />
          <button
            type="button"
            className={`${styles.toolBtnAccent} ${showSettings ? styles.toolBtnAccentOn : ""}`}
            onClick={() => setShowSettings((v) => !v)}
            title="Tùy chọn hiển thị"
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.docViewport}>
            <div className={styles.docPage} style={{ transform: `scale(${zoom / 100})` }}>
              <div className={styles.docHeader}>
                <div>
                  <div className={styles.hotelName}>{HOTEL.name}</div>
                  <div className={styles.hotelMeta}>Địa chỉ: {HOTEL.address}</div>
                  <div className={styles.hotelMeta}>
                    Email: {HOTEL.email} · ĐT: {HOTEL.phone}
                  </div>
                </div>
              </div>

              <div className={styles.docDivider} />

              <div className={styles.docBookingTitle}>
                Hóa đơn (#{booking.bookingCode}) - {booking.roomType} {booking.room || ""} - {booking.guest.name}
              </div>
              <div className={styles.docBookingMeta}>
                <span>Ngày vào: {formatDateTimeDMY(booking.checkIn)}</span>
                <span>Ngày ra: {formatDateTimeDMY(booking.checkOut)}</span>
              </div>
              <div className={styles.docBookingMeta}>
                <span>Mã đặt phòng: #{booking.bookingCode}</span>
                <span>Nguồn: {booking.source}</span>
              </div>

              <table className={styles.docTable}>
                <thead>
                  <tr>
                    <th>Nội dung</th>
                    <th className={styles.docAmountCol}>Tiền (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  {groupDisplay === "summary" ? (
                    <tr>
                      <td>Tổng cộng</td>
                      <td className={styles.docAmountCol}>{formatCurrency(grandTotal)}</td>
                    </tr>
                  ) : groupDisplay === "detail" ? (
                    <>
                      {roomLines.map((l, i) => (
                        <tr key={`r${i}`}>
                          <td>{l.label}</td>
                          <td className={styles.docAmountCol}>{formatCurrency(l.amount)}</td>
                        </tr>
                      ))}
                      {serviceLines.map((l, i) => (
                        <tr key={`s${i}`}>
                          <td>{l.label}</td>
                          <td className={styles.docAmountCol}>{formatCurrency(l.amount)}</td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <>
                      <tr>
                        <td className={styles.docSectionRow}>Tiền phòng</td>
                        <td className={styles.docAmountCol} />
                      </tr>
                      {roomLines.map((l, i) => (
                        <tr key={`r${i}`}>
                          <td className={styles.docIndent}>{l.label}</td>
                          <td className={styles.docAmountCol}>{formatCurrency(l.amount)}</td>
                        </tr>
                      ))}
                      {serviceLines.length > 0 && (
                        <tr>
                          <td className={styles.docSectionRow}>Dịch vụ</td>
                          <td className={styles.docAmountCol} />
                        </tr>
                      )}
                      {serviceLines.map((l, i) => (
                        <tr key={`s${i}`}>
                          <td className={styles.docIndent}>{l.label}</td>
                          <td className={styles.docAmountCol}>{formatCurrency(l.amount)}</td>
                        </tr>
                      ))}
                    </>
                  )}

                  <tr className={styles.docSummaryRow}>
                    <td>Cần thanh toán</td>
                    <td className={styles.docAmountCol}>{formatCurrency(grandTotal)}</td>
                  </tr>
                  <tr className={styles.docSummaryRow}>
                    <td>Đã thanh toán</td>
                    <td className={styles.docAmountCol}>{formatCurrency(paidAmount)}</td>
                  </tr>
                  <tr className={`${styles.docSummaryRow} ${styles.docSummaryTotal}`}>
                    <td>Còn lại</td>
                    <td className={styles.docAmountCol}>{formatCurrency(remaining)}</td>
                  </tr>
                </tbody>
              </table>

              {showExchangeRate && <div className={styles.exchangeLine}>Tỷ giá: 1 USD = 25.400 VND</div>}

              <div className={styles.docReceiptTitle}>Biên lai</div>
              <table className={styles.docTable}>
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Hình thức TT</th>
                    <th>Mô tả</th>
                    <th className={styles.docAmountCol}>Tiền (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  {!showPaymentList || paymentList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.docEmptyRow}>
                        {showPaymentList ? "Chưa có thanh toán nào" : "—"}
                      </td>
                    </tr>
                  ) : (
                    paymentList.map((p, i) => (
                      <tr key={i}>
                        <td>{p.cashier}</td>
                        <td>{p.method}</td>
                        <td>Thanh toán ngày {formatDMY(p.date)}</td>
                        <td className={styles.docAmountCol}>{formatCurrency(p.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {showInvoiceInfo && (
                <div className={styles.docFooter}>
                  <span>
                    Người in: thang.nguyen@lifrooms.com · Ngày in: {formatDMY(now)} {now.getHours()}:{String(now.getMinutes()).padStart(2, "0")}
                  </span>
                  <span>Powered by Bellhop PMS · 1/1</span>
                  <span className={styles.vatLine}>*VAT: 8%</span>
                </div>
              )}
            </div>
          </div>

          {showSettings && (
            <div className={styles.settingsPanel}>
              <div className={styles.settingField}>
                <span className={styles.settingLabel}>Hiển thị tiền phòng</span>
                <select
                  className={styles.settingSelect}
                  value={roomDisplay}
                  onChange={(e) => setRoomDisplay(e.target.value)}
                >
                  <option value="summary">Tổng hợp</option>
                  <option value="detail">Chi tiết</option>
                </select>
              </div>

              <div className={styles.settingField}>
                <span className={styles.settingLabel}>Hiển thị tiền dịch vụ</span>
                <select
                  className={styles.settingSelect}
                  value={serviceDisplay}
                  onChange={(e) => setServiceDisplay(e.target.value)}
                >
                  <option value="summary">Tổng hợp</option>
                  <option value="detail">Chi tiết</option>
                </select>
              </div>

              <div className={styles.settingField}>
                <span className={styles.settingLabel}>Hiển thị theo nhóm</span>
                <select
                  className={styles.settingSelect}
                  value={groupDisplay}
                  onChange={(e) => setGroupDisplay(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="summary">Tổng hợp</option>
                  <option value="detail">Chi tiết</option>
                </select>
              </div>

              <div className={styles.settingField}>
                <span className={styles.settingLabel}>Quy đổi</span>
                <select
                  className={styles.settingSelect}
                  value={currencyConv}
                  onChange={(e) => setCurrencyConv(e.target.value)}
                >
                  <option value="none">Bỏ chọn</option>
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                </select>
              </div>

              <label className={styles.settingCheckbox}>
                <input
                  type="checkbox"
                  checked={showPaymentList}
                  onChange={(e) => setShowPaymentList(e.target.checked)}
                />
                Danh sách đã thanh toán
              </label>

              <label className={styles.settingCheckbox}>
                <input
                  type="checkbox"
                  checked={showExchangeRate}
                  onChange={(e) => setShowExchangeRate(e.target.checked)}
                />
                Hiển thị tỷ giá
              </label>

              <label className={styles.settingCheckbox}>
                <input
                  type="checkbox"
                  checked={showInvoiceInfo}
                  onChange={(e) => setShowInvoiceInfo(e.target.checked)}
                />
                Hiển thị thông tin hoá đơn
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceModal;
