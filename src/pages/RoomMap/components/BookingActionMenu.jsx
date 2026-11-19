import { Fragment } from "react";
import {
  ArrowRightLeft,
  Calendar,
  CalendarPlus,
  Copy,
  Eye,
  LogIn,
  LogOut,
  RotateCcw,
  Sparkles,
  Brush,
  UserMinus,
  Wrench,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import styles from "../RoomMap.module.css";

// Icon giỏ hàng có dấu cộng (+) chuyên dụng đúng theo thiết kế mẫu
function ServiceBasketPlusIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="7.5" r="4.5" />
      <line x1="8" y1="5.5" x2="8" y2="9.5" />
      <line x1="6" y1="7.5" x2="10" y2="7.5" />
      <path d="M6 13h13.5l-1.5 7a1.5 1.5 0 0 1-1.5 1.2H9a1.5 1.5 0 0 1-1.5-1.2L6 13z" />
      <path d="M10 13l1.5-3" />
      <path d="M15.5 13l-1.5-3" />
    </svg>
  );
}

const VACANT_CLEAN_ACTIONS = [
  ["detail", "Chi tiết", Eye, false, "#0284c7", "#e0f2fe"],
  ["quickCheckin", "Nhận phòng nhanh", Zap, false, "#d97706", "#fef3c7"],
  ["reserve", "Đặt phòng", CalendarPlus, false, "#0284c7", "#e0f2fe"],
  ["dirty", "Làm bẩn phòng", Brush, true, "#d97706", "#fef3c7"],
  ["maintenance", "Sửa phòng", Wrench, false, "#475569", "#f1f5f9"],
];

const VACANT_DIRTY_ACTIONS = [
  ["detail", "Chi tiết", Eye, false, "#0284c7", "#e0f2fe"],
  ["quickCheckin", "Nhận phòng nhanh", Zap, false, "#d97706", "#fef3c7"],
  ["clean", "Làm sạch phòng", Sparkles, true, "#16a34a", "#dcfce7"],
  ["maintenance", "Sửa phòng", Wrench, false, "#475569", "#f1f5f9"],
];

const BOOKED_FUTURE_ACTIONS = [
  ["detail", "Chi tiết", Eye, false, "#0284c7", "#e0f2fe"],
  ["checkin", "Nhận phòng", LogIn, false, "#d97706", "#fef3c7"],
  ["unassign", "Bỏ gán phòng", UserMinus, false, "#475569", "#e2e8f0"],
  ["service", "Thêm dịch vụ", ServiceBasketPlusIcon, false, "#16a34a", "#dcfce7"],
  ["change", "Đổi ngày ở", Calendar, false, "#9333ea", "#f3e8ff"],
  ["transfer", "Chuyển phòng", ArrowRightLeft, false, "#4338ca", "#e0e7ff"],
  ["copy", "Sao chép", Copy, false, "#475569", "#f1f5f9"],
  ["cancel", "Hủy đặt phòng", XCircle, true, "#dc2626", "#fee2e2", true],
];

const ARRIVING_TODAY_ACTIONS = [
  ["detail", "Chi tiết", Eye, false, "#0284c7", "#e0f2fe"],
  ["checkin", "Nhận phòng", LogIn, false, "#d97706", "#fef3c7"],
  ["unassign", "Bỏ gán phòng", UserMinus, false, "#475569", "#e2e8f0"],
  ["service", "Thêm dịch vụ", ServiceBasketPlusIcon, false, "#16a34a", "#dcfce7"],
  ["change", "Đổi ngày ở", Calendar, false, "#9333ea", "#f3e8ff"],
  ["transfer", "Chuyển phòng", ArrowRightLeft, false, "#4338ca", "#e0e7ff"],
  ["copy", "Sao chép", Copy, false, "#475569", "#f1f5f9"],
  ["cancel", "Hủy đặt phòng", XCircle, true, "#dc2626", "#fee2e2", true],
];

const IN_HOUSE_CLEAN_ACTIONS = [
  ["detail", "Chi tiết", Eye, false, "#0284c7", "#e0f2fe"],
  ["checkout", "Trả phòng", LogOut, false, "#d97706", "#fef3c7"],
  ["service", "Thêm dịch vụ", ServiceBasketPlusIcon, false, "#16a34a", "#dcfce7"],
  ["change", "Đổi ngày ở", Calendar, false, "#9333ea", "#f3e8ff"],
  ["transfer", "Chuyển phòng", ArrowRightLeft, false, "#4338ca", "#e0e7ff"],
  ["undo", "Undo check-in", RotateCcw, false, "#ea580c", "#ffedd5"],
  ["copy", "Sao chép", Copy, false, "#475569", "#f1f5f9"],
  ["dirty", "Báo bẩn / Yêu cầu dọn", Brush, true, "#d97706", "#fef3c7"],
];

const IN_HOUSE_DIRTY_ACTIONS = [
  ["detail", "Chi tiết", Eye, false, "#0284c7", "#e0f2fe"],
  ["checkout", "Trả phòng", LogOut, false, "#d97706", "#fef3c7"],
  ["service", "Thêm dịch vụ", ServiceBasketPlusIcon, false, "#16a34a", "#dcfce7"],
  ["change", "Đổi ngày ở", Calendar, false, "#9333ea", "#f3e8ff"],
  ["transfer", "Chuyển phòng", ArrowRightLeft, false, "#4338ca", "#e0e7ff"],
  ["undo", "Undo check-in", RotateCcw, false, "#ea580c", "#ffedd5"],
  ["copy", "Sao chép", Copy, false, "#475569", "#f1f5f9"],
  ["clean", "Làm sạch phòng", Sparkles, true, "#16a34a", "#dcfce7"],
];

const OVERDUE_CLEAN_ACTIONS = [
  ["detail", "Chi tiết", Eye, false, "#0284c7", "#e0f2fe"],
  ["checkout", "Trả phòng", LogOut, false, "#d97706", "#fef3c7"],
  ["service", "Thêm dịch vụ", ServiceBasketPlusIcon, false, "#16a34a", "#dcfce7"],
  ["change", "Đổi ngày ở", Calendar, false, "#9333ea", "#f3e8ff"],
  ["transfer", "Chuyển phòng", ArrowRightLeft, false, "#4338ca", "#e0e7ff"],
  ["undo", "Undo check-in", RotateCcw, false, "#ea580c", "#ffedd5"],
  ["copy", "Sao chép", Copy, false, "#475569", "#f1f5f9"],
  ["dirty", "Báo bẩn / Yêu cầu dọn", Brush, true, "#d97706", "#fef3c7"],
];

const OVERDUE_DIRTY_ACTIONS = [
  ["detail", "Chi tiết", Eye, false, "#0284c7", "#e0f2fe"],
  ["checkout", "Trả phòng", LogOut, false, "#d97706", "#fef3c7"],
  ["service", "Thêm dịch vụ", ServiceBasketPlusIcon, false, "#16a34a", "#dcfce7"],
  ["change", "Đổi ngày ở", Calendar, false, "#9333ea", "#f3e8ff"],
  ["transfer", "Chuyển phòng", ArrowRightLeft, false, "#4338ca", "#e0e7ff"],
  ["undo", "Undo check-in", RotateCcw, false, "#ea580c", "#ffedd5"],
  ["copy", "Sao chép", Copy, false, "#475569", "#f1f5f9"],
  ["clean", "Làm sạch phòng", Sparkles, true, "#16a34a", "#dcfce7"],
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
      <button
        type="button"
        className={styles.actionMenuCloseBtn}
        onClick={onClose}
        aria-label="Đóng"
      >
        <X size={13} strokeWidth={2.5} />
      </button>

      <div className={styles.actionMenuItems}>
        {actions.map(([key, label, Icon, divider, color, bgColor, isDestructive]) => (
          <Fragment key={key}>
            {divider && <div className={styles.actionMenuDivider} />}
            <button
              type="button"
              className={`${styles.actionMenuItem} ${isDestructive ? styles.actionMenuItemDestructive : ""}`}
              onClick={() => choose(key, label)}
              role="menuitem"
            >
              <div
                className={styles.actionMenuIconBadge}
                style={{ backgroundColor: bgColor, color: color }}
              >
                <Icon size={17} strokeWidth={2} />
              </div>
              <span className={styles.actionMenuLabel}>{label}</span>
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default BookingActionMenu;
