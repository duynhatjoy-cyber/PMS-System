import { createIdSequence } from "../utils/id";

const nextId = createIdSequence();
export const nextDraftId = nextId;

// 4 trạng thái bàn — màu lấy từ token hệ thống (khớp "Sơ đồ phòng"), không tự tạo màu mới.
export const TABLE_STATUS = {
  vacant: { key: "vacant", label: "Trống", color: "var(--fd-success)", soft: "var(--fd-success-soft)" },
  occupied: { key: "occupied", label: "Có khách", color: "var(--fd-status-blue)", soft: "var(--fd-status-blue-soft)" },
  reserved: { key: "reserved", label: "Đã đặt", color: "var(--fd-warning)", soft: "var(--fd-warning-soft)" },
  cleaning: { key: "cleaning", label: "Đang dọn", color: "var(--fd-status-gray)", soft: "var(--fd-status-gray-soft)" },
};

export const TABLE_STATUS_LEGEND = ["vacant", "occupied", "reserved", "cleaning"];

// 3 bước xử lý đơn tại bếp, đi trước bước thanh toán: Gửi bếp → Bếp xong → Thanh toán.
export const KITCHEN_STATUS = {
  pending: { key: "pending", label: "Chưa gửi bếp", color: "var(--fd-text-muted)", soft: "var(--fd-surface-hover)" },
  sent: { key: "sent", label: "Đang chế biến", color: "var(--fd-status-blue)", soft: "var(--fd-status-blue-soft)" },
  ready: { key: "ready", label: "Bếp đã xong", color: "var(--fd-success)", soft: "var(--fd-success-soft)" },
};

export const KITCHEN_STATUS_ORDER = ["pending", "sent", "ready"];
export const KITCHEN_STEP_LABELS = ["Gửi bếp", "Bếp xong", "Thanh toán"];

export const ZONES = ["Tầng 1", "Tầng 2", "Sân vườn"];

function makeTable(number, capacity, zone, status) {
  return { id: nextId("tbl"), number, capacity, zone, status };
}

export const INITIAL_TABLES = [
  makeTable("01", 2, "Tầng 1", "vacant"),
  makeTable("02", 4, "Tầng 1", "occupied"),
  makeTable("03", 4, "Tầng 1", "occupied"),
  makeTable("04", 6, "Tầng 1", "reserved"),
  makeTable("05", 2, "Tầng 1", "vacant"),
  makeTable("06", 4, "Tầng 2", "vacant"),
  makeTable("07", 8, "Tầng 2", "cleaning"),
  makeTable("08", 4, "Tầng 2", "vacant"),
  makeTable("S1", 4, "Sân vườn", "occupied"),
  makeTable("S2", 2, "Sân vườn", "vacant"),
];

// Nguyên vật liệu chế biến — riêng cho bếp F&B, khác với MATERIALS (vật tư/
// minibar) trong warehouseData.js vì đó là danh sách chung cả khách sạn, không
// phải nguyên liệu nấu ăn. usedQty là hao hụt lũy kế, cộng dồn mỗi khi một đơn
// có món dùng nguyên liệu này được thanh toán (xem computeOrderUsage/applyUsage).
function makeIngredient(name, unit) {
  return { id: nextId("ing"), name, unit, usedQty: 0 };
}

export const INITIAL_INGREDIENTS = [
  makeIngredient("Gạo", "kg"),
  makeIngredient("Tôm", "kg"),
  makeIngredient("Mực", "kg"),
  makeIngredient("Thịt heo", "kg"),
  makeIngredient("Thịt bò", "kg"),
  makeIngredient("Thịt gà", "kg"),
  makeIngredient("Trứng", "Quả"),
  makeIngredient("Bánh tráng", "Cái"),
  makeIngredient("Bánh phở", "kg"),
  makeIngredient("Bún", "kg"),
  makeIngredient("Rau sống", "kg"),
  makeIngredient("Hành lá", "kg"),
  makeIngredient("Hành tây", "kg"),
  makeIngredient("Tỏi", "kg"),
  makeIngredient("Mật ong", "Lít"),
  makeIngredient("Dầu ăn", "Lít"),
];

function findIngredient(name) {
  const ing = INITIAL_INGREDIENTS.find((i) => i.name === name);
  if (!ing) throw new Error(`Chưa khai báo nguyên vật liệu "${name}"`);
  return ing;
}

// { ingredientId, qty } — qty tính cho 1 phần của món.
function recipeLine(name, qty) {
  return { ingredientId: findIngredient(name).id, qty };
}

function makeMenuItem(name, price, available = true, recipe = []) {
  return { id: nextId("mi"), name, price, available, recipe };
}

function makeCategory(name, items = []) {
  return { id: nextId("cat"), name, items };
}

export const INITIAL_CATEGORIES = [
  makeCategory("Khai vị", [
    makeMenuItem("Gỏi cuốn tôm thịt", 45000, true, [
      recipeLine("Bánh tráng", 4),
      recipeLine("Tôm", 0.06),
      recipeLine("Thịt heo", 0.04),
      recipeLine("Bún", 0.05),
      recipeLine("Rau sống", 0.03),
    ]),
    makeMenuItem("Súp hải sản", 55000),
    makeMenuItem("Chả giò", 50000),
  ]),
  makeCategory("Món chính", [
    makeMenuItem("Cơm chiên hải sản", 85000, true, [
      recipeLine("Gạo", 0.2),
      recipeLine("Tôm", 0.05),
      recipeLine("Mực", 0.05),
      recipeLine("Trứng", 1),
      recipeLine("Hành lá", 0.01),
      recipeLine("Dầu ăn", 0.02),
    ]),
    makeMenuItem("Phở bò tái", 65000, true, [
      recipeLine("Bánh phở", 0.25),
      recipeLine("Thịt bò", 0.08),
      recipeLine("Hành tây", 0.02),
      recipeLine("Hành lá", 0.01),
    ]),
    makeMenuItem("Gà nướng mật ong", 120000, true, [
      recipeLine("Thịt gà", 0.3),
      recipeLine("Mật ong", 0.03),
      recipeLine("Tỏi", 0.01),
      recipeLine("Dầu ăn", 0.01),
    ]),
    makeMenuItem("Cá lóc kho tộ", 95000, false),
  ]),
  makeCategory("Đồ uống", [
    makeMenuItem("Coca / Pepsi", 20000),
    makeMenuItem("Trà đá", 10000),
    makeMenuItem("Nước ép cam", 35000),
    makeMenuItem("Bia Sài Gòn", 25000),
  ]),
  makeCategory("Tráng miệng", [
    makeMenuItem("Chè khúc bạch", 30000, false),
    makeMenuItem("Trái cây theo mùa", 40000),
  ]),
];

function findItem(name) {
  for (const cat of INITIAL_CATEGORIES) {
    const item = cat.items.find((i) => i.name === name);
    if (item) return item;
  }
  return null;
}

function orderLine(name, qty) {
  const item = findItem(name);
  return { itemId: item.id, name: item.name, price: item.price, qty };
}

function minutesAgo(n) {
  return new Date(Date.now() - n * 60000);
}

function makeOrder(tableNumber, openedMinutesAgo, lines, kitchenStatus = "pending") {
  const table = INITIAL_TABLES.find((t) => t.number === tableNumber);
  return {
    id: nextId("ord"),
    tableId: table.id,
    openedAt: minutesAgo(openedMinutesAgo),
    items: lines,
    kitchenStatus,
  };
}

export const INITIAL_ORDERS = [
  makeOrder(
    "02",
    18,
    [orderLine("Gỏi cuốn tôm thịt", 2), orderLine("Cơm chiên hải sản", 1), orderLine("Coca / Pepsi", 2)],
    "sent"
  ),
  makeOrder("03", 6, [orderLine("Phở bò tái", 1), orderLine("Trà đá", 1)], "pending"),
  makeOrder(
    "S1",
    32,
    [orderLine("Bia Sài Gòn", 3), orderLine("Gà nướng mật ong", 1), orderLine("Chả giò", 2)],
    "ready"
  ),
];

export function orderTotal(order) {
  return order.items.reduce((sum, line) => sum + line.price * line.qty, 0);
}

function findMenuItem(categories, itemId) {
  for (const cat of categories) {
    const item = cat.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return null;
}

// Công thức chế biến (recipe) của mỗi món x số lượng đã bán trong đơn = nguyên
// vật liệu hao hụt. Trả về map { ingredientId: qty } cho 1 đơn.
export function computeOrderUsage(order, categories) {
  const usage = {};
  for (const line of order.items) {
    const menuItem = findMenuItem(categories, line.itemId);
    for (const r of menuItem?.recipe ?? []) {
      usage[r.ingredientId] = (usage[r.ingredientId] ?? 0) + r.qty * line.qty;
    }
  }
  return usage;
}

// Cộng dồn usage (từ computeOrderUsage) vào usedQty lũy kế của từng nguyên vật liệu.
export function applyUsage(ingredients, usage) {
  return ingredients.map((ing) =>
    usage[ing.id] ? { ...ing, usedQty: ing.usedQty + usage[ing.id] } : ing
  );
}
