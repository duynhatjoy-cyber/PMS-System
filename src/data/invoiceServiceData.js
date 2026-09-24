// Mock catalog for the "Tạo hóa đơn" screen. Items with `editable: true` have
// no fixed price (matches the pencil-icon cards in the reference design) —
// selecting one prompts for a custom price before it's added to the cart.
import { STOCK_SUMMARY_ROWS } from "./warehouseData";

export const SERVICE_TABS = ["Tất cả", "Minibar", "Dịch vụ khác", "Dịch vụ mở rộng"];

// Short corner-badge label per category, shown on each ServiceCard so a mixed
// "Tất cả" grid still reads at a glance which category an item belongs to.
export const CATEGORY_BADGES = {
  Minibar: { label: "MB", tone: "minibar" },
  "Dịch vụ khác": { label: "DVK", tone: "other" },
  "Dịch vụ mở rộng": { label: "DVM", tone: "extra" },
};

// Cross-cutting item groups (independent of category) used by the "Nhóm"
// filter dropdown — e.g. an item can be Minibar + Đồ uống at the same time.
export const SERVICE_GROUPS = ["Tất cả", "Đồ uống", "Thức ăn", "Vật dụng khác", "Dịch vụ"];

export const SERVICE_CATALOG = [
  { id: "coca-pepsi", name: "Coca/Pepsi", price: 15000, category: "Minibar", group: "Đồ uống" },
  { id: "nuoc-suoi-550", name: "Nước suối 550ml", price: 10000, category: "Minibar", group: "Đồ uống" },
  { id: "nuoc-suoi-nho", name: "Nước suối nhỏ", price: 0, category: "Minibar", group: "Đồ uống" },
  { id: "sprite-7up", name: "Sprite/7Up", price: 15000, category: "Minibar", group: "Đồ uống" },
  { id: "tra-o-long", name: "Trà Ô Long", price: 15000, category: "Minibar", group: "Đồ uống" },
  { id: "mi-ly", name: "Mì ly", price: 15000, category: "Minibar", group: "Thức ăn" },
  { id: "dau-phong", name: "Đậu phộng", price: 12000, category: "Minibar", group: "Thức ăn" },
  { id: "phu-thu-phong-khac", name: "Phụ thu tiền phòng khác", price: 0, category: "Dịch vụ khác", editable: true, group: "Dịch vụ" },
  { id: "don-phong-them", name: "Dọn phòng thêm", price: 100000, category: "Dịch vụ khác", editable: true, group: "Dịch vụ" },
  { id: "thue-xe-may", name: "Thuê xe máy", price: 0, category: "Dịch vụ khác", group: "Dịch vụ" },
  { id: "muon-boardgame", name: "Mượn Boardgame", price: 0, category: "Dịch vụ khác", editable: true, group: "Dịch vụ" },
  { id: "banh-khoai-tay-poca", name: "Bánh khoai tây Poca", price: 15000, category: "Minibar", group: "Thức ăn" },
  { id: "tien-dien", name: "Tiền điện", price: 0, category: "Dịch vụ khác", editable: true, group: "Dịch vụ" },
  { id: "bao-cao-su", name: "Bao cao su", price: 45000, category: "Minibar", group: "Vật dụng khác" },
  { id: "muon-ban-ui", name: "Mượn Bàn Ủi", price: 0, category: "Dịch vụ khác", editable: true, group: "Dịch vụ" },
  { id: "xuat-hoa-don-do", name: "Xuất hóa đơn đỏ (VAT)", price: 0, category: "Dịch vụ khác", editable: true, group: "Dịch vụ" },
  { id: "nang-cap-phong", name: "Nâng cấp phòng", price: 0, category: "Dịch vụ mở rộng", editable: true, group: "Dịch vụ" },
  { id: "bao-cao-su-durex", name: "Bao cao su Durex", price: 70000, category: "Minibar", group: "Vật dụng khác" },
  { id: "banh-cua", name: "Bánh Cua", price: 10000, category: "Minibar", group: "Thức ăn" },
  { id: "banh-mix", name: "Bánh Mix", price: 15000, category: "Minibar", group: "Thức ăn" },
  { id: "tra-fuze", name: "Trà Fuze", price: 15000, category: "Minibar", group: "Đồ uống" },
  { id: "sting-rockstar", name: "Sting/Rockstar", price: 15000, category: "Minibar", group: "Đồ uống" },
];

// Services are matched to their warehouse stock by name (there's no shared id
// between the sales catalog and MATERIAL_RECORDS yet) so ServiceCard can show
// "tồn kho" for items that are actually tracked as materials.
const STOCK_BY_NAME = new Map(
  STOCK_SUMMARY_ROWS.map((row) => [row.material.trim().toLowerCase(), row.closing])
);

export function getServiceStock(name) {
  return STOCK_BY_NAME.get(name.trim().toLowerCase());
}

export const PAYMENT_METHODS = ["Tiền mặt", "Chuyển khoản", "Thẻ / Quẹt máy POS" , "Công nợ"];
export const CURRENCIES = ["VND", "USD"];
export const COUNTER_OPTIONS = ["Thanh toán tại quầy", "Thanh toán online"];
