import FrontDesk from "./pages/FrontDesk/FrontDesk";
import CreateInvoice from "./pages/CreateInvoice/CreateInvoice";
import Warehouse from "./pages/Warehouse/Warehouse";
import CashFund from "./pages/CashFund/CashFund";
import BankFund from "./pages/BankFund/BankFund";
import EmailCampaigns from "./pages/EmailCampaigns/EmailCampaigns";
import EmailHistory from "./pages/EmailHistory/EmailHistory";
import EmailConfig from "./pages/EmailConfig/EmailConfig";
import TaxFeeConfig from "./pages/TaxFeeConfig/TaxFeeConfig";
import Statistics from "./pages/Statistics/Statistics";
import Revenue from "./pages/Revenue/Revenue";
import Reports from "./pages/Reports/Reports";

// Mỗi mục trong Sidebar (xác định bằng "key" ghép từ section::item::child)
// được gắn với một URL riêng và component trang tương ứng.
export const ROUTES = [
  {
    key: "LỄ TÂN::Front Desk",
    path: "/le-tan/front-desk",
    Component: FrontDesk,
  },
  {
    key: "VẬN HÀNH::Quản lý bán hàng::Tạo hóa đơn",
    path: "/ban-hang/tao-hoa-don",
    Component: CreateInvoice,
  },
  {
    key: "VẬN HÀNH::Kho",
    path: "/van-hanh/kho",
    Component: Warehouse,
  },
  {
    key: "TÀI CHÍNH::Thu Chi::Quỹ tiền mặt",
    path: "/thu-chi/quy-tien-mat",
    Component: CashFund,
  },
  {
    key: "TÀI CHÍNH::Thu Chi::Quỹ tiền gửi",
    path: "/thu-chi/quy-tien-gui",
    Component: BankFund,
  },
  {
    key: "VẬN HÀNH::Email marketing::Chiến dịch email",
    path: "/email-marketing/chien-dich",
    Component: EmailCampaigns,
  },
  {
    key: "VẬN HÀNH::Email marketing::Lịch sử",
    path: "/email-marketing/lich-su",
    Component: EmailHistory,
  },
  {
    key: "VẬN HÀNH::Email marketing::Cấu hình",
    path: "/email-marketing/cau-hinh",
    Component: EmailConfig,
  },
  {
    key: "CÀI ĐẶT::Cấu hình PMS::Thuế/Phí",
    path: "/cau-hinh/thue-phi",
    Component: TaxFeeConfig,
  },
  {
    key: "PHÂN TÍCH::Thống kê",
    path: "/phan-tich/thong-ke",
    Component: Statistics,
  },
  {
    key: "PHÂN TÍCH::Doanh thu",
    path: "/phan-tich/doanh-thu",
    Component: Revenue,
  },
  {
    key: "PHÂN TÍCH::Báo cáo",
    path: "/phan-tich/bao-cao",
    Component: Reports,
  },
];

export const DEFAULT_ROUTE = ROUTES[0];

export const PATH_BY_KEY = Object.fromEntries(
  ROUTES.map((route) => [route.key, route.path])
);

export const KEY_BY_PATH = Object.fromEntries(
  ROUTES.map((route) => [route.path, route.key])
);
