import {
  AlertCircle,
  ArrowRightLeft,
  ArrowUpDown,
  BarChart3,
  BedDouble,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  ConciergeBell,
  CreditCard,
  Files,
  FileText,
  Landmark,
  LayoutGrid,
  LineChart,
  LogIn,
  LogOut,
  PackageMinus,
  PackagePlus,
  Percent,
  PlaneLanding,
  PlaneTakeoff,
  ShieldCheck,
  ShoppingCart,
  Sun,
  Tag,
  TrendingUp,
  TriangleAlert,
  Trash2,
  Truck,
  Users,
  History,
  WalletCards,
  Warehouse,
} from "lucide-react";

export const REPORT_CATEGORIES = [
  {
    id: "booking",
    title: "Báo cáo đặt phòng",
    icon: ClipboardList,
    items: [
      { id: "guests-arriving", label: "Khách sẽ đến", icon: PlaneLanding },
      { id: "guests-checked-in", label: "Khách đã đến", icon: LogIn },
      { id: "guests-departing", label: "Khách sẽ đi", icon: PlaneTakeoff },
      { id: "guests-checked-out", label: "Khách đã đi", icon: LogOut },
      { id: "guests-in-house", label: "Khách đang ở", icon: Users },
    ],
  },
  {
    id: "frontdesk",
    title: "Báo cáo Lễ tân",
    icon: ConciergeBell,
    items: [
      { id: "revenue-checked-out", label: "Doanh thu phòng đã trả", icon: FileText },
      { id: "daily-payment", label: "Thanh toán hàng ngày", icon: Calendar },
      { id: "breakfast-guests", label: "Khách ăn sáng", icon: Sun },
      { id: "debt-detail", label: "Công nợ chi tiết", icon: FileText },
      { id: "debt-summary", label: "Công nợ tổng hợp", icon: Files },
      { id: "customs-declaration", label: "Khai báo CA/Hải quan", icon: Landmark },
      { id: "discounts", label: "Giảm giá", icon: Tag },
      { id: "shift-handover", label: "Biên bản bàn giao ca", icon: ClipboardCheck },
    ],
  },
  {
    id: "control",
    title: "Báo cáo kiểm soát",
    icon: ShieldCheck,
    items: [
      { id: "card-history", label: "Lịch sử tạo thẻ", icon: CreditCard },
      { id: "deleted-invoices", label: "Xóa hóa đơn/dịch vụ", icon: Trash2 },
      { id: "user-actions", label: "Thao tác người dùng", icon: History },
    ],
  },
  {
    id: "management",
    title: "Báo cáo quản lý",
    icon: AlertCircle,
    items: [
      { id: "room-lock", label: "Sửa/khóa phòng", icon: AlertCircle },
      { id: "room-transfer", label: "Chuyển phòng", icon: ArrowRightLeft },
    ],
  },
  {
    id: "summary",
    title: "Báo cáo tổng hợp",
    icon: BarChart3,
    items: [
      { id: "occupancy", label: "Công suất phòng", icon: Percent },
      { id: "vacant-by-type", label: "Phòng trống theo loại", icon: LayoutGrid },
      { id: "revenue-detail", label: "Phân tích DT chi tiết", icon: Calendar },
      { id: "revenue-summary", label: "Phân tích DT tổng hợp", icon: BarChart3 },
    ],
  },
  {
    id: "housekeeping",
    title: "Báo cáo buồng phòng",
    icon: BedDouble,
    items: [
      { id: "service-usage", label: "Sử dụng dịch vụ", icon: ArrowUpDown },
      { id: "service-usage-summary", label: "Tổng hợp sử dụng DV", icon: Files },
    ],
  },
  {
    id: "finance",
    title: "Báo cáo thu chi",
    icon: WalletCards,
    items: [
      { id: "cashflow", label: "Tình hình thu chi", icon: ArrowUpDown },
      { id: "profit-loss", label: "Báo cáo lỗ lãi", icon: LineChart },
      { id: "profit-report", label: "Báo cáo lợi nhuận", icon: TrendingUp },
    ],
  },
  {
    id: "warehouse",
    title: "Báo cáo kho",
    icon: Warehouse,
    items: [
      { id: "stock-inout", label: "Nhập - Xuất - Tồn", icon: ArrowUpDown },
      { id: "stock-out-reason", label: "Xuất kho NVL theo lý do", icon: PackageMinus },
      { id: "stock-by-warehouse", label: "Tổng hợp NVL tồn theo kho", icon: Warehouse },
      { id: "stock-below-min", label: "NVL tồn kho dưới mức tối thiểu", icon: TriangleAlert },
      { id: "stock-in-report", label: "Báo cáo nhập kho nguyên vật liệu", icon: PackagePlus },
      { id: "purchase-by-material", label: "Mua hàng theo NVL", icon: ShoppingCart },
      { id: "purchase-by-supplier", label: "Mua hàng theo NCC", icon: Truck },
    ],
  },
];

export const REPORTS_BY_ID = Object.fromEntries(
  REPORT_CATEGORIES.flatMap((category) =>
    category.items.map((item) => [item.id, { ...item, categoryTitle: category.title }])
  )
);
