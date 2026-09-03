import { useState } from "react";
import { Check, Minus, Plus, Search } from "lucide-react";
import SlidePanelShell from "./SlidePanelShell";
import {
  roomTypes,
  ratePlans,
  bookingSources,
  guestDirectory,
  getAvailableRoomNumbers,
} from "../../../data/frontDeskData";
import { CUSTOMER_SEGMENTS } from "../../../data/bookingConfigData";
import { formatCurrency, formatDMY, formatDateTimeDMY, formatTime, toLocalInputValue } from "../../../utils/format";
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

function WalkInModal({ defaultCheckIn, defaultCheckOut, bookings, onClose, onConfirm }) {
  const [step, setStep] = useState(0);
  const [stayType, setStayType] = useState("night");
  const nowHHMM = formatTime(new Date());
  const [nowHH, nowMM] = nowHHMM.split(":").map(Number);
  // Walk-in = khách đang có mặt tại quầy — mặc định giờ check-in là giờ hiện tại
  // thay vì cố định 14:00, staff chỉnh lại nếu cần.
  const [checkInTime, setCheckInTime] = useState(nowHHMM);
  const [checkIn, setCheckIn] = useState(toDateTimeInputValue(defaultCheckIn, nowHH, nowMM));
  const [checkOut, setCheckOut] = useState(
    defaultCheckOut ? toLocalInputValue(defaultCheckOut) : ""
  );
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [segmentId, setSegmentId] = useState(CUSTOMER_SEGMENTS[0].id);

  const [roomTypeId, setRoomTypeId] = useState(null);
  const [roomQuantities, setRoomQuantities] = useState({});
  const [roomRepresentatives, setRoomRepresentatives] = useState({});
  const [representative, setRepresentative] = useState({ name: "", phone: "", idNumber: "" });
  const [representativeTouched, setRepresentativeTouched] = useState(false);
  const [roomRatePlans, setRoomRatePlans] = useState({});
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

  const selectedSegment = CUSTOMER_SEGMENTS.find((s) => s.id === segmentId);
  const isGroup = selectedSegment?.code === "GRP";

  const roomTypesWithAvail = roomTypes.map((rt) => ({
    ...rt,
    availableNumbers: getAvailableRoomNumbers(rt.id, bookings, checkInDate, checkOutDate),
  }));

  const selectedRoomType = roomTypesWithAvail.find((rt) => rt.id === roomTypeId);

  const roomInstances = isGroup
    ? roomTypesWithAvail.flatMap((rt) => {
        const qty = roomQuantities[rt.id] || 0;
        return Array.from({ length: qty }, (_, i) => ({ key: `${rt.id}-${i + 1}`, typeId: rt.id, index: i + 1, roomType: rt }));
      })
    : [];
  const totalRoomsSelected = roomInstances.length;

  const total = isGroup
    ? roomTypesWithAvail.reduce((sum, rt) => sum + (roomQuantities[rt.id] || 0) * rt.price, 0) * nights
    : selectedRoomType
    ? selectedRoomType.price * nights
    : 0;

  const totalGuests = adults + children;
  const groupCapacity = roomTypesWithAvail.reduce(
    (sum, rt) => sum + (roomQuantities[rt.id] || 0) * rt.maxOccupancy,
    0
  );
  const groupCapacityOk = groupCapacity >= totalGuests;
  const singleCapacityOk = !selectedRoomType || selectedRoomType.maxOccupancy >= totalGuests;

  const canGoStep1 = Boolean(checkIn && checkOut && checkOutDate > checkInDate);
  const canGoStep2 = isGroup
    ? totalRoomsSelected > 0 && groupCapacityOk
    : Boolean(roomTypeId) && singleCapacityOk;
  const canGoStep3 = Boolean(selectedGuest) || (creatingNew && firstName.trim().length > 0 && lastName.trim().length > 0);

  const guestMatches = guestQuery.trim()
    ? guestDirectory.filter((g) => {
        const q = guestQuery.trim().toLowerCase();
        return g.name.toLowerCase().includes(q) || g.phone.includes(q);
      })
    : [];

  const finalGuestName = selectedGuest ? selectedGuest.name : `${lastName} ${firstName}`.trim();
  const finalGuestPhone = selectedGuest ? selectedGuest.phone : phone;
  const guestLabel = isGroup ? "Trưởng đoàn" : "Khách";

  function handleCheckInDateChange(rawValue) {
    setCheckIn(rawValue ? `${rawValue}T${checkInTime}` : "");
  }

  function handleCheckInTimeChange(rawTime) {
    setCheckInTime(rawTime);
    const datePart = toDateOnly(checkIn);
    if (datePart) setCheckIn(`${datePart}T${rawTime}`);
  }

  function handleCheckOutDateChange(rawValue) {
    setCheckOut(rawValue ? `${rawValue}T12:00` : "");
  }

  function pickExistingGuest(guest) {
    setSelectedGuest(guest);
    setGuestQuery("");
    syncRepresentativeFromLeader(guest.name, guest.phone);
  }

  function resetGuestSelection() {
    setSelectedGuest(null);
    setCreatingNew(false);
  }

  // Khi khách đoàn: tự mapping Người đại diện theo dữ liệu Trưởng đoàn đang gõ/chọn,
  // cho tới khi staff tự sửa Người đại diện (representativeTouched) — lúc đó ngừng
  // đồng bộ hẳn để không ghi đè lựa chọn thủ công.
  function syncRepresentativeFromLeader(name, phone) {
    if (!isGroup || representativeTouched) return;
    setRepresentative((prev) => ({ ...prev, name, phone }));
  }

  function handleLeaderNameChange(part, value) {
    if (part === "lastName") setLastName(value);
    else setFirstName(value);
    const nextLastName = part === "lastName" ? value : lastName;
    const nextFirstName = part === "firstName" ? value : firstName;
    syncRepresentativeFromLeader(`${nextLastName} ${nextFirstName}`.trim(), phone);
  }

  function handleLeaderPhoneChange(value) {
    setPhone(value);
    syncRepresentativeFromLeader(`${lastName} ${firstName}`.trim(), value);
  }

  function selectSegment(seg) {
    const nextIsGroup = seg.code === "GRP";
    if (nextIsGroup !== isGroup) {
      setRoomTypeId(null);
      setRoomQuantities({});
      setRoomRepresentatives({});
      setRepresentative({ name: "", phone: "", idNumber: "" });
      setRepresentativeTouched(false);
      setRoomRatePlans({});
    }
    setSegmentId(seg.id);
  }

  function changeRoomQty(typeId, delta, max) {
    setRoomQuantities((prev) => {
      const next = Math.max(0, Math.min(max, (prev[typeId] || 0) + delta));
      return { ...prev, [typeId]: next };
    });
  }

  function updateRoomRepresentative(key, field, value) {
    setRoomRepresentatives((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  function updateRepresentative(field, value) {
    setRepresentativeTouched(true);
    setRepresentative((prev) => ({ ...prev, [field]: value }));
  }

  function updateRoomRatePlan(key, value) {
    setRoomRatePlans((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function handleConfirm() {
    onConfirm({
      isGroup,
      segment: selectedSegment?.name,
      roomType: !isGroup ? selectedRoomType : null,
      rooms: isGroup
        ? roomInstances.map((inst) => ({
            ...inst,
            representative: roomRepresentatives[inst.key] || null,
            ratePlan: roomRatePlans[inst.key] || ratePlans[0],
          }))
        : null,
      representative: isGroup ? representative : null,
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
    <SlidePanelShell
      header={
        <div>
          <h2 className={styles.title}>Đặt phòng mới</h2>
          <StepIndicator step={step} />
        </div>
      }
      onClose={onClose}
      width={1080}
      footer={footer}
    >
      {step === 0 && (
        <div className={styles.stepBody}>
          <div className={shared.field}>
            <span className={shared.label}>Loại khách *</span>
            <div className={styles.segmentGrid}>
              {CUSTOMER_SEGMENTS.map((seg) => (
                <button
                  key={seg.id}
                  type="button"
                  title={seg.description}
                  className={`${styles.segmentChip} ${segmentId === seg.id ? styles.segmentChipActive : ""}`}
                  onClick={() => selectSegment(seg)}
                >
                  {seg.name}
                </button>
              ))}
            </div>
          </div>

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
            <div className={styles.row3}>
              <div className={shared.field}>
                <span className={shared.label}>Check-in *</span>
                <input
                  type="date"
                  className={shared.input}
                  value={toDateOnly(checkIn)}
                  onChange={(e) => handleCheckInDateChange(e.target.value)}
                />
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Giờ check-in *</span>
                <input
                  type="time"
                  className={shared.input}
                  value={checkInTime}
                  onChange={(e) => handleCheckInTimeChange(e.target.value)}
                />
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Check-out *</span>
                <input
                  type="date"
                  className={shared.input}
                  value={toDateOnly(checkOut)}
                  onChange={(e) => handleCheckOutDateChange(e.target.value)}
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
                <input
                  type="number"
                  className={styles.counterInput}
                  min={1}
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
                />
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
                <input
                  type="number"
                  className={styles.counterInput}
                  min={0}
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))}
                />
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
                Check-in: <strong>{checkInDate && formatDateTimeDMY(checkInDate)}</strong> → Check-out:{" "}
                <strong>{checkOutDate && formatDMY(checkOutDate)}</strong>
              </>
            )}{" "}
            · {adults} người lớn
            {children > 0 ? `, ${children} trẻ em` : ""}
          </div>

          {isGroup && totalRoomsSelected > 0 && (
            <div className={`${styles.durationLine} ${!groupCapacityOk ? styles.durationLineWarning : ""}`}>
              Đã chọn <strong>{totalRoomsSelected}</strong> phòng · sức chứa tối đa{" "}
              <strong>{groupCapacity}</strong> khách cho <strong>{totalGuests}</strong> khách
              {!groupCapacityOk && (
                <>
                  {" "}
                  — còn thiếu <strong>{totalGuests - groupCapacity}</strong> chỗ, vui lòng chọn thêm phòng
                </>
              )}
            </div>
          )}

          {!isGroup && selectedRoomType && !singleCapacityOk && (
            <div className={`${styles.durationLine} ${styles.durationLineWarning}`}>
              {selectedRoomType.name} chỉ chứa tối đa <strong>{selectedRoomType.maxOccupancy}</strong> khách,
              không đủ cho <strong>{totalGuests}</strong> khách đã nhập. Vui lòng chọn loại phòng khác hoặc giảm
              số khách ở bước trước.
            </div>
          )}

          <div className={styles.roomList}>
            {roomTypesWithAvail.map((rt) => {
              const availCount = rt.availableNumbers.length;
              const soldOut = availCount === 0;

              if (isGroup) {
                const qty = roomQuantities[rt.id] || 0;
                return (
                  <div key={rt.id} className={styles.roomOption}>
                    <div>
                      <div className={styles.roomName}>{rt.name}</div>
                      <div className={styles.roomTag}>{rt.tag}</div>
                      <div className={`${styles.roomAvail} ${soldOut ? styles.roomAvailZero : ""}`}>
                        {availCount} phòng trống
                      </div>
                    </div>
                    <div className={styles.roomPriceCol}>
                      <div className={styles.roomPrice}>{formatCurrency(rt.price)}/đêm</div>
                      <div className={styles.counterControl}>
                        <button type="button" onClick={() => changeRoomQty(rt.id, -1, availCount)} disabled={qty === 0}>
                          <Minus size={14} />
                        </button>
                        <span>{qty}</span>
                        <button
                          type="button"
                          onClick={() => changeRoomQty(rt.id, 1, availCount)}
                          disabled={qty >= availCount}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={rt.id}
                  type="button"
                  disabled={soldOut}
                  className={`${styles.roomOption} ${roomTypeId === rt.id ? styles.roomOptionActive : ""} ${
                    soldOut ? styles.roomOptionDisabled : ""
                  }`}
                  onClick={() => setRoomTypeId(rt.id)}
                >
                  <div>
                    <div className={styles.roomName}>{rt.name}</div>
                    <div className={styles.roomTag}>{rt.tag}</div>
                  </div>
                  <div className={styles.roomPriceCol}>
                    <div className={styles.roomPrice}>{formatCurrency(rt.price)}/đêm</div>
                    <div className={`${styles.roomAvail} ${soldOut ? styles.roomAvailZero : ""}`}>
                      {availCount} phòng trống
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {isGroup && totalRoomsSelected > 0 && (
            <div className={shared.field}>
              <span className={shared.label}>Gói giá theo từng phòng</span>
              {roomInstances.map((inst) => (
                <div key={inst.key} className={styles.roomRatePlanRow}>
                  <span className={styles.roomRatePlanLabel}>
                    {inst.roomType.name} #{inst.index}
                  </span>
                  <select
                    className={shared.select}
                    value={roomRatePlans[inst.key] || ratePlans[0]}
                    onChange={(e) => updateRoomRatePlan(inst.key, e.target.value)}
                  >
                    {ratePlans.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {(isGroup ? totalRoomsSelected > 0 : roomTypeId) && (
            <>
              {!isGroup && (
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
              )}

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
              <span className={shared.label}>{guestLabel} *</span>
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
              <span className={shared.label}>{guestLabel} *</span>
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
                <span className={shared.label}>Thông tin {guestLabel.toLowerCase()}</span>
              </div>
              <div className={shared.row}>
                <div className={shared.field}>
                  <span className={shared.label}>Họ *</span>
                  <input
                    className={shared.input}
                    value={lastName}
                    onChange={(e) => handleLeaderNameChange("lastName", e.target.value)}
                    placeholder="Họ"
                  />
                </div>
                <div className={shared.field}>
                  <span className={shared.label}>Tên *</span>
                  <input
                    className={shared.input}
                    value={firstName}
                    onChange={(e) => handleLeaderNameChange("firstName", e.target.value)}
                    placeholder="Tên"
                  />
                </div>
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Điện thoại *</span>
                <input
                  className={shared.input}
                  value={phone}
                  onChange={(e) => handleLeaderPhoneChange(e.target.value)}
                  placeholder="Số điện thoại"
                />
              </div>
            </div>
          )}

          {isGroup && (
            <div className={shared.field}>
              <span className={shared.label}>Người đại diện</span>
              <span className={shared.hint}>
                Tự lấy theo Trưởng đoàn nếu để trống — có thể sửa lại. Có thể chỉ nhập người đại diện
                chung và bỏ qua đại diện từng phòng bên dưới.
              </span>
              <div className={shared.row}>
                <input
                  className={shared.input}
                  placeholder="Tên người đại diện"
                  value={representative.name}
                  onChange={(e) => updateRepresentative("name", e.target.value)}
                />
                <input
                  className={shared.input}
                  placeholder="Số điện thoại"
                  value={representative.phone}
                  onChange={(e) => updateRepresentative("phone", e.target.value)}
                />
              </div>
              <input
                className={shared.input}
                placeholder="Số CCCD/Hộ chiếu"
                value={representative.idNumber}
                onChange={(e) => updateRepresentative("idNumber", e.target.value)}
              />
            </div>
          )}

          {isGroup && roomInstances.length > 0 && (
            <div className={shared.field}>
              <span className={shared.label}>Đại diện phòng (kiểm soát khách & giấy tờ tuỳ thân)</span>
              <span className={shared.hint}>Không bắt buộc — có thể bỏ qua nếu đã nhập Người đại diện ở trên.</span>
              {roomInstances.map((inst) => {
                const rep = roomRepresentatives[inst.key] || {};
                return (
                  <div key={inst.key} className={styles.roomRepresentativeCard}>
                    <div className={styles.roomRepresentativeTitle}>
                      {inst.roomType.name} #{inst.index}
                    </div>
                    <div className={shared.row}>
                      <input
                        className={shared.input}
                        placeholder="Tên đại diện phòng"
                        value={rep.name || ""}
                        onChange={(e) => updateRoomRepresentative(inst.key, "name", e.target.value)}
                      />
                      <input
                        className={shared.input}
                        placeholder="Số điện thoại"
                        value={rep.phone || ""}
                        onChange={(e) => updateRoomRepresentative(inst.key, "phone", e.target.value)}
                      />
                    </div>
                    <input
                      className={shared.input}
                      placeholder="Số CCCD/Hộ chiếu"
                      value={rep.idNumber || ""}
                      onChange={(e) => updateRoomRepresentative(inst.key, "idNumber", e.target.value)}
                    />
                  </div>
                );
              })}
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
              <span>Loại khách</span>
              <strong>{selectedSegment?.name}</strong>
            </div>

            {isGroup ? (
              roomTypesWithAvail
                .filter((rt) => (roomQuantities[rt.id] || 0) > 0)
                .map((rt) => (
                  <div key={rt.id} className={styles.reviewRow}>
                    <span>{rt.name}</span>
                    <strong>{roomQuantities[rt.id]} phòng</strong>
                  </div>
                ))
            ) : (
              <div className={styles.reviewRow}>
                <span>Loại phòng</span>
                <strong>{selectedRoomType?.name}</strong>
              </div>
            )}

            <div className={styles.reviewRow}>
              <span>Check-in</span>
              <strong>{checkInDate && formatDateTimeDMY(checkInDate)}</strong>
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
              <span>Nguồn</span>
              <strong>{source}</strong>
            </div>
            <div className={styles.reviewRow}>
              <span>{guestLabel}</span>
              <strong>{finalGuestName || "—"}</strong>
            </div>
            <div className={styles.reviewRow}>
              <span>Điện thoại</span>
              <strong>{finalGuestPhone || "—"}</strong>
            </div>
            {isGroup && (
              <div className={styles.reviewRow}>
                <span>Người đại diện</span>
                <strong>{representative.name || "—"}</strong>
              </div>
            )}
            {isGroup &&
              roomInstances.map((inst) => (
                <div key={inst.key} className={styles.reviewRow}>
                  <span>
                    Gói giá · {inst.roomType.name} #{inst.index}
                  </span>
                  <strong>{roomRatePlans[inst.key] || ratePlans[0]}</strong>
                </div>
              ))}
            {isGroup &&
              roomInstances.map((inst) => (
                <div key={inst.key} className={styles.reviewRow}>
                  <span>
                    Đại diện phòng · {inst.roomType.name} #{inst.index}
                  </span>
                  <strong>{roomRepresentatives[inst.key]?.name || "—"}</strong>
                </div>
              ))}
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
    </SlidePanelShell>
  );
}

export default WalkInModal;
