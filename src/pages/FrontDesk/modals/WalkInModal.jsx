import { useState } from "react";
import { Check, Minus, Plus, Search } from "lucide-react";
import ModalShell from "./ModalShell";
import { roomTypes, ratePlans, bookingSources, guestDirectory } from "../../../data/frontDeskData";
import { formatCurrency, formatDMY, formatDateTimeDMY, toLocalInputValue } from "../../../utils/format";
import shared from "./shared.module.css";
import styles from "./WalkInModal.module.css";

const STEPS = ["Ngày & Khách", "Chọn phòng", "Thông tin", "Xác nhận"];

const STAY_TYPES = [
  { id: "night", label: "Theo đêm", unit: "đêm" },
  { id: "day", label: "Theo ngày", unit: "ngày" },
  { id: "hour", label: "Theo giờ", unit: "giờ" },
];

function toDateTimeInputValue(date, hh, mm) {
  return toLocalInputValue(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm));
}

function toDateOnly(dateTimeValue) {
  return dateTimeValue ? dateTimeValue.slice(0, 10) : "";
}

function StepIndicator({ step }) {
  return (
    <div className={styles.steps}>
      {STEPS.map((label, index) => {
        const state = index < step ? "done" : index === step ? "current" : "upcoming";
        return (
          <div key={label} className={styles.stepItem}>
            <span className={`${styles.stepDot} ${styles[state]}`}>
              {state === "done" ? <Check size={12} /> : index + 1}
            </span>
            <span className={`${styles.stepLabel} ${styles[state]}`}>{label}</span>
            {index < STEPS.length - 1 && <span className={styles.stepLine} />}
          </div>
        );
      })}
    </div>
  );
}

function WalkInModal({ defaultCheckIn, onClose, onConfirm }) {
  const [step, setStep] = useState(0);
  const [stayType, setStayType] = useState("night");
  const [checkIn, setCheckIn] = useState(toDateTimeInputValue(defaultCheckIn, 14, 0));
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [roomTypeId, setRoomTypeId] = useState(null);
  const [ratePlan, setRatePlan] = useState(ratePlans[0]);
  const [source, setSource] = useState(bookingSources[0]);

  const [guestQuery, setGuestQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const checkInDate = checkIn ? new Date(checkIn) : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;
  const nights = checkInDate && checkOutDate ? Math.max(1, Math.round((checkOutDate - checkInDate) / 86400000)) : 1;

  const stayUnit = STAY_TYPES.find((t) => t.id === stayType).unit;
  const duration =
    checkInDate && checkOutDate && checkOutDate > checkInDate
      ? stayType === "hour"
        ? Math.max(1, Math.round((checkOutDate - checkInDate) / 3600000))
        : nights
      : null;

  const selectedRoomType = roomTypes.find((rt) => rt.id === roomTypeId);
  const total = selectedRoomType ? selectedRoomType.price * nights : 0;

  const canGoStep1 = Boolean(checkIn && checkOut && checkOutDate > checkInDate);
  const canGoStep2 = Boolean(roomTypeId);
  const canGoStep3 = Boolean(selectedGuest) || (creatingNew && firstName.trim().length > 0 && lastName.trim().length > 0);

  const guestMatches = guestQuery.trim()
    ? guestDirectory.filter((g) => {
        const q = guestQuery.trim().toLowerCase();
        return g.name.toLowerCase().includes(q) || g.phone.includes(q);
      })
    : [];

  const finalGuestName = selectedGuest ? selectedGuest.name : `${lastName} ${firstName}`.trim();
  const finalGuestPhone = selectedGuest ? selectedGuest.phone : phone;

  function handleDateOnlyChange(rawValue, setter) {
    const timePart = setter === setCheckIn ? "14:00" : "12:00";
    setter(rawValue ? `${rawValue}T${timePart}` : "");
  }

  function pickExistingGuest(guest) {
    setSelectedGuest(guest);
    setGuestQuery("");
  }

  function resetGuestSelection() {
    setSelectedGuest(null);
    setCreatingNew(false);
  }

  function goNext() {
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function handleConfirm() {
    onConfirm({
      roomType: selectedRoomType,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      adults,
      children,
      ratePlan,
      source,
      guestName: finalGuestName,
      phone: finalGuestPhone,
      note,
      total,
    });
  }

  const footer = (() => {
    if (step === 0) {
      return (
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Huỷ
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            disabled={!canGoStep1}
            onClick={goNext}
          >
            Tìm phòng
          </button>
        </>
      );
    }
    if (step === 1) {
      return (
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={goBack}>
            Quay lại
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            disabled={!canGoStep2}
            onClick={goNext}
          >
            Tiếp theo
          </button>
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={goBack}>
            Quay lại
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            disabled={!canGoStep3}
            onClick={goNext}
          >
            Xem lại
          </button>
        </>
      );
    }
    return (
      <>
        <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={goBack}>
          Quay lại
        </button>
        <button type="button" className={`${shared.btn} ${shared.btnSuccess}`} onClick={handleConfirm}>
          Xác nhận đặt phòng
        </button>
      </>
    );
  })();

  return (
    <ModalShell
      header={
        <div>
          <h2 className={styles.title}>Đặt phòng mới</h2>
          <StepIndicator step={step} />
        </div>
      }
      onClose={onClose}
      width={560}
      footer={footer}
    >
      {step === 0 && (
        <div className={styles.stepBody}>
          <div className={shared.field}>
            <span className={shared.label}>Hình thức lưu trú</span>
            <div className={styles.segmented}>
              {STAY_TYPES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.segmentBtn} ${stayType === opt.id ? styles.segmentActive : ""}`}
                  onClick={() => setStayType(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {stayType === "hour" ? (
            <div className={shared.row}>
              <div className={shared.field}>
                <span className={shared.label}>Check-in *</span>
                <input
                  type="datetime-local"
                  className={shared.input}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Check-out *</span>
                <input
                  type="datetime-local"
                  className={shared.input}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className={shared.row}>
              <div className={shared.field}>
                <span className={shared.label}>Check-in *</span>
                <input
                  type="date"
                  className={shared.input}
                  value={toDateOnly(checkIn)}
                  onChange={(e) => handleDateOnlyChange(e.target.value, setCheckIn)}
                />
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Check-out *</span>
                <input
                  type="date"
                  className={shared.input}
                  value={toDateOnly(checkOut)}
                  onChange={(e) => handleDateOnlyChange(e.target.value, setCheckOut)}
                />
              </div>
            </div>
          )}

          {duration !== null && (
            <div className={styles.durationLine}>
              Khách sẽ ở <strong>{duration}</strong> {stayUnit}
            </div>
          )}

          <div className={styles.counterCard}>
            <div className={styles.counterLabel}>Số khách</div>
            <div className={styles.counterRow}>
              <span>Người lớn</span>
              <div className={styles.counterControl}>
                <button type="button" onClick={() => setAdults((v) => Math.max(1, v - 1))}>
                  <Minus size={14} />
                </button>
                <span>{adults}</span>
                <button type="button" onClick={() => setAdults((v) => v + 1)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className={styles.counterRow}>
              <span>Trẻ em</span>
              <div className={styles.counterControl}>
                <button type="button" onClick={() => setChildren((v) => Math.max(0, v - 1))}>
                  <Minus size={14} />
                </button>
                <span>{children}</span>
                <button type="button" onClick={() => setChildren((v) => v + 1)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={styles.stepBody}>
          <div className={styles.summaryLine}>
            {stayType === "hour" ? (
              <>
                <strong>{checkInDate && formatDateTimeDMY(checkInDate)}</strong> →{" "}
                <strong>{checkOutDate && formatDateTimeDMY(checkOutDate)}</strong>
              </>
            ) : (
              <>
                Check-in: <strong>{checkInDate && formatDMY(checkInDate)}</strong> → Check-out:{" "}
                <strong>{checkOutDate && formatDMY(checkOutDate)}</strong>
              </>
            )}{" "}
            · {adults} người lớn
            {children > 0 ? `, ${children} trẻ em` : ""}
          </div>

          <div className={styles.roomList}>
            {roomTypes.map((rt) => (
              <button
                key={rt.id}
                type="button"
                className={`${styles.roomOption} ${roomTypeId === rt.id ? styles.roomOptionActive : ""}`}
                onClick={() => setRoomTypeId(rt.id)}
              >
                <div>
                  <div className={styles.roomName}>{rt.name}</div>
                  <div className={styles.roomTag}>{rt.tag}</div>
                </div>
                <div className={styles.roomPriceCol}>
                  <div className={styles.roomPrice}>{formatCurrency(rt.price)}/đêm</div>
                  <div className={styles.roomAvail}>{rt.available} phòng trống</div>
                </div>
              </button>
            ))}
          </div>

          {roomTypeId && (
            <>
              <div className={shared.field}>
                <span className={shared.label}>Gói giá</span>
                <select className={shared.select} value={ratePlan} onChange={(e) => setRatePlan(e.target.value)}>
                  {ratePlans.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>

              <div className={shared.field}>
                <span className={shared.label}>Nguồn đặt phòng</span>
                <select className={shared.select} value={source} onChange={(e) => setSource(e.target.value)}>
                  {bookingSources.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className={styles.stepBody}>
          {!selectedGuest && !creatingNew && (
            <div className={shared.field}>
              <span className={shared.label}>Khách *</span>
              <div className={styles.guestSearchBox}>
                <Search size={15} />
                <input
                  type="text"
                  value={guestQuery}
                  onChange={(e) => setGuestQuery(e.target.value)}
                  placeholder="Tìm theo tên hoặc số điện thoại..."
                />
              </div>

              {guestMatches.length > 0 && (
                <div className={styles.guestResults}>
                  {guestMatches.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={styles.guestResultItem}
                      onClick={() => pickExistingGuest(g)}
                    >
                      <span>{g.name}</span>
                      <span className={styles.guestResultPhone}>{g.phone}</span>
                    </button>
                  ))}
                </div>
              )}

              <button type="button" className={styles.createNewLink} onClick={() => setCreatingNew(true)}>
                + Tạo khách mới
              </button>
            </div>
          )}

          {(selectedGuest || creatingNew) && (
            <div className={shared.field}>
              <span className={shared.label}>Khách *</span>
              <div className={styles.guestChip}>
                <div>
                  <div className={styles.guestChipName}>{finalGuestName || "Khách mới"}</div>
                  <div className={styles.guestChipPhone}>{finalGuestPhone || "Chưa có số điện thoại"}</div>
                </div>
                <button type="button" className={styles.guestChipChange} onClick={resetGuestSelection}>
                  Đổi
                </button>
              </div>
            </div>
          )}

          {creatingNew && !selectedGuest && (
            <div className={styles.newGuestBox}>
              <div className={shared.field}>
                <span className={shared.label}>Thông tin khách mới</span>
              </div>
              <div className={shared.row}>
                <div className={shared.field}>
                  <span className={shared.label}>Họ *</span>
                  <input
                    className={shared.input}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Họ"
                  />
                </div>
                <div className={shared.field}>
                  <span className={shared.label}>Tên *</span>
                  <input
                    className={shared.input}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tên"
                  />
                </div>
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Điện thoại *</span>
                <input
                  className={shared.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại"
                />
              </div>
            </div>
          )}

          <div className={shared.field}>
            <span className={shared.label}>Ghi chú</span>
            <textarea
              className={shared.textarea}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Không có"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.stepBody}>
          <div className={styles.reviewList}>
            <div className={styles.reviewRow}>
              <span>Loại phòng</span>
              <strong>{selectedRoomType?.name}</strong>
            </div>
            <div className={styles.reviewRow}>
              <span>Check-in</span>
              <strong>{checkInDate && (stayType === "hour" ? formatDateTimeDMY(checkInDate) : formatDMY(checkInDate))}</strong>
            </div>
            <div className={styles.reviewRow}>
              <span>Check-out</span>
              <strong>{checkOutDate && (stayType === "hour" ? formatDateTimeDMY(checkOutDate) : formatDMY(checkOutDate))}</strong>
            </div>
            <div className={styles.reviewRow}>
              <span>Thời gian ở</span>
              <strong>
                {duration} {stayUnit}
              </strong>
            </div>
            <div className={styles.reviewRow}>
              <span>Số khách</span>
              <strong>
                {adults} người lớn{children > 0 ? `, ${children} trẻ em` : ""}
              </strong>
            </div>
            <div className={styles.reviewRow}>
              <span>Giá/đêm</span>
              <strong>{formatCurrency(selectedRoomType?.price || 0)}</strong>
            </div>
            <div className={styles.reviewRow}>
              <span>Nguồn</span>
              <strong>{source}</strong>
            </div>
            <div className={styles.reviewRow}>
              <span>Khách</span>
              <strong>{finalGuestName || "—"}</strong>
            </div>
            <div className={styles.reviewRow}>
              <span>Điện thoại</span>
              <strong>{finalGuestPhone || "—"}</strong>
            </div>
            <div className={styles.reviewRow}>
              <span>Ghi chú</span>
              <strong>{note || "—"}</strong>
            </div>
          </div>

          <div className={styles.estimate}>
            <span>Ước tính</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

export default WalkInModal;
