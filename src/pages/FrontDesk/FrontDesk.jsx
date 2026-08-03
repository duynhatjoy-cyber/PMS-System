import { useMemo, useState } from "react";
import {
  BedDouble,
  Brush,
  CalendarClock,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  IdCard,
  Info,
  LogIn,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Unlink,
} from "lucide-react";
import {
  selectArrivals,
  selectInhouse,
  selectDepartures,
  computeStats,
} from "../../data/frontDeskData";
import { addDays, formatCurrency, formatDMY } from "../../utils/format";
import { computeBill } from "../../utils/billing";
import StatCard from "./components/StatCard";
import ReservationTable from "./components/ReservationTable";
import Pagination from "./components/Pagination";
import Toast from "./components/Toast";
import WalkInModal from "./modals/WalkInModal";
import ConfirmActionModal from "./modals/ConfirmActionModal";
import ChangeDateModal from "./modals/ChangeDateModal";
import AssignRoomModal from "./modals/AssignRoomModal";
import CopyBookingModal from "./modals/CopyBookingModal";
import AddServiceModal from "./modals/AddServiceModal";
import EditGuestModal from "./modals/EditGuestModal";
import InvoiceModal from "./modals/InvoiceModal";
import BookingDetailPanel from "./panels/BookingDetailPanel";
import styles from "./FrontDesk.module.css";
import { useBookings } from "../../context/BookingsContext";

const TABS = [
  { key: "arrivals", label: "Sẽ đến" },
  { key: "departures", label: "Sẽ đi" },
  { key: "inhouse", label: "Đang ở" },
];

function FrontDesk() {
  const { today, bookings, setBookings } = useBookings();
  const [selectedDate, setSelectedDate] = useState(today);
  const [view, setView] = useState("today");
  const [activeTab, setActiveTab] = useState("inhouse");
  const [search, setSearch] = useState("");
  const [guestFilter, setGuestFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modal, setModal] = useState(null); // { type, booking }
  const [detailBooking, setDetailBooking] = useState(null); // { id, tab }
  const [invoiceView, setInvoiceView] = useState(null); // { booking, asOf }
  const [toastMsg, setToastMsg] = useState("");

  const filterKey = `${activeTab}|${search}|${guestFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  function toast(message) {
    setToastMsg(message);
  }

  function updateBooking(id, patch) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function removeBooking(id) {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }
  function addBooking(booking) {
    setBookings((prev) => [booking, ...prev]);
  }

  const arrivals = useMemo(() => selectArrivals(bookings), [bookings]);
  const departures = useMemo(() => selectDepartures(bookings, selectedDate), [bookings, selectedDate]);
  const inhouse = useMemo(() => selectInhouse(bookings), [bookings]);
  const stats = useMemo(() => computeStats(bookings, selectedDate), [bookings, selectedDate]);

  const listByTab = { arrivals, departures, inhouse };
  const currentList = listByTab[activeTab];

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const gq = guestFilter.trim().toLowerCase();
    return currentList.filter((b) => {
      const matchesSearch =
        !q ||
        b.guest.name.toLowerCase().includes(q) ||
        String(b.bookingCode).includes(q) ||
        (b.room || "").toLowerCase().includes(q);
      const matchesGuest = !gq || b.guest.name.toLowerCase().includes(gq);
      return matchesSearch && matchesGuest;
    });
  }, [currentList, search, guestFilter]);

  const pagedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, page, pageSize]);

  const detailFullBooking = detailBooking ? bookings.find((b) => b.id === detailBooking.id) : null;

  function closeModal() {
    setModal(null);
  }

  function openDetail(booking, tab) {
    setDetailBooking({ id: booking.id, tab });
  }

  // 3 nhóm thao tác (ngăn cách bằng divider): xem/nhận phòng → chỉnh sửa
  // thông tin lưu trú → thao tác huỷ/tiện ích. Mỗi nhóm tự ẩn khi rỗng, divider
  // chỉ chèn giữa 2 nhóm thực sự có item (không phụ thuộc tên item cụ thể).
  function getMenuItems(booking, tab) {
    const group1 = [
      { key: "detail", label: "Chi tiết", icon: Info, onClick: () => openDetail(booking, tab) },
      ...(tab === "arrivals"
        ? [{ key: "checkin", label: "Nhận phòng", icon: LogIn, onClick: () => handlePrimaryAction(booking, tab) }]
        : []),
      ...(booking.assigned
        ? [
            {
              key: "unassign",
              label: "Bỏ gán phòng",
              icon: Unlink,
              onClick: () => setModal({ type: "unassign", booking, tab }),
            },
          ]
        : []),
    ];

    const group2 = [
      ...(booking.assigned
        ? [
            {
              key: "editGuest",
              label: "Sửa khách",
              icon: IdCard,
              onClick: () => setModal({ type: "editGuest", booking, tab }),
            },
            {
              key: "changeDate",
              label: "Đổi ngày/khách",
              icon: CalendarClock,
              onClick: () => setModal({ type: "changeDate", booking, tab }),
            },
            {
              key: "addService",
              label: "Thêm dịch vụ",
              icon: ShoppingBag,
              onClick: () => setModal({ type: "addService", booking, tab }),
            },
          ]
        : []),
      {
        key: "assign",
        label: booking.assigned ? "Chuyển phòng" : "Gán phòng",
        icon: BedDouble,
        onClick: () => setModal({ type: "assignRoom", booking, tab }),
      },
    ];

    const group3 = [
      {
        key: "cancel",
        label: "Hủy đặt phòng",
        icon: CalendarX,
        danger: true,
        onClick: () => setModal({ type: "cancel", booking, tab }),
      },
      { key: "copy", label: "Sao chép", icon: Copy, onClick: () => setModal({ type: "copy", booking, tab }) },
      ...(booking.assigned
        ? [{ key: "clean", label: "Làm sạch phòng", icon: Brush, onClick: () => setModal({ type: "clean", booking, tab }) }]
        : []),
      {
        key: "bookingList",
        label: "Danh sách đặt phòng",
        icon: ClipboardList,
        onClick: () => toast("Danh sách đặt phòng theo phòng sẽ có ở bản cập nhật tiếp theo"),
      },
    ];

    return [group1, group2, group3]
      .filter((group) => group.length > 0)
      .flatMap((group, i) => (i === 0 ? group : [{ ...group[0], divider: true }, ...group.slice(1)]));
  }

  function handlePrintOption(booking, option) {
    const asOf = option === "invoice" ? "checkout" : option;
    setInvoiceView({ booking, asOf });
  }

  function handleCancelConfirm() {
    const code = modal.booking.bookingCode;
    removeBooking(modal.booking.id);
    if (detailBooking?.id === modal.booking.id) setDetailBooking(null);
    closeModal();
    toast(`Đã hủy đặt phòng #${code}`);
  }

  function handleUnassignConfirm() {
    updateBooking(modal.booking.id, { assigned: false, room: null });
    closeModal();
    toast("Đã bỏ gán phòng");
  }

  function handleCleanConfirm() {
    toast(`Đã chuyển phòng ${modal.booking.room} sang trạng thái Sạch`);
    closeModal();
  }

  function handleChangeDateSave({ checkIn, checkOut }) {
    updateBooking(modal.booking.id, { checkIn, checkOut });
    closeModal();
    toast("Đã cập nhật ngày ở");
  }

  function handleAssignRoomSave({ room, roomType }) {
    updateBooking(modal.booking.id, { room, roomType, assigned: true });
    closeModal();
    toast(`Đã gán phòng ${room}`);
  }

  function handleCopyConfirm(payload) {
    const newBooking = {
      id: `CP-${Date.now()}`,
      stage: "arrival",
      room: payload.room,
      roomType: payload.roomType,
      bookingCode: Math.floor(40000 + Math.random() * 9000),
      guest: modal.booking.guest,
      guests: modal.booking.guests,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      stayCount: 0,
      adults: modal.booking.adults,
      children: modal.booking.children,
      assigned: true,
      confirmed: true,
      paid: false,
      source: modal.booking.source,
      notes: payload.note,
      services: [],
      paymentRecords: [],
    };
    addBooking(newBooking);
    closeModal();
    toast(`Đã sao chép đặt phòng sang phòng ${payload.room}`);
  }

  function handleAddServiceSave(cartItems) {
    updateBooking(modal.booking.id, { services: [...modal.booking.services, ...cartItems] });
    closeModal();
    toast("Đã thêm dịch vụ vào phòng");
  }

  function handleEditGuestSave(guestsList) {
    const primaryName = guestsList[0]?.name?.trim();
    updateBooking(modal.booking.id, {
      guests: guestsList.map((g) => ({ id: g.id, name: g.name, flag: "VN" })),
      ...(primaryName ? { guest: { ...modal.booking.guest, name: primaryName } } : {}),
    });
    closeModal();
    toast("Đã cập nhật thông tin khách");
  }

  function handleUndoCheckIn(booking) {
    updateBooking(booking.id, { stage: "arrival" });
    setDetailBooking(null);
    toast("Đã hoàn tác nhận phòng");
  }

  function handleCheckoutConfirm() {
    const booking = modal.booking;
    removeBooking(booking.id);
    if (detailBooking?.id === booking.id) setDetailBooking(null);
    closeModal();
    toast(`Đã trả phòng ${booking.room}`);
  }

  function handleRemoveGuest(booking, guestId) {
    updateBooking(booking.id, { guests: (booking.guests || []).filter((g) => g.id !== guestId) });
    toast("Đã xoá khách");
  }

  function handleRecordPayment(booking, payment) {
    const record = { id: `PAY-${Date.now()}`, date: new Date(), ...payment };
    updateBooking(booking.id, { paymentRecords: [...(booking.paymentRecords || []), record] });
    toast("Đã ghi nhận thanh toán");
  }

  function handleWalkInConfirm(payload) {
    const code = Math.floor(45000 + Math.random() * 4999);
    const newBooking = {
      id: `WI-${code}`,
      stage: "arrival",
      room: null,
      roomType: payload.roomType.name,
      bookingCode: code,
      guest: { name: payload.guestName || "Khách Walk-in", flag: "VN" },
      guests: [{ id: `WI-${code}-g1`, name: payload.guestName || "Khách Walk-in", flag: "VN" }],
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      stayCount: 0,
      adults: payload.adults,
      children: payload.children,
      assigned: false,
      confirmed: true,
      paid: false,
      source: "Walk-in",
      notes: payload.note,
      services: [],
      paymentRecords: [],
    };
    addBooking(newBooking);
    setModal(null);
    setActiveTab("arrivals");
    toast("Đã tạo đặt phòng Walk-in mới");
  }

  function handlePrimaryAction(booking, tab) {
    if (!booking.assigned) {
      setModal({ type: "assignRoom", booking, tab });
      return;
    }
    updateBooking(booking.id, { stage: "inhouse", confirmed: true });
    setDetailBooking(null);
    toast(`Đã nhận phòng cho ${booking.guest.name}`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Front Desk</h1>
          <div className={styles.segmented}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${view === "today" ? styles.segmentActive : ""}`}
              onClick={() => setView("today")}
            >
              Hôm nay
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${view === "floorplan" ? styles.segmentActive : ""}`}
              onClick={() => setView("floorplan")}
            >
              Sơ đồ
            </button>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.dateNav}>
            <button
              type="button"
              className={styles.navIconBtn}
              title="Ngày trước"
              onClick={() => setSelectedDate((d) => addDays(d, -1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span className={styles.dateLabel}>{formatDMY(selectedDate)}</span>
            <button
              type="button"
              className={styles.navIconBtn}
              title="Ngày sau"
              onClick={() => setSelectedDate((d) => addDays(d, 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            className={styles.navIconBtn}
            title="Làm mới"
            onClick={() => setSelectedDate(today)}
          >
            <RefreshCw size={16} />
          </button>

          <button
            type="button"
            className={styles.walkInBtn}
            onClick={() => setModal({ type: "walkin" })}
          >
            <Plus size={16} /> Walk-in
          </button>
        </div>
      </div>

      {view === "floorplan" ? (
        <div className={styles.floorplanPlaceholder}>
          <div className={styles.floorplanTitle}>Sơ đồ phòng</div>
          <div className={styles.floorplanSub}>
            Chế độ xem theo sơ đồ đang được hoàn thiện — quay lại tab "Hôm nay" để thao tác đặt phòng.
          </div>
        </div>
      ) : (
        <>
          <div className={styles.statsRow}>
            <StatCard
              label="Khách sẽ đến hôm nay"
              value={stats.arrivals.count}
              valueClassName={styles.valueBlue}
              hint={`${stats.arrivals.confirmed} đã xác nhận · ${stats.arrivals.pendingCheckin} chờ check-in`}
            />
            <StatCard
              label="Khách sẽ đi hôm nay"
              value={stats.departures.count}
              valueClassName={styles.valueOrange}
              hint={`${stats.departures.unpaid} chưa thanh toán · ${stats.departures.completed} đã hoàn tất`}
            />
            <StatCard
              label="Khách đang ở"
              value={stats.inhouse.count}
              valueClassName={styles.valueGreen}
              hint={`${stats.inhouse.count} phòng đang có khách`}
            />
            <StatCard
              label="Phòng sẵn sàng"
              value={stats.roomsReady.count}
              hint={`${stats.roomsReady.needsCleaning} cần dọn · ${stats.roomsReady.outOfOrder} phòng OOO`}
            />
          </div>

          <div className={styles.statsRowSecondary}>
            <StatCard
              label="Công suất hôm nay"
              value={`${stats.occupancy.percent}%`}
              hint={`${stats.occupancy.occupied} / ${stats.occupancy.total} phòng đang sử dụng`}
            />
            <StatCard
              label="Doanh thu hôm nay"
              value={formatCurrency(stats.revenueToday)}
              valueClassName={styles.valuePrimary}
              hint="Tổng folio đã ghi nhận trong ngày"
            />
            <StatCard
              label="ADR"
              value={formatCurrency(stats.adr)}
              hint="Giá phòng bình quân"
            />
          </div>

          <div className={styles.tableCard}>
            <div className={styles.toolbar}>
              <div className={styles.tabList}>
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                    <span className={styles.tabCount}>{listByTab[tab.key].length}</span>
                  </button>
                ))}
              </div>

              <div className={styles.searchGroup}>
                <div className={styles.searchBox}>
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Tìm tên khách, phòng, mã đặt"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  className={styles.guestFilterBox}
                  placeholder="Tên khách"
                  value={guestFilter}
                  onChange={(e) => setGuestFilter(e.target.value)}
                />
              </div>
            </div>

            <ReservationTable
              tab={activeTab}
              rows={pagedList}
              onOpenGuest={(booking) => openDetail(booking, activeTab)}
              getMenuItems={(booking) => getMenuItems(booking, activeTab)}
              onPrintOption={handlePrintOption}
            />

            <Pagination
              page={page}
              pageSize={pageSize}
              total={filteredList.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </>
      )}

      {modal?.type === "walkin" && (
        <WalkInModal
          defaultCheckIn={selectedDate}
          onClose={closeModal}
          onConfirm={handleWalkInConfirm}
        />
      )}

      {(modal?.type === "cancel" ||
        modal?.type === "unassign" ||
        modal?.type === "clean" ||
        modal?.type === "checkout") && (
        <ConfirmActionModal
          variant={modal.type}
          booking={modal.booking}
          remaining={modal.type === "checkout" ? computeBill(modal.booking).remaining : 0}
          onClose={closeModal}
          onConfirm={
            modal.type === "cancel"
              ? handleCancelConfirm
              : modal.type === "unassign"
              ? handleUnassignConfirm
              : modal.type === "clean"
              ? handleCleanConfirm
              : handleCheckoutConfirm
          }
        />
      )}

      {modal?.type === "changeDate" && (
        <ChangeDateModal booking={modal.booking} onClose={closeModal} onSave={handleChangeDateSave} />
      )}

      {modal?.type === "assignRoom" && (
        <AssignRoomModal booking={modal.booking} onClose={closeModal} onSave={handleAssignRoomSave} />
      )}

      {modal?.type === "copy" && (
        <CopyBookingModal booking={modal.booking} onClose={closeModal} onConfirm={handleCopyConfirm} />
      )}

      {modal?.type === "addService" && (
        <AddServiceModal onClose={closeModal} onSave={handleAddServiceSave} />
      )}

      {modal?.type === "editGuest" && (
        <EditGuestModal
          booking={modal.booking}
          initialSelectedId={modal.guestId}
          onClose={closeModal}
          onSave={handleEditGuestSave}
        />
      )}

      {detailFullBooking && (
        <BookingDetailPanel
          booking={detailFullBooking}
          tab={detailBooking.tab}
          onClose={() => setDetailBooking(null)}
          onPrimaryAction={() => handlePrimaryAction(detailFullBooking, detailBooking.tab)}
          onAddServiceClick={() => setModal({ type: "addService", booking: detailFullBooking, tab: detailBooking.tab })}
          onPrintOption={handlePrintOption}
          onOpenChangeDate={(booking) => setModal({ type: "changeDate", booking, tab: detailBooking.tab })}
          onOpenAssignRoom={(booking) => setModal({ type: "assignRoom", booking, tab: detailBooking.tab })}
          onUndoCheckIn={handleUndoCheckIn}
          onCheckout={(booking) => setModal({ type: "checkout", booking, tab: detailBooking.tab })}
          onOpenEditGuest={(booking, guestId) => setModal({ type: "editGuest", booking, tab: detailBooking.tab, guestId })}
          onRemoveGuest={handleRemoveGuest}
          onRecordPayment={handleRecordPayment}
          onToast={toast}
        />
      )}

      {invoiceView && (
        <InvoiceModal
          booking={invoiceView.booking}
          asOfDefault={invoiceView.asOf}
          onClose={() => setInvoiceView(null)}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default FrontDesk;
