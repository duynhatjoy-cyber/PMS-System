import {
  BedDouble,
  Brush,
  CalendarClock,
  CalendarX,
  ClipboardCheck,
  Copy,
  Info,
  LogIn,
  LogOut,
  ShoppingBag,
  Unlink,
  Undo2,
  Wrench,
} from "lucide-react";
import styles from "../RoomMap.module.css";

const VACANT_CLEAN_ACTIONS = [
  ["detail", "Chi tiết", Info],
  ["quickCheckin", "Nhận phòng nhanh", ClipboardCheck],
  ["reserve", "Đặt phòng", CalendarClock],
  ["dirty", "Làm bẩn phòng", Brush, true],
  ["maintenance", "Sửa phòng", Wrench],
];

const VACANT_DIRTY_ACTIONS = [
  ["detail", "Chi tiết", Info],
  ["quickCheckin", "Nhận phòng nhanh", ClipboardCheck],
  ["clean", "Làm sạch phòng", Brush, true],
  ["maintenance", "Sửa phòng", Wrench],
];

const BOOKED_FUTURE_ACTIONS = [
  ["detail", "Chi tiết", Info],
  ["checkin", "Nhận phòng", LogIn],
  ["unassign", "Bỏ gán phòng", Unlink],
  ["service", "Thêm dịch vụ", ShoppingBag, true],
  ["change", "Đổi ngày ở", CalendarClock],
  ["transfer", "Chuyển phòng", BedDouble],
  ["cancel", "Hủy đặt phòng", CalendarX, true],
  ["copy", "Sao chép", Copy],
];

const ARRIVING_TODAY_ACTIONS = [
  ["detail", "Chi tiết", Info],
  ["checkin", "Nhận phòng", LogIn],
  ["unassign", "Bỏ gán phòng", Unlink],
  ["service", "Thêm dịch vụ", ShoppingBag, true],
  ["change", "Đổi ngày ở", CalendarClock],
  ["transfer", "Chuyển phòng", BedDouble],
  ["cancel", "Hủy đặt phòng", CalendarX, true],
  ["copy", "Sao chép", Copy],
];

const IN_HOUSE_CLEAN_ACTIONS = [
  ["detail", "Chi tiết", Info],
  ["checkout", "Trả phòng", LogOut],
  ["service", "Thêm dịch vụ", ShoppingBag, true],
  ["change", "Đổi ngày ở", CalendarClock],
  ["transfer", "Chuyển phòng", BedDouble],
  ["undo", "Undo check-in", Undo2, true],
  ["copy", "Sao chép", Copy],
  ["dirty", "Báo bẩn / Yêu cầu dọn", Brush, true],
];

const IN_HOUSE_DIRTY_ACTIONS = [
  ["detail", "Chi tiết", Info],
  ["checkout", "Trả phòng", LogOut],
  ["service", "Thêm dịch vụ", ShoppingBag, true],
  ["change", "Đổi ngày ở", CalendarClock],
  ["transfer", "Chuyển phòng", BedDouble],
  ["undo", "Undo check-in", Undo2, true],
  ["copy", "Sao chép", Copy],
  ["clean", "Làm sạch phòng", Brush, true],
];

const OVERDUE_CLEAN_ACTIONS = [
  ["detail", "Chi tiết", Info],
  ["checkout", "Trả phòng", LogOut],
  ["service", "Thêm dịch vụ", ShoppingBag, true],
  ["change", "Đổi ngày ở", CalendarClock],
  ["transfer", "Chuyển phòng", BedDouble],
  ["undo", "Undo check-in", Undo2, true],
  ["copy", "Sao chép", Copy],
  ["dirty", "Báo bẩn / Yêu cầu dọn", Brush, true],
];

const OVERDUE_DIRTY_ACTIONS = [
  ["detail", "Chi tiết", Info],
  ["checkout", "Trả phòng", LogOut],
  ["service", "Thêm dịch vụ", ShoppingBag, true],
  ["change", "Đổi ngày ở", CalendarClock],
  ["transfer", "Chuyển phòng", BedDouble],
  ["undo", "Undo check-in", Undo2, true],
  ["copy", "Sao chép", Copy],
  ["clean", "Làm sạch phòng", Brush, true],
];

const ACTIONS_BY_STATUS = {
  vacant: { clean: VACANT_CLEAN_ACTIONS, dirty: VACANT_DIRTY_ACTIONS },
  booked_future: { clean: BOOKED_FUTURE_ACTIONS, dirty: BOOKED_FUTURE_ACTIONS },
  arriving_today: { clean: ARRIVING_TODAY_ACTIONS, dirty: ARRIVING_TODAY_ACTIONS },
  in_house: { clean: IN_HOUSE_CLEAN_ACTIONS, dirty: IN_HOUSE_DIRTY_ACTIONS },
  overdue: { clean: OVERDUE_CLEAN_ACTIONS, dirty: OVERDUE_DIRTY_ACTIONS },
  checked_out: { clean: VACANT_CLEAN_ACTIONS, dirty: VACANT_DIRTY_ACTIONS },
};

function BookingActionMenu({ menu, menuRef, onClose, onDetail, onAction, onToast }) {
  if (!menu) return null;
  const { booking, room, status, housekeeping } = menu;
  const roomStatus = !booking || status === "checked_out" ? "vacant" : status;
  const cleanliness = housekeeping === "dirty" ? "dirty" : "clean";
  const actions = ACTIONS_BY_STATUS[roomStatus]?.[cleanliness] ?? VACANT_CLEAN_ACTIONS;

  function choose(key, label) {
    onClose();
    if (key === "detail" && booking) {
      onDetail(booking, room);
      return;
    }
    if (onAction) {
      onAction(key, booking, room, menu.range);
      return;
    }
    onToast(`${label}: chức năng đang được phát triển`);
  }

  return (
    <div
      ref={menuRef}
      className={styles.actionMenu}
      style={{ left: menu.x, top: menu.y }}
      role="menu"
      aria-label="Thao tác đặt phòng"
    >
      <div className={styles.actionMenuItems}>
        {actions.map(([key, label, Icon, divider]) => (
          <button
            key={key}
            type="button"
            className={`${styles.actionMenuItem} ${divider ? styles.actionMenuDivider : ""}`}
            onClick={() => choose(key, label)}
            role="menuitem"
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default BookingActionMenu;
