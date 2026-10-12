import { useMemo, useRef, useState } from "react";
import { Baby, CalendarRange, Minus, Plus, User, Users, X } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import DateNavPopover from "../RoomMap/components/DateNavPopover";
import BookingCartPanel from "./components/BookingCartPanel";
import GuestInfoPanel from "./components/GuestInfoPanel";
import {
  buildRoomMapBookings,
  findAvailableRooms,
  getRateForDate,
  ROOMS,
  ROOM_TYPES,
  SOURCE_META,
} from "../../data/roomMapData";
import { addDays, formatCurrency, startOfDay } from "../../utils/format";
import shared from "../FrontDesk/modals/shared.module.css";
import styles from "./CreateBooking.module.css";

const RATE_PLANS = [
  { key: "default", label: "Mặc định", multiplier: 1 },
  { key: "off_weekday", label: "OFF (CN-T6)", multiplier: 0.85 },
  { key: "onl_weekday", label: "ONL (CN-T6)", multiplier: 0.9 },
  { key: "off_weekend", label: "OFF (T7)", multiplier: 1 },
  { key: "onl_weekend", label: "ONL (T7)", multiplier: 1.05 },
  { key: "ota", label: "Giá OTA (vui lòng không chỉnh sửa)", multiplier: 1.1 },
];

const PAYMENT_METHODS = ["Tiền mặt", "Thẻ tín dụng", "Chuyển khoản NH"];

const COMPANY_OPTIONS = ["Công ty TNHH ABC", "Công ty CP Du lịch XYZ"];
const SOURCE_OPTIONS = Object.keys(SOURCE_META);
const MARKET_OPTIONS = ["Nội địa", "Quốc tế"];
const ID_TYPES = ["CMND", "CCCD", "Hộ chiếu"];

const EMPTY_GUEST_FORM = {
  guestType: "individual",
  name: "",
  idNumber: "",
  idType: "Hộ chiếu",
  email: "",
  phone: "",
  birthday: "",
  nationality: "Việt Nam",
  address: "",
};

const GROUP_STORAGE_KEY = "bellhop-booking-groups";

function readSavedGroups() {
  try {
    const groups = JSON.parse(localStorage.getItem(GROUP_STORAGE_KEY) || "[]");
    return Array.isArray(groups) ? groups : [];
  } catch {
    return [];
  }
}

function availabilityClass(avail, styles) {
  if (avail <= 0) return styles.availZero;
  if (avail <= 2) return styles.availLow;
  return styles.availOk;
}

function combineDateTime(date, timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
}

function CreateBooking() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [bookings] = useState(() => buildRoomMapBookings(today));

  const [checkInDate, setCheckInDate] = useState(today);
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutDate, setCheckOutDate] = useState(() => addDays(today, 1));
  const [checkOutTime, setCheckOutTime] = useState("12:00");

  const [ratePlanByType, setRatePlanByType] = useState(() =>
    Object.fromEntries(ROOM_TYPES.map((t) => [t.key, "default"]))
  );
  const [cartLines, setCartLines] = useState([]); // { id, typeKey, roomNumber, adults, children }
  const cartSeq = useRef(0);
  const [toastMsg, setToastMsg] = useState("");
  const [activeTab, setActiveTab] = useState("rooms"); // "rooms" | "info"
  const [savedGroups, setSavedGroups] = useState(readSavedGroups);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupLeader, setGroupLeader] = useState("");
  const selectedGroup = savedGroups.find((group) => group.id === selectedGroupId);

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [amountPaid, setAmountPaid] = useState("");
  const [guestQuery, setGuestQuery] = useState("");
  const [guestForm, setGuestForm] = useState(EMPTY_GUEST_FORM);
  const [bookingNotes, setBookingNotes] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [market, setMarket] = useState("");

  const checkIn = combineDateTime(checkInDate, checkInTime);
  const checkOut = combineDateTime(checkOutDate, checkOutTime);
  const validRange = checkOut > checkIn;
  const nights = validRange ? Math.max(1, Math.ceil((checkOut - checkIn) / 86400000)) : 1;

  const availabilityByType = useMemo(() => {
    return Object.fromEntries(
      ROOM_TYPES.map((t) => {
        const roomsOfType = ROOMS.filter((r) => r.typeKey === t.key);
        const availableRooms = validRange ? findAvailableRooms(roomsOfType, bookings, checkIn, checkOut) : [];
        return [t.key, { total: roomsOfType.length, availableRooms }];
      })
    );
  }, [bookings, checkIn, checkOut, validRange]);

  const quantityByType = useMemo(() => {
    const counts = {};
    cartLines.forEach((l) => {
      counts[l.typeKey] = (counts[l.typeKey] || 0) + 1;
    });
    return counts;
  }, [cartLines]);

  const totalAvailable = ROOM_TYPES.reduce(
    (sum, t) => sum + availabilityByType[t.key].availableRooms.length - (quantityByType[t.key] || 0),
    0
  );

  function rateForType(typeKey) {
    const plan = RATE_PLANS.find((p) => p.key === ratePlanByType[typeKey]);
    const base = getRateForDate(typeKey, checkIn);
    return Math.round((base * plan.multiplier) / 1000) * 1000;
  }

  const subtotal = cartLines.reduce((sum, l) => sum + rateForType(l.typeKey) * nights, 0);
  const tax = taxEnabled ? Math.round((subtotal * 0.1) / 1000) * 1000 : 0;
  const total = subtotal + tax;
  const paidAmount = Number(amountPaid) || 0;
  const remaining = total - paidAmount;

  function incrementType(typeKey) {
    const type = ROOM_TYPES.find((t) => t.key === typeKey);
    const remainingAvail = availabilityByType[typeKey].availableRooms.length - (quantityByType[typeKey] || 0);
    if (remainingAvail <= 0) return;
    cartSeq.current += 1;
    setCartLines((prev) => [
      ...prev,
      {
        id: `cart-${cartSeq.current}`,
        typeKey,
        roomNumber: null,
        adults: Math.min(2, type.maxAdults),
        children: 0,
      },
    ]);
  }

  function decrementType(typeKey) {
    setCartLines((prev) => {
      const lastIndex = prev.map((l) => l.typeKey).lastIndexOf(typeKey);
      if (lastIndex === -1) return prev;
      return prev.filter((_, i) => i !== lastIndex);
    });
  }

  function updateCartLine(id, patch) {
    setCartLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function resetCart() {
    setCartLines([]);
  }

  function saveGroup() {
    const name = groupName.trim();
    const leaderName = groupLeader.trim();
    if (!name || !leaderName || cartLines.length === 0) {
      setToastMsg("Nhập tên đoàn, người đại diện và chọn ít nhất một phòng");
      return;
    }
    const id = selectedGroupId || `group-${Date.now()}`;
    const group = {
      id, name, leaderName, checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString(),
      rooms: cartLines.map(({ typeKey, roomNumber, adults, children }) => ({ typeKey, roomNumber, adults, children })),
      ratePlanByType,
    };
    const next = [...savedGroups.filter((item) => item.id !== id), group];
    setSavedGroups(next);
    localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(next));
    setSelectedGroupId(id);
    setGuestForm((prev) => ({ ...prev, name: leaderName }));
    setToastMsg("Đã lưu thông tin đoàn");
  }

  function selectGroup(id) {
    setSelectedGroupId(id);
    const group = savedGroups.find((item) => item.id === id);
    if (!group) {
      setGroupName("");
      setGroupLeader("");
      return;
    }
    setGroupName(group.name);
    setGroupLeader(group.leaderName);
    setGuestForm((prev) => ({ ...prev, name: group.leaderName }));
    const arrival = new Date(group.checkIn);
    const departure = new Date(group.checkOut);
    if (!Number.isNaN(arrival.getTime()) && !Number.isNaN(departure.getTime())) {
      setCheckInDate(startOfDay(arrival));
      setCheckInTime(`${String(arrival.getHours()).padStart(2, "0")}:${String(arrival.getMinutes()).padStart(2, "0")}`);
      setCheckOutDate(startOfDay(departure));
      setCheckOutTime(`${String(departure.getHours()).padStart(2, "0")}:${String(departure.getMinutes()).padStart(2, "0")}`);
    }
    setRatePlanByType((prev) => ({ ...prev, ...group.ratePlanByType }));
    const used = new Set();
    setCartLines((group.rooms || []).filter((room) => ROOM_TYPES.some((type) => type.key === room.typeKey)).map((room) => {
      cartSeq.current += 1;
      const roomNumber = room.roomNumber && !used.has(room.roomNumber) ? room.roomNumber : null;
      if (roomNumber) used.add(roomNumber);
      return { ...room, roomNumber, id: `cart-${cartSeq.current}` };
    }));
    setToastMsg("Đã chọn đoàn. Chọn Chỉnh sửa phòng để thay đổi.");
  }

  function goToTab(tab) {
    if (tab === "info" && cartLines.length === 0) {
      setToastMsg("Vui lòng chọn phòng ở tab Phòng trống trước");
      return;
    }
    setActiveTab(tab);
  }

  function handleContinue() {
    if (!cartLines.every((l) => l.roomNumber)) {
      setToastMsg("Vui lòng chọn phòng cụ thể cho từng dòng trước khi tiếp tục");
      return;
    }
    if (paidAmount > total) {
      setToastMsg("Số tiền thanh toán vượt quá tổng tiền");
      return;
    }
    setActiveTab("info");
  }

  function handleConfirmBooking(mode) {
    if (!guestForm.name.trim() || !guestForm.phone.trim()) {
      setToastMsg("Vui lòng nhập tên và số điện thoại khách đại diện");
      return;
    }
    setToastMsg(mode === "checkin" ? "Đã nhận phòng thành công" : "Đã tạo đặt phòng thành công");
    resetCart();
    setTaxEnabled(false);
    setAmountPaid("");
    setGuestForm(EMPTY_GUEST_FORM);
    setBookingNotes("");
    setCompany("");
    setSource("");
    setMarket("");
    setSelectedGroupId("");
    setGroupName("");
    setGroupLeader("");
    setActiveTab("rooms");
  }

  return (
    <div className={styles.page}>
      <div className={styles.topTabs}>
        <button
          type="button"
          className={`${styles.topTab} ${activeTab === "groups" ? styles.topTabActive : ""}`}
          onClick={() => goToTab("groups")}
        >
          <Users size={15} /> Thông tin đoàn
        </button>
        <button
          type="button"
          className={`${styles.topTab} ${activeTab === "rooms" ? styles.topTabActive : ""}`}
          onClick={() => goToTab("rooms")}
        >
          <Plus size={15} /> Phòng trống
        </button>
        <button
          type="button"
          className={`${styles.topTab} ${activeTab === "info" ? styles.topTabActive : ""}`}
          onClick={() => goToTab("info")}
        >
          <User size={15} /> Thông tin
        </button>
      </div>

      {activeTab === "groups" ? (
        <div className={styles.groupsBody}>
          <div className={styles.groupCard}>
            <div className={styles.infoCardTitle}>Đoàn đã lưu</div>
            {savedGroups.length === 0 ? (
              <p className={styles.groupEmpty}>Chưa có đoàn nào được lưu. Tạo đoàn trong tab Phòng trống.</p>
            ) : (
              <div className={styles.groupList}>
                {savedGroups.map((group) => (
                  <button key={group.id} type="button" className={`${styles.groupListItem} ${selectedGroupId === group.id ? styles.groupListItemActive : ""}`} onClick={() => selectGroup(group.id)}>
                    <strong>{group.name}</strong>
                    <span>{group.leaderName} · {(group.rooms || []).length} phòng</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.groupCard}>
            {selectedGroup ? (
              <>
                <div className={styles.infoCardTitle}>Thông tin đoàn</div>
                <h2 className={styles.groupDetailTitle}>{selectedGroup.name}</h2>
                <div className={styles.groupDetailGrid}>
                  <div><span>Người đại diện</span><strong>{selectedGroup.leaderName}</strong></div>
                  <div><span>Nhận phòng</span><strong>{new Date(selectedGroup.checkIn).toLocaleString("vi-VN")}</strong></div>
                  <div><span>Trả phòng</span><strong>{new Date(selectedGroup.checkOut).toLocaleString("vi-VN")}</strong></div>
                  <div><span>Số phòng</span><strong>{(selectedGroup.rooms || []).length}</strong></div>
                </div>
                <div className={styles.groupRoomList}>
                  {(selectedGroup.rooms || []).map((room, index) => (
                    <div key={index}>
                      <strong>{ROOM_TYPES.find((type) => type.key === room.typeKey)?.label || room.typeKey}</strong>
                      <span>{room.roomNumber || "Chưa gán phòng"} · {room.adults || 0} người lớn · {room.children || 0} trẻ em</span>
                    </div>
                  ))}
                </div>
                <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={() => setActiveTab("rooms")}>Chỉnh sửa phòng</button>
              </>
            ) : (
              <p className={styles.groupEmpty}>Chọn một đoàn trong danh sách để xem thông tin.</p>
            )}
          </div>
        </div>
      ) : activeTab === "rooms" ? (
        <div className={styles.body}>
          <div className={styles.mainCol}>
            {(
              <div className={styles.groupCard}>
                <div className={styles.infoCardTitle}>Thông tin đoàn</div>
                <div className={styles.groupFields}>
                  <label className={styles.groupField}>Tên đoàn
                    <input className={shared.input} value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Tên đoàn" />
                  </label>
                  <label className={styles.groupField}>Người đại diện
                    <input className={shared.input} value={groupLeader} onChange={(e) => setGroupLeader(e.target.value)} placeholder="Tên người đại diện" />
                  </label>
                </div>
                <div className={styles.groupActions}>
                  <span>{cartLines.length} phòng đang chọn{selectedGroup ? ` · Đang sửa ${selectedGroup.name}` : ""}</span>
                  <div className={styles.groupActionButtons}>
                    {selectedGroup && <button type="button" className={shared.btn} onClick={() => { setSelectedGroupId(""); setGroupName(""); setGroupLeader(""); setCartLines([]); }}>Tạo đoàn mới</button>}
                    <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={saveGroup}>Lưu thông tin đoàn</button>
                  </div>
                </div>
              </div>
            )}
            <div className={styles.dateRow}>
              <div className={styles.dateField}>
                <DateNavPopover selectedDate={checkInDate} onSelect={setCheckInDate} />
                <input
                  type="time"
                  className={`${shared.input} ${styles.timeInput}`}
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
              </div>
              <span className={styles.dateArrow}>→</span>
              <div className={styles.dateField}>
                <DateNavPopover selectedDate={checkOutDate} onSelect={setCheckOutDate} />
                <input
                  type="time"
                  className={`${shared.input} ${styles.timeInput}`}
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
              </div>
              {validRange && <span className={styles.nightsBadge}>{nights} đêm</span>}
              {!validRange && <span className={styles.dateError}>Trả phòng phải sau nhận phòng</span>}
              {cartLines.length > 0 && (
                <button type="button" className={styles.clearBtn} onClick={resetCart} title="Bỏ chọn tất cả">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableHeadRow}>
                <span className={styles.colType}>Loại phòng</span>
                <span className={styles.colQty}>Phòng ({Math.max(0, totalAvailable)} còn lại)</span>
                <span className={styles.colRate}>Loại giá</span>
                <span className={styles.colPrice}>Giá mặc định</span>
                <span className={styles.colGuests}>Khách</span>
              </div>

              {ROOM_TYPES.map((t, index) => {
                const avail = availabilityByType[t.key].availableRooms.length - (quantityByType[t.key] || 0);
                const qty = quantityByType[t.key] || 0;
                const plan = RATE_PLANS.find((p) => p.key === ratePlanByType[t.key]);
                const deltaPct = Math.round((plan.multiplier - 1) * 100);
                return (
                  <div key={t.key} className={`${styles.tableRow} ${index % 2 === 1 ? styles.tableRowOdd : ""}`}>
                    <span className={styles.colType}>{t.label}</span>
                    <span className={styles.colQty}>
                      <div className={styles.stepper}>
                        <button type="button" onClick={() => decrementType(t.key)} disabled={qty === 0}>
                          <Minus size={13} />
                        </button>
                        <span>{qty}</span>
                        <button type="button" onClick={() => incrementType(t.key)} disabled={avail <= 0 || !validRange}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className={`${styles.availPill} ${availabilityClass(avail, styles)}`}>
                        {Math.max(0, avail)} còn lại
                      </span>
                    </span>
                    <span className={styles.colRate}>
                      <select
                        className={shared.select}
                        value={ratePlanByType[t.key]}
                        onChange={(e) => setRatePlanByType((prev) => ({ ...prev, [t.key]: e.target.value }))}
                      >
                        {RATE_PLANS.map((p) => (
                          <option key={p.key} value={p.key}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </span>
                    <span className={styles.colPrice}>
                      {formatCurrency(rateForType(t.key))}
                      {deltaPct !== 0 && (
                        <span className={deltaPct > 0 ? styles.deltaUp : styles.deltaDown}>
                          {deltaPct > 0 ? "+" : ""}
                          {deltaPct}%
                        </span>
                      )}
                    </span>
                    <span className={styles.colGuests}>
                      <User size={13} /> {t.maxAdults}
                      <Baby size={13} /> {t.maxChildren}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {cartLines.length > 0 ? (
            <BookingCartPanel
              checkIn={checkIn}
              checkOut={checkOut}
              nights={nights}
              cartLines={cartLines}
              availabilityByType={availabilityByType}
              rateForType={rateForType}
              onUpdateLine={updateCartLine}
              subtotal={subtotal}
              tax={tax}
              total={total}
              remaining={remaining}
              taxEnabled={taxEnabled}
              onTaxEnabledChange={setTaxEnabled}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              amountPaid={amountPaid}
              onAmountPaidChange={setAmountPaid}
              paymentMethods={PAYMENT_METHODS}
              onContinue={handleContinue}
              onToast={setToastMsg}
            />
          ) : (
            <div className={styles.cartPlaceholder}>
              <CalendarRange size={28} />
              <p>Chọn số lượng phòng ở bảng bên trái để bắt đầu tạo đặt phòng.</p>
            </div>
          )}
        </div>
      ) : (
        <GuestInfoPanel
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          cartLines={cartLines}
          rateForType={rateForType}
          subtotal={subtotal}
          tax={tax}
          total={total}
          remaining={remaining}
          paymentMethod={paymentMethod}
          guestQuery={guestQuery}
          onGuestQueryChange={setGuestQuery}
          guestForm={guestForm}
          onGuestFormChange={setGuestForm}
          bookingNotes={bookingNotes}
          onBookingNotesChange={setBookingNotes}
          company={company}
          onCompanyChange={setCompany}
          source={source}
          onSourceChange={setSource}
          market={market}
          onMarketChange={setMarket}
          companyOptions={COMPANY_OPTIONS}
          sourceOptions={SOURCE_OPTIONS}
          marketOptions={MARKET_OPTIONS}
          idTypes={ID_TYPES}
          onConfirm={handleConfirmBooking}
          onToast={setToastMsg}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default CreateBooking;
