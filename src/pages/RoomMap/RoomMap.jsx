import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Rocket, SlidersHorizontal, Wrench } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import DateNavPopover from "./components/DateNavPopover";
import GanttBoard from "./components/GanttBoard";
import RoomStatusGrid from "./components/RoomStatusGrid";
import RoomMaintenanceModal from "./components/RoomMaintenanceModal";
import BookingDetailPanel from "../FrontDesk/panels/BookingDetailPanel";
import AddServiceModal from "../FrontDesk/modals/AddServiceModal";
import AssignRoomModal from "../FrontDesk/modals/AssignRoomModal";
import ChangeDateModal from "../FrontDesk/modals/ChangeDateModal";
import ConfirmActionModal from "../FrontDesk/modals/ConfirmActionModal";
import CopyBookingModal from "../FrontDesk/modals/CopyBookingModal";
import EditGuestModal from "../FrontDesk/modals/EditGuestModal";
import InvoiceModal from "../FrontDesk/modals/InvoiceModal";
import WalkInModal from "../FrontDesk/modals/WalkInModal";
import CheckInModal from "../FrontDesk/modals/CheckInModal";
import AddRoomToGroupModal from "../FrontDesk/modals/AddRoomToGroupModal";
import MergeRoomGroupModal from "../FrontDesk/modals/MergeRoomGroupModal";
import LodgingGroupDetail from "../FrontDesk/modals/LodgingGroupDetail";
import { useBookings } from "../../context/BookingsContext";
import { toRoomMapDetailBooking } from "../../utils/roomMapBookingAdapter";
import { isRoomAvailable, rangesOverlap } from "../../utils/bookingGroups";
import {
  computeRoomStatusCounts,
  computeStatusCounts,
  ROOMS,
  ROOM_TAB_ORDER,
  STATUS_META,
  STATUS_TAB_ORDER,
} from "../../data/roomMapData";
import { addDays, addMonths } from "../../utils/format";
import { colorForStatus, useRoomStatusColors } from "../../utils/roomColorConfig";
import styles from "./RoomMap.module.css";

const PERIODS = [
  { key: "day", label: "Ngày" },
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
];

const VIEW_MODES = [
  { key: "gantt", label: "Dòng thời gian", Icon: SlidersHorizontal },
  { key: "grid-detailed", label: "Chi tiết", Icon: LayoutGrid },
];

function RoomMap() {
  const { today, roomMapBookings: bookings, setRoomMapBookings: setBookings, lodgingGroups, setLodgingGroups } = useBookings();
  const [selectedDate, setSelectedDate] = useState(today);
  const [periodMode, setPeriodMode] = useState("day");
  const [saleMode, setSaleMode] = useState("sell");
  const [viewMode, setViewMode] = useState("gantt");
  const [statusFilter, setStatusFilter] = useState(null);
  const [showToday, setShowToday] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [detailTab, setDetailTab] = useState("room");
  const [modal, setModal] = useState(null);
  const [invoiceView, setInvoiceView] = useState(null);
  const [openGroupId, setOpenGroupId] = useState(null);
  const [roomStatusOverrides, setRoomStatusOverrides] = useState({});
  const [maintenanceDetails, setMaintenanceDetails] = useState({});
  const statusColors = useRoomStatusColors();

  const statusCounts = useMemo(() => computeStatusCounts(bookings, today), [bookings, today]);
  const roomStatusCounts = useMemo(
    () => computeRoomStatusCounts(ROOMS, bookings, roomStatusOverrides, selectedDate),
    [bookings, roomStatusOverrides, selectedDate]
  );
  const tabOrder = [...STATUS_TAB_ORDER, ...ROOM_TAB_ORDER];
  const tabCounts = { ...statusCounts, ...roomStatusCounts };

  function stepDate(dir) {
    if (periodMode === "day") setSelectedDate((d) => addDays(d, dir));
    else if (periodMode === "week") setSelectedDate((d) => addDays(d, dir * 7));
    else setSelectedDate((d) => addMonths(d, dir));
  }

  function toFrontDeskBooking(booking) {
    return toRoomMapDetailBooking(booking);
  }

  function openBookingDetail(booking) {
    setDetailTab("room");
    setDetailId(booking.id);
  }

  function updateBooking(id, patch) {
    setBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== id) return booking;
        return {
          ...booking,
          ...patch,
          code: patch.bookingCode ?? booking.code,
          guest: patch.guest?.name ?? patch.guest ?? booking.guest,
          nationality: patch.guest?.flag ?? booking.nationality,
        };
      })
    );
  }

  const detailRawBooking = detailId ? bookings.find((booking) => booking.id === detailId) : null;
  const detailBooking = detailRawBooking ? toFrontDeskBooking(detailRawBooking) : null;
  const detailGroup = lodgingGroups.find((group) => group.id === detailBooking?.groupId);
  const detailGroupBookings = detailBooking?.groupId
    ? bookings.filter((item) => item.groupId === detailBooking.groupId).map(toFrontDeskBooking) : [];

  function closeModal() {
    setModal(null);
  }

  function ensureLodgingGroup(booking, groups) {
    if (booking.groupId) return booking.groupId;
    const id = `RM-G-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    groups.push({ id, source: "roomMap", name: `Đoàn ${booking.guest || "Khách lưu trú"}`, leaderName: booking.guest || "Khách lưu trú", createdDate: new Date() });
    return id;
  }

  function addRoomToGroup(payload) {
    const source = bookings.find((item) => item.id === modal.booking.id);
    const normalized = bookings.map(toFrontDeskBooking);
    if (!source || !isRoomAvailable(normalized, payload.room, payload.checkIn, payload.checkOut)) {
      setToastMsg("Phòng vừa được đặt trong khoảng ngày này. Vui lòng tìm lại.");
      return;
    }
    const groups = [...lodgingGroups];
    const groupId = ensureLodgingGroup(source, groups);
    const id = `RM-ADD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newBooking = {
      ...source, id, code: Math.max(46000, ...bookings.map((item) => Number(item.code) || 0)) + 1,
      groupId, room: payload.room, roomType: payload.typeId, checkIn: payload.checkIn, checkOut: payload.checkOut,
      status: payload.checkIn > today ? "booked_future" : "arriving_today",
      guests: [], adults: 0, children: 0, services: [], paymentRecords: [], notes: "", paid: false,
    };
    setBookings((prev) => [newBooking, ...prev.map((item) => item.id === source.id ? { ...item, groupId } : item)]);
    setLodgingGroups(groups);
    setModal(null);
    setOpenGroupId(groupId);
    setToastMsg(`Đã thêm phòng ${payload.room} vào đoàn`);
  }

  function mergeRoomGroup(target) {
    const source = bookings.find((item) => item.id === modal.booking.id);
    const other = bookings.find((item) => item.id === target.id);
    if (!source || !other || source.id === other.id || ["checked_out", "maintenance"].includes(source.status) || ["checked_out", "maintenance"].includes(other.status)) {
      setToastMsg("Không thể gộp đặt phòng đã chọn");
      return;
    }
    const sourceMembers = bookings.filter((item) => item.id === source.id || (source.groupId && item.groupId === source.groupId));
    const targetMembers = bookings.filter((item) => item.id === other.id || (other.groupId && item.groupId === other.groupId));
    if (sourceMembers.some((left) => targetMembers.some((right) => left.room === right.room && rangesOverlap(left.checkIn, left.checkOut, right.checkIn, right.checkOut)))) {
      setToastMsg("Các đoàn có phòng trùng nhau trong thời gian lưu trú");
      return;
    }
    const groups = [...lodgingGroups];
    const groupId = ensureLodgingGroup(source, groups);
    setBookings((prev) => prev.map((item) =>
      item.id === source.id || item.id === other.id || (other.groupId && item.groupId === other.groupId)
        ? { ...item, groupId } : item
    ));
    setLodgingGroups(groups.filter((group) => group.id !== other.groupId || group.id === groupId));
    setModal(null);
    setOpenGroupId(groupId);
    setToastMsg("Đã gộp phòng vào đoàn");
  }

  function saveServices(items) {
    updateBooking(modal.booking.id, { services: [...modal.booking.services, ...items] });
    closeModal();
    setToastMsg("Đã thêm dịch vụ vào phòng");
  }

  function saveGuests(guests) {
    const normalized = guests.map((guest) => ({ id: guest.id, name: guest.name, flag: guest.nationality || "VN" }));
    updateBooking(modal.booking.id, {
      guests: normalized,
      guest: { name: normalized[0]?.name || modal.booking.guest.name, flag: normalized[0]?.flag || "VN" },
    });
    closeModal();
    setToastMsg("Đã cập nhật thông tin khách");
  }

  function handleBookingAction(action, booking, room, selectedRange) {
    if (!booking) {
      if (action === "clean") {
        setRoomStatusOverrides((prev) => ({ ...prev, [room.number]: "clean" }));
        setToastMsg(`Phòng ${room.number} đã ở trạng thái sạch`);
      } else if (action === "dirty") {
        setModal({
          type: "dirty",
          booking: {
            room: room.number,
            roomType: room.typeKey,
            bookingCode: "",
            guest: { name: "Khách lưu trú", flag: "VN" },
          },
        });
      } else if (action === "maintenance") {
        setModal({ type: "maintenance", room });
      } else if (action === "quickCheckin" || action === "reserve") {
        setModal({
          type: action === "reserve" ? "reserve" : "walkin",
          room,
          defaultCheckIn: selectedRange?.checkIn,
          defaultCheckOut: selectedRange?.checkOut,
        });
      } else if (action === "list") {
        setToastMsg(`Đang hiển thị danh sách đặt phòng của phòng ${room.number}`);
      } else if (action === "detail") {
        setToastMsg(`Phòng ${room.number} đang trống`);
      } else {
        setToastMsg("Thao tác này cần một đặt phòng đang hoạt động");
      }
      return;
    }
    const frontDeskBooking = toFrontDeskBooking(booking);
    if (action === "checkin") {
      setModal({ type: "checkin", booking: frontDeskBooking });
      return;
    }
    if (action === "undo") {
      updateBooking(booking.id, { status: "arriving_today" });
      setToastMsg("Đã hoàn tác nhận phòng");
      return;
    }
    if (action === "checkout") {
      setDetailTab("payment");
      setDetailId(booking.id);
      return;
    }
    if (action === "clean" || action === "dirty") {
      setModal({ type: action, booking: frontDeskBooking, action });
      return;
    }
    if (action === "list") {
      setDetailId(booking.id);
      return;
    }
    if (action === "group" || action === "list") {
      setDetailId(booking.id);
      return;
    }
    const modalByAction = {
      change: "changeDate",
      assign: "assignRoom",
      copy: "copy",
      cancel: "cancel",
      service: "addService",
      clean: "clean",
      unassign: "unassign",
      transfer: "assignRoom",
      dirty: "dirty",
    };
    const type = modalByAction[action];
    if (type) setModal({ type, booking: frontDeskBooking, action });
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.controlsRow}>
          <div className={styles.statusTabs}>
            {tabOrder.map((key) => {
              const meta = STATUS_META[key];
              const statusColor = colorForStatus(key, statusColors);
              const active = statusFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.statusTab} ${active ? styles.statusTabActive : ""}`}
                  style={active ? { background: `${statusColor}1a`, color: statusColor } : undefined}
                  onClick={() => setStatusFilter((prev) => (prev === key ? null : key))}
                >
                  <span className={styles.statusDot} style={{ background: statusColor }} />
                  {meta.label}
                  <span className={styles.statusCount}>{tabCounts[key]}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.segmented}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${saleMode === "sell" ? styles.segmentActive : ""}`}
              onClick={() => setSaleMode("sell")}
            >
              <Rocket size={14} /> Bán
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${saleMode === "edit" ? styles.segmentActive : ""}`}
              onClick={() => setSaleMode("edit")}
            >
              <Wrench size={14} /> Sửa
            </button>
          </div>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.controlsRow}>
          <div className={styles.leftControls}>
            <div className={styles.dateNav}>
              <button type="button" className={styles.navIconBtn} onClick={() => stepDate(-1)} title="Trước">
                <ChevronLeft size={16} />
              </button>
              <DateNavPopover selectedDate={selectedDate} onSelect={setSelectedDate} />
              <button type="button" className={styles.navIconBtn} onClick={() => stepDate(1)} title="Sau">
                <ChevronRight size={16} />
              </button>
            </div>

            <button type="button" className={styles.todayBtn} onClick={() => setSelectedDate(today)}>
              Hôm nay
            </button>

            {viewMode === "gantt" && (
              <>
                <div className={styles.segmented}>
                  {PERIODS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      className={`${styles.segmentBtn} ${periodMode === p.key ? styles.segmentActive : ""}`}
                      onClick={() => setPeriodMode(p.key)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={showToday} onChange={(e) => setShowToday(e.target.checked)} />
                  Xem ngày
                </label>
              </>
            )}
          </div>

          <div className={styles.densityIcons}>
            {VIEW_MODES.map((vm) => (
              <button
                key={vm.key}
                type="button"
                className={`${styles.densityBtn} ${viewMode === vm.key ? styles.densityActive : ""}`}
                title={vm.label}
                onClick={() => setViewMode(vm.key)}
              >
                <vm.Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div key={viewMode} className={styles.viewFade}>
        {viewMode === "gantt" ? (
          <GanttBoard
            bookings={bookings}
            selectedDate={selectedDate}
            periodMode={periodMode}
            groupMode="type"
            saleMode={saleMode}
            highlightStatus={statusFilter}
            highlightToday={showToday}
            onToast={setToastMsg}
            onOpenDetail={openBookingDetail}
            onBookingAction={handleBookingAction}
            roomStatusOverrides={roomStatusOverrides}
            onOpenMaintenance={(room) => setModal({ type: "maintenance", room, existing: true })}
            onCreateRange={(room, checkIn, checkOut) =>
              setModal({ type: "walkin", room, defaultCheckIn: checkIn, defaultCheckOut: checkOut })
            }
          />
        ) : (
          <RoomStatusGrid
            rooms={ROOMS}
            bookings={bookings}
            selectedDate={selectedDate}
            density={viewMode === "grid-compact" ? "compact" : "detailed"}
            saleMode={saleMode}
            highlightStatus={statusFilter}
            onToast={setToastMsg}
            onOpenDetail={openBookingDetail}
            onBookingAction={handleBookingAction}
            roomStatusOverrides={roomStatusOverrides}
            onOpenMaintenance={(room) => setModal({ type: "maintenance", room, existing: true })}
          />
        )}
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
      {detailBooking && (
        <BookingDetailPanel
          key={`${detailBooking.id}-${detailTab}`}
          booking={detailBooking}
          group={detailGroup}
          groupBookings={detailGroupBookings}
          onSelectGroupBooking={(booking) => setDetailId(booking.id)}
          initialTab={detailTab}
          tab={detailBooking.stage === "inhouse" ? "inhouse" : "arrivals"}
          onClose={() => setDetailId(null)}
          onPrimaryAction={() => {
            setDetailId(null);
            setModal({ type: "checkin", booking: detailBooking });
          }}
          onAddServiceClick={() => setModal({ type: "addService", booking: detailBooking })}
          onPrintOption={(booking, asOf) => setInvoiceView({ booking, asOf: asOf === "invoice" ? "checkout" : asOf })}
          onOpenChangeDate={(booking) => setModal({ type: "changeDate", booking })}
          onOpenAssignRoom={(booking) => setModal({ type: "assignRoom", booking })}
          onUndoCheckIn={(booking) => {
            updateBooking(booking.id, { status: "arriving_today" });
            setToastMsg("Đã hoàn tác nhận phòng");
          }}
          onCheckout={(booking) => setModal({ type: "checkout", booking })}
          onOpenEditGuest={(booking, guestId) => setModal({ type: "editGuest", booking, guestId })}
          onRemoveGuest={(booking, guestId) => {
            updateBooking(booking.id, { guests: booking.guests.filter((guest) => guest.id !== guestId) });
            setToastMsg("Đã xoá khách");
          }}
          onRecordPayment={(booking, payment) => {
            updateBooking(booking.id, {
              paymentRecords: [
                ...(booking.paymentRecords || []),
                { id: `PAY-${Date.now()}`, date: new Date(), ...payment },
              ],
            });
            setToastMsg("Đã ghi nhận thanh toán");
          }}
          onOpenAddRoom={(booking) => setModal({ type: "addRoomToGroup", booking })}
          onOpenMergeRoom={(booking) => setModal({ type: "mergeRoomGroup", booking })}
          onOpenGroupDetail={setOpenGroupId}
          onToast={setToastMsg}
        />
      )}

      {modal?.type === "addRoomToGroup" && <AddRoomToGroupModal booking={modal.booking}
        bookings={bookings.map(toFrontDeskBooking)} roomOptions={ROOMS.map((room) => ({ room: room.number, typeId: room.typeKey }))}
        onClose={closeModal} onConfirm={addRoomToGroup} />}
      {modal?.type === "mergeRoomGroup" && <MergeRoomGroupModal booking={modal.booking}
        candidates={bookings.filter((item) => item.id !== modal.booking.id && item.room &&
          !["checked_out", "maintenance"].includes(item.status) && (!modal.booking.groupId || item.groupId !== modal.booking.groupId)).map(toFrontDeskBooking)}
        onClose={closeModal} onConfirm={mergeRoomGroup} />}
      {openGroupId && <LodgingGroupDetail group={lodgingGroups.find((group) => group.id === openGroupId)}
        bookings={bookings.map(toFrontDeskBooking)} onClose={() => setOpenGroupId(null)}
        onOpenBooking={(booking) => { setOpenGroupId(null); setDetailId(booking.id); }} />}
      {modal?.type === "checkin" && <CheckInModal booking={modal.booking} onClose={closeModal} onConfirm={(details) => {
        updateBooking(modal.booking.id, {
          status: "in_house", identity: details.identity,
          deposit: details.deposit, paymentMethod: details.paymentMethod,
          paymentRecords: details.deposit > 0 ? [...(modal.booking.paymentRecords || []), { id: `DEP-${Date.now()}`, date: new Date(), method: details.paymentMethod, amount: details.deposit, note: "Đặt cọc khi check-in" }] : modal.booking.paymentRecords || [],
        });
        closeModal();
        setToastMsg(`Đã nhận phòng cho ${modal.booking.guest.name}`);
      }} />}

      {["walkin", "reserve"].includes(modal?.type) && (
        <WalkInModal
          defaultRoomNumber={modal.room.number}
          defaultCheckIn={modal.defaultCheckIn || selectedDate}
          defaultCheckOut={modal.defaultCheckOut}
          onClose={closeModal}
          onConfirm={(payload) => {
            const code = Math.floor(45000 + Math.random() * 4999);
            const guestName = payload.guestName || "Khách Walk-in";
            setBookings((prev) => [
              ...prev,
              {
                id: `WI-${code}`,
                code,
                room: payload.roomNumber || modal.room.number,
                roomType: modal.room.typeKey,
                status: modal.type === "reserve" ? (payload.checkIn > today ? "booked_future" : "arriving_today") : "in_house",
                checkIn: payload.checkIn,
                checkOut: payload.checkOut,
                guest: guestName,
                guests: [{ id: `WI-${code}-g1`, name: guestName, flag: "VN" }],
                source: payload.source || "Walk-in",
                sourceGroup: "Trực tiếp",
                segment: "Khách lẻ",
                gender: "",
                nationality: "VN",
                adults: payload.adults,
                children: payload.children,
                notes: payload.note,
                identity: payload.identity,
                deposit: payload.deposit,
                paymentMethod: payload.paymentMethod,
                services: [],
                paymentRecords: [],
              },
            ]);
            setRoomStatusOverrides((prev) => {
              const next = { ...prev };
              delete next[modal.room.number];
              return next;
            });
            closeModal();
            setToastMsg(modal.type === "reserve" ? `Đã đặt phòng ${payload.roomNumber || modal.room.number}` : `Đã nhận phòng nhanh vào phòng ${payload.roomNumber || modal.room.number}`);
          }}
        />
      )}

      {modal?.type === "maintenance" && (
        <RoomMaintenanceModal
          room={modal.room}
          initialValue={maintenanceDetails[modal.room.number] || (modal.existing ? {} : null)}
          onClose={closeModal}
          onSave={(value) => {
            setMaintenanceDetails((prev) => ({ ...prev, [modal.room.number]: value }));
            setRoomStatusOverrides((prev) => ({ ...prev, [modal.room.number]: "maintenance" }));
            closeModal();
            setToastMsg(`Đã thiết lập sửa phòng ${modal.room.number}`);
          }}
          onDelete={() => {
            setMaintenanceDetails((prev) => {
              const next = { ...prev };
              delete next[modal.room.number];
              return next;
            });
            setRoomStatusOverrides((prev) => ({ ...prev, [modal.room.number]: "clean" }));
            closeModal();
            setToastMsg(`Đã xóa sửa phòng ${modal.room.number}`);
          }}
        />
      )}

      {modal?.type === "addService" && <AddServiceModal onClose={closeModal} onSave={saveServices} />}
      {modal?.type === "changeDate" && (
        <ChangeDateModal
          booking={modal.booking}
          onClose={closeModal}
          onSave={({ checkIn, checkOut }) => {
            updateBooking(modal.booking.id, { checkIn, checkOut });
            closeModal();
            setToastMsg("Đã cập nhật ngày ở");
          }}
        />
      )}
      {modal?.type === "assignRoom" && (
        <AssignRoomModal
          booking={modal.booking}
          title={modal.action === "transfer" ? "Chuyển phòng" : "Gán phòng"}
          onClose={closeModal}
          onSave={({ room, roomType }) => {
            updateBooking(modal.booking.id, { room, roomType });
            closeModal();
            setToastMsg(`Đã gán phòng ${room}`);
          }}
        />
      )}
      {modal?.type === "editGuest" && (
        <EditGuestModal
          booking={modal.booking}
          initialSelectedId={modal.guestId}
          onClose={closeModal}
          onSave={saveGuests}
        />
      )}
      {modal?.type === "copy" && (
        <CopyBookingModal
          booking={modal.booking}
          onClose={closeModal}
          onConfirm={(payload) => {
            const newId = `RM-${Date.now()}`;
            const sourceBooking = bookings.find((booking) => booking.id === modal.booking.id);
            setBookings((prev) => [
              ...prev,
              {
                ...sourceBooking,
                id: newId,
                code: Math.floor(45000 + Math.random() * 4999),
                room: payload.room,
                checkIn: payload.checkIn,
                checkOut: payload.checkOut,
                notes: payload.note,
                status: "booked_future",
                services: [],
                paymentRecords: [],
              },
            ]);
            closeModal();
            setToastMsg(`Đã sao chép đặt phòng sang phòng ${payload.room}`);
          }}
        />
      )}
      {["checkout", "cancel", "clean", "dirty", "unassign"].includes(modal?.type) && (
        <ConfirmActionModal
          variant={modal.type}
          booking={modal.booking}
          remaining={0}
          onClose={closeModal}
          onConfirm={() => {
            if (modal.type === "cancel") {
              setBookings((prev) => prev.filter((booking) => booking.id !== modal.booking.id));
              setDetailId(null);
              setToastMsg(`Đã hủy đặt phòng #${modal.booking.bookingCode}`);
            } else if (modal.type === "unassign") {
              updateBooking(modal.booking.id, { room: null });
              setRoomStatusOverrides((prev) => {
                const next = { ...prev };
                delete next[modal.booking.room];
                return next;
              });
              setDetailId(null);
              setToastMsg("Đã bỏ gán phòng");
            } else if (modal.type === "clean") {
              setRoomStatusOverrides((prev) => ({ ...prev, [modal.booking.room]: "clean" }));
              setToastMsg(`Đã chuyển phòng ${modal.booking.room} sang trạng thái Sạch`);
            } else if (modal.type === "dirty") {
              setRoomStatusOverrides((prev) => ({ ...prev, [modal.booking.room]: "dirty" }));
              setDetailId(null);
              setToastMsg(`Đã chuyển phòng ${modal.booking.room} sang trạng thái Phòng bẩn`);
            } else {
              updateBooking(modal.booking.id, { status: "checked_out" });
              setRoomStatusOverrides((prev) => ({ ...prev, [modal.booking.room]: "dirty" }));
              setDetailId(null);
              setToastMsg(`Đã trả phòng ${modal.booking.room}`);
            }
            closeModal();
          }}
        />
      )}
      {invoiceView && (
        <InvoiceModal
          booking={invoiceView.booking}
          asOfDefault={invoiceView.asOf}
          onClose={() => setInvoiceView(null)}
        />
      )}
    </div>
  );
}

export default RoomMap;
