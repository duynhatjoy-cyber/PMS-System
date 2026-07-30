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

function makeMenuItem(name, price, available = true) {
  return { id: nextId("mi"), name, price, available };
}

function makeCategory(name, items = []) {
  return { id: nextId("cat"), name, items };
}

export const INITIAL_CATEGORIES = [
  makeCategory("Khai vị", [
    makeMenuItem("Gỏi cuốn tôm thịt", 45000),
    makeMenuItem("Súp hải sản", 55000),
    makeMenuItem("Chả giò", 50000),
  ]),
  makeCategory("Món chính", [
    makeMenuItem("Cơm chiên hải sản", 85000),
    makeMenuItem("Phở bò tái", 65000),
    makeMenuItem("Gà nướng mật ong", 120000),
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
