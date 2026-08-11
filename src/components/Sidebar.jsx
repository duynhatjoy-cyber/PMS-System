import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { KEY_BY_PATH, PATH_BY_KEY } from "../routesConfig";
import { usePinnedReports } from "../context/PinnedReportsContext";
import { REPORTS_BY_ID } from "../pages/Reports/data/reportsData";
import {
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  Users,
  UserRound,
  BedDouble,
  Utensils,
  ConciergeBell,
  Box,
  ShoppingCart,
  FileText,
  BookOpen,
  WalletCards,
  MessageSquare,
  TriangleAlert,
  BookOpenText,
  ChartNoAxesColumn,
  DollarSign,
  Mail,
  Settings,
  SlidersHorizontal,
  CreditCard,
  CircleUserRound,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

const REPORTS_ITEM_KEY = "PHÂN TÍCH::Báo cáo";

const menuSections = [
  {
    title: "LỄ TÂN",
    items: [
      { label: "Front Desk", icon: CalendarDays },
      { label: "Đặt phòng", icon: ClipboardList },
      { label: "Danh sách đặt phòng", icon: ClipboardList },
      { label: "Sơ đồ phòng", icon: LayoutGrid },
      { label: "Khách", icon: Users },
      { label: "Nhóm", icon: UserRound },
    ],
  },
  {
    title: "VẬN HÀNH",
    items: [
      { label: "Buồng phòng", icon: BedDouble },
      { label: "F&B", icon: Utensils },
      { label: "Dịch vụ", icon: ConciergeBell },
      {
        label: "Kho",
        icon: Box,
        expandable: true,
        children: ["Kho", "Mua hàng"],
      },
      {
        label: "Quản lý bán hàng",
        icon: ShoppingCart,
        expandable: true,
        children: ["Tạo hóa đơn"],
      },
      {
        label: "Email marketing",
        icon: Mail,
        expandable: true,
        children: ["Chiến dịch email", "Lịch sử", "Cấu hình"],
      },
    ],
  },
  {
    title: "TÀI CHÍNH",
    items: [
      { label: "Hóa đơn", icon: FileText },
      { label: "Hóa đơn điện tử", icon: FileText },
      { label: "Sổ sách", icon: BookOpen },
      {
        label: "Thu Chi",
        icon: WalletCards,
        expandable: true,
        children: ["Quỹ tiền mặt", "Quỹ tiền gửi"],
      },
    ],
  },
  {
    title: "AI CONCIERGE",
    items: [
      { label: "Hội thoại", icon: MessageSquare },
      { label: "Cần hỗ trợ", icon: TriangleAlert },
      { label: "Cơ sở kiến thức", icon: BookOpenText },
    ],
  },
  {
    title: "PHÂN TÍCH",
    items: [
      { label: "Thống kê", icon: ChartNoAxesColumn },
      { label: "Doanh thu", icon: DollarSign },
      { label: "Báo cáo", icon: ChartNoAxesColumn },
    ],
  },

  {
    title: "CÀI ĐẶT",
    items: [
      { label: "Cài đặt", icon: Settings },
      {
        label: "Cấu hình PMS",
        icon: SlidersHorizontal,
        expandable: true,
        children: [
          "Thông tin khách sạn",
          // "Cấu hình vận hành",
          "Cấu hình Phòng & Giá",
          // "Phòng & Giá",
          "Quản lý đặt phòng",
          "Cấu hình giờ",
          "Dịch vụ",
          "Thuế/Phí",
          "Máy in & Mẫu in",
          "Tài khoản & phân quyền",
          "Tỷ giá",
          "Thanh toán QR code",
          "Thu chi",
          "Quản lý kho",
        ],
      },
      { label: "Nhân viên", icon: Users },
      { label: "Thanh toán", icon: CreditCard },
      { label: "Hồ sơ", icon: CircleUserRound },
    ],
  },
];

function SidebarItem({
  itemKey,
  item,
  isOpen,
  isActive,
  activeKey,
  onSelect,
  onSelectChild,
}) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.expandable && item.children);

  return (
    <>
      <div
        className={`sidebar-item ${isActive ? "active" : ""}`}
        onClick={() => onSelect(itemKey, hasChildren)}
      >
        <div className="sidebar-item-left">
          <Icon size={18} strokeWidth={1.7} />
          <span>{item.label}</span>
        </div>

        {item.expandable &&
          (hasChildren ? (
            isOpen ? (
              <ChevronDown size={15} />
            ) : (
              <ChevronRight size={15} />
            )
          ) : (
            <ChevronRight size={15} />
          ))}
      </div>

      {hasChildren && isOpen && (
        <div className="submenu">
          {item.children.map((child) => {
            const isPlain = typeof child === "string";
            const childLabel = isPlain ? child : child.label;
            const ChildIcon = isPlain ? null : child.icon;
            const childKey = `${itemKey}::${childLabel}`;

            return (
              <div
                className={`submenu-item ${
                  activeKey === childKey ? "active" : ""
                }`}
                key={childLabel}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectChild(childKey);
                }}
              >
                {ChildIcon && <ChildIcon size={14} strokeWidth={1.8} />}
                {childLabel}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function getParentKey(key) {
  const parts = key.split("::");
  return parts.length > 2 ? parts.slice(0, 2).join("::") : null;
}

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pinnedIds } = usePinnedReports();
  const routeKey = KEY_BY_PATH[location.pathname];
  const pinnedReportChildren = pinnedIds.map((id) => REPORTS_BY_ID[id]).filter(Boolean);

  const [activeKey, setActiveKey] = useState(
    routeKey || "LỄ TÂN::Front Desk"
  );
  const [openKey, setOpenKey] = useState(
    getParentKey(routeKey || "LỄ TÂN::Front Desk")
  );

  // Đồng bộ mục đang chọn/submenu đang mở theo URL hiện tại
  // (ví dụ khi tải lại trang hoặc dùng nút back/forward của trình duyệt).
  const [syncedRouteKey, setSyncedRouteKey] = useState(routeKey);
  if (routeKey && routeKey !== syncedRouteKey) {
    setSyncedRouteKey(routeKey);
    setActiveKey(routeKey);
    setOpenKey(getParentKey(routeKey));
  }

  // Vừa ghim thêm một báo cáo mới: tự sổ submenu "Báo cáo" ra để người dùng
  // thấy ngay kết quả, không phải tự bấm mở lại.
  const [syncedPinCount, setSyncedPinCount] = useState(pinnedReportChildren.length);
  if (pinnedReportChildren.length !== syncedPinCount) {
    const didAddPin = pinnedReportChildren.length > syncedPinCount;
    setSyncedPinCount(pinnedReportChildren.length);
    if (didAddPin) {
      setOpenKey(REPORTS_ITEM_KEY);
    }
  }

  function goToRoute(key) {
    const path = PATH_BY_KEY[key];
    if (path) navigate(path);
  }

  function handleSelect(itemKey, hasChildren) {
    setActiveKey(itemKey);

    if (hasChildren) {
      // Accordion: chọn mục có submenu sẽ đóng mục lớn đang mở khác lại,
      // chỉ 1 submenu được sổ xuống tại một thời điểm.
      setOpenKey((prev) => (prev === itemKey ? null : itemKey));
    } else {
      setOpenKey(null);
      goToRoute(itemKey);
    }
  }

  function handleSelectChild(childKey) {
    setActiveKey(childKey);

    // Các báo cáo đã ghim đều trỏ về trang Báo cáo, không có route riêng.
    if (childKey.startsWith(`${REPORTS_ITEM_KEY}::`)) {
      goToRoute(REPORTS_ITEM_KEY);
      return;
    }

    goToRoute(childKey);
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">♟</div>
        <div className="logo-text">bellhop</div>
      </div>

      <div className="sidebar-scroll">
        {menuSections.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <div className="sidebar-section-title">{section.title}</div>

            {section.items.map((item) => {
              const itemKey = `${section.title}::${item.label}`;

              const effectiveItem =
                itemKey === REPORTS_ITEM_KEY && pinnedReportChildren.length > 0
                  ? {
                      ...item,
                      expandable: true,
                      children: [
                        ...pinnedReportChildren.map((r) => ({ label: r.label, icon: r.icon })),
                        { label: "Xem thêm báo cáo", icon: MoreHorizontal },
                      ],
                    }
                  : item;

              return (
                <SidebarItem
                  key={itemKey}
                  itemKey={itemKey}
                  item={effectiveItem}
                  isOpen={openKey === itemKey}
                  isActive={activeKey === itemKey}
                  activeKey={activeKey}
                  onSelect={handleSelect}
                  onSelectChild={handleSelectChild}
                />
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
