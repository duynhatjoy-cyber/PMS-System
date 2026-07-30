import {
  BedDouble,
  Brush,
  CalendarClock,
  CalendarX,
  ClipboardCheck,
  Copy,
  Info,
  List,
  LogIn,
  LogOut,
  ShoppingBag,
  Unlink,
  Undo2,
  Wrench,
} from "lucide-react";
import styles from "../RoomMap.module.css";

const VACANT_ACTIONS = [
  ["quickCheckin", "Nhận phòng nhanh", ClipboardCheck],
  ["dirty", "Phòng bẩn", Brush, true],
  ["maintenance", "Sửa phòng", Wrench],
  ["list", "Danh sách đặt phòng", List, true],
];

const DIRTY_ACTIONS = [
  ["quickCheckin", "Nhận phòng nhanh", ClipboardCheck],
  ["clean", "Làm sạch phòng", Brush, true],
  ["maintenance", "Sửa phòng", Wrench],
  ["list", "Danh sách đặt phòng", List, true],
];

const BOOKED_ACTIONS = [
  ["detail", "Chi tiết", Info],
  ["checkin", "Nhận phòng", LogIn],
  ["unassign", "Bỏ gán phòng", Unlink],
  ["service", "Thêm dịch vụ", ShoppingBag, true],
  ["change", "Đổi ngày ở", CalendarClock],
  ["transfer", "Chuyển phòng", BedDouble],
  ["cancel", "Hủy đặt phòng", CalendarX, true],
  ["copy", "Sao chép", Copy],
  ["clean", "Làm sạch phòng", Brush, true],
  ["list", "Danh sách đặt phòng", List],
];

const INHOUSE_ACTIONS = [
  ["detail", "Chi tiết", Info],
  ["checkout", "Trả phòng", LogOut],
  ["service", "Thêm dịch vụ", ShoppingBag, true],
  ["change", "Đổi ngày ở", CalendarClock],
  ["transfer", "Chuyển phòng", BedDouble],
  ["undo", "Undo check-in", Undo2, true],
  ["copy", "Sao chép", Copy],
  ["clean", "Làm sạch phòng", Brush, true],
  ["list", "Danh sách đặt phòng", List],
];

function BookingActionMenu({ menu, menuRef, onClose, onDetail, onAction, onToast }) {
  if (!menu) return null;
  const { booking, room, status } = menu;
  const actions =
    status === "dirty"
      ? DIRTY_ACTIONS
      : !booking
      ? VACANT_ACTIONS
      : ["in_house", "overdue"].includes(status)
      ? INHOUSE_ACTIONS
      : BOOKED_ACTIONS;

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
