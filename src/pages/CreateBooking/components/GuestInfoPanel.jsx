import { Building2, Cake, CalendarCheck, CreditCard, Flag, Home, Mail, Phone, Plus, Search, User, X } from "lucide-react";
import { guestDirectory } from "../../../data/frontDeskData";
import { formatCurrency, formatDateTimeDMY } from "../../../utils/format";
import shared from "../../FrontDesk/modals/shared.module.css";
import styles from "../CreateBooking.module.css";

function IconField({ icon: Icon, children }) {
  return (
    <div className={styles.iconField}>
      <Icon size={15} />
      {children}
    </div>
  );
}

function AddableSelect({ value, onChange, options, placeholder, onAdd }) {
  return (
    <div className={styles.addRow}>
      <select className={shared.select} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <button type="button" className={styles.addBtn} onClick={onAdd} title={`Thêm ${placeholder.toLowerCase()}`}>
        <Plus size={14} />
      </button>
    </div>
  );
}

function GuestInfoPanel({
  checkIn,
  checkOut,
  nights,
  cartLines,
  rateForType,
  subtotal,
  tax,
  total,
  remaining,
  paymentMethod,
  guestQuery,
  onGuestQueryChange,
  guestForm,
  onGuestFormChange,
  bookingNotes,
  onBookingNotesChange,
  company,
  onCompanyChange,
  source,
  onSourceChange,
  market,
  onMarketChange,
  companyOptions,
  sourceOptions,
  marketOptions,
  idTypes,
  onConfirm,
  onToast,
}) {
  const query = guestQuery.trim().toLowerCase();
  const matches = query
    ? guestDirectory.filter((g) => g.name.toLowerCase().includes(query) || g.phone.includes(query))
    : [];

  function patchGuest(key, value) {
    onGuestFormChange({ ...guestForm, [key]: value });
  }

  function pickGuest(g) {
    onGuestFormChange({ ...guestForm, name: g.name, phone: g.phone });
    onGuestQueryChange("");
  }

  function onAddPlaceholder(label) {
    onToast(`Thêm ${label} mới sẽ có ở bản cập nhật tiếp theo`);
  }

  return (
    <div className={styles.infoBody}>
      <div className={styles.infoCard}>
        <div className={styles.infoCardTitle}>Thông tin đặt phòng</div>
        <textarea
          className={shared.textarea}
          rows={6}
          placeholder="Ghi chú"
          value={bookingNotes}
          onChange={(e) => onBookingNotesChange(e.target.value)}
        />
        <AddableSelect
          value={company}
          onChange={onCompanyChange}
          options={companyOptions}
          placeholder="Chọn công ty"
          onAdd={() => onAddPlaceholder("công ty")}
        />
        <div className={shared.row}>
          <AddableSelect
            value={source}
            onChange={onSourceChange}
            options={sourceOptions}
            placeholder="Chọn nguồn"
            onAdd={() => onAddPlaceholder("nguồn")}
          />
          <AddableSelect
            value={market}
            onChange={onMarketChange}
            options={marketOptions}
            placeholder="Chọn thị trường"
            onAdd={() => onAddPlaceholder("thị trường")}
          />
        </div>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.infoCardTitle}>Khách đại diện</div>

        <div className={styles.guestSearchBox}>
          <Search size={15} />
          <input
            type="text"
            placeholder="Tìm khách đã có theo tên hoặc SĐT..."
            value={guestQuery}
            onChange={(e) => onGuestQueryChange(e.target.value)}
          />
        </div>
        {matches.length > 0 && (
          <div className={styles.guestResults}>
            {matches.map((g) => (
              <button key={g.id} type="button" className={styles.guestResultItem} onClick={() => pickGuest(g)}>
                <span>{g.name}</span>
                <span className={styles.guestResultPhone}>{g.phone}</span>
              </button>
            ))}
          </div>
        )}

        <div className={styles.nameRow}>
          <input
            className={shared.input}
            placeholder="Tên khách *"
            value={guestForm.name}
            onChange={(e) => patchGuest("name", e.target.value)}
          />
          <div className={styles.typeToggle}>
            <button
              type="button"
              className={guestForm.guestType === "individual" ? styles.typeToggleActive : ""}
              title="Khách cá nhân"
              onClick={() => patchGuest("guestType", "individual")}
            >
              <User size={15} />
            </button>
            <button
              type="button"
              className={guestForm.guestType === "company" ? styles.typeToggleActive : ""}
              title="Khách công ty"
              onClick={() => patchGuest("guestType", "company")}
            >
              <Building2 size={15} />
            </button>
          </div>
        </div>

        <div className={shared.row}>
          <IconField icon={CreditCard}>
            <input
              className={styles.iconFieldInput}
              placeholder="Số CMND/Hộ chiếu"
              value={guestForm.idNumber}
              onChange={(e) => patchGuest("idNumber", e.target.value)}
            />
          </IconField>
          <IconField icon={CreditCard}>
            <select
              className={styles.iconFieldInput}
              value={guestForm.idType}
              onChange={(e) => patchGuest("idType", e.target.value)}
            >
              {idTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </IconField>
        </div>

        <div className={shared.row}>
          <IconField icon={Mail}>
            <input
              type="email"
              className={styles.iconFieldInput}
              placeholder="Email"
              value={guestForm.email}
              onChange={(e) => patchGuest("email", e.target.value)}
            />
          </IconField>
          <IconField icon={Phone}>
            <input
              className={styles.iconFieldInput}
              placeholder="SĐT *"
              value={guestForm.phone}
              onChange={(e) => patchGuest("phone", e.target.value)}
            />
          </IconField>
        </div>

        <div className={shared.row}>
          <IconField icon={Cake}>
            <input
              type="date"
              className={styles.iconFieldInput}
              value={guestForm.birthday}
              onChange={(e) => patchGuest("birthday", e.target.value)}
            />
          </IconField>
          <IconField icon={Flag}>
            <input
              className={styles.iconFieldInput}
              placeholder="Quốc tịch"
              value={guestForm.nationality}
              onChange={(e) => patchGuest("nationality", e.target.value)}
            />
            {guestForm.nationality && (
              <button type="button" className={styles.clearChipBtn} onClick={() => patchGuest("nationality", "")}>
                <X size={13} />
              </button>
            )}
          </IconField>
        </div>

        <IconField icon={Home}>
          <input
            className={styles.iconFieldInput}
            placeholder="Địa chỉ"
            value={guestForm.address}
            onChange={(e) => patchGuest("address", e.target.value)}
          />
        </IconField>
      </div>

      <div className={styles.cartPanel}>
        <div className={styles.dualActions}>
          <button type="button" className={styles.actionBtnBooking} onClick={() => onConfirm("booking")}>
            <CalendarCheck size={15} /> Đặt phòng
          </button>
          <button type="button" className={styles.actionBtnCheckin} onClick={() => onConfirm("checkin")}>
            <User size={15} /> Nhận phòng
          </button>
        </div>

        <div className={styles.cartSummaryLine}>
          {formatDateTimeDMY(checkIn)} - {formatDateTimeDMY(checkOut)} <strong>{nights} đêm</strong>
        </div>

        <div className={styles.cartLines}>
          {cartLines.map((line) => (
            <div key={line.id} className={styles.cartLine}>
              <div className={styles.cartLineHead}>
                <span className={styles.cartLineType}>{line.typeKey}</span>
                <span className={styles.recapRoom}>Phòng {line.roomNumber}</span>
                <span className={styles.cartLinePrice}>{formatCurrency(rateForType(line.typeKey) * nights)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cartMoneyRow}>
          <span>Thành tiền</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className={styles.cartMoneyRow}>
          <span>Thuế/Phí</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className={`${styles.cartMoneyRow} ${styles.cartTotalRow}`}>
          <span>Tổng tiền</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className={styles.cartMoneyRow}>
          <span>Thanh toán</span>
          <span>{paymentMethod}</span>
        </div>
        <div className={`${styles.cartMoneyRow} ${remaining > 0 ? styles.remainingDue : styles.remainingOk}`}>
          <span>Còn lại</span>
          <span>{formatCurrency(Math.max(0, remaining))}</span>
        </div>
      </div>
    </div>
  );
}

export default GuestInfoPanel;
