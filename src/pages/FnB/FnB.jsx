import { useState } from "react";
import { Box, LayoutGrid, Receipt, BookOpen } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import TableMapPanel from "./components/TableMapPanel";
import OrdersPanel from "./components/OrdersPanel";
import OrderDetailModal from "./components/OrderDetailModal";
import MenuPanel from "./components/MenuPanel";
import IngredientsPanel from "./components/IngredientsPanel";
import { usePurchaseReport } from "../../context/PurchaseReportContext";
import generateTicketNo from "../Warehouse/ticketNo";
import {
  INITIAL_CATEGORIES,
  INITIAL_INGREDIENTS,
  INITIAL_ORDERS,
  INITIAL_TABLES,
  applyUsage,
  computeOrderUsage,
  isOverThreshold,
} from "../../data/fnbData";
import styles from "./FnB.module.css";

// 1 dòng nguyên vật liệu — cùng khoá name/unit/neededQty/stockQty/requestedQty
// với AddReportModal (Mua hàng > Báo hàng) để phiếu tạo từ F&B hiện đúng
// bảng nguyên vật liệu như phiếu tạo tay, không phải chỉ 1 dòng note chữ.
// qtyOverride dùng khi người dùng tự nhập số lượng ở CreateReportModal, thay
// vì suy ra từ ngưỡng cảnh báo/hao hụt hiện tại.
function buildReportLine(ing, qtyOverride) {
  const qty = qtyOverride ?? (ing.threshold || Number(ing.usedQty.toFixed(2)) || 0);
  return { name: ing.name, unit: ing.unit, neededQty: qty, stockQty: 0, requestedQty: qty };
}

// Nhiều nguyên vật liệu cần báo cùng lúc → gộp thành 1 phiếu nhiều dòng,
// không tách mỗi nguyên vật liệu 1 phiếu riêng.
function buildReportTicket(lines, note) {
  const ticketNo = generateTicketNo("BH");
  return { id: ticketNo, ticketNo, date: new Date(), status: "Chưa thực hiện", note, lines };
}

function hasOpenTicket(ing, reportRows) {
  return reportRows.some(
    (r) => r.status !== "Đã thực hiện" && (r.lines || []).some((l) => l.name === ing.name)
  );
}

// Vượt ngưỡng cảnh báo lúc thanh toán → tự tạo phiếu Báo hàng (Mua hàng >
// Báo hàng), gộp mọi nguyên liệu vừa vượt ngưỡng vào 1 phiếu. Không tạo lại
// cho nguyên liệu đã có phiếu chưa xử lý, để tránh bắn liên tục 1 cảnh báo
// mỗi lần có đơn mới dùng nguyên liệu đó. Cùng những nguyên liệu này còn
// được điền sẵn khi mở CreateReportModal (nút "+ Tạo phiếu báo hàng") để
// người dùng xem lại/sửa trước khi lưu, thay vì tạo phiếu ngay không qua soát.
function buildLowStockTicket(ingredients, reportRows) {
  const overIngredients = ingredients.filter((ing) => isOverThreshold(ing) && !hasOpenTicket(ing, reportRows));
  if (overIngredients.length === 0) return null;
  const names = overIngredients.map((ing) => `"${ing.name}"`).join(", ");
  return buildReportTicket(
    overIngredients.map((ing) => buildReportLine(ing)),
    `Nguyên liệu ${names} đã vượt ngưỡng cảnh báo hao hụt.`
  );
}

const TABS = [
  { key: "tables", label: "Sơ đồ bàn", icon: LayoutGrid },
  { key: "orders", label: "Đơn hàng", icon: Receipt },
  { key: "menu", label: "Thực đơn", icon: BookOpen },
  { key: "ingredients", label: "Nguyên vật liệu", icon: Box },
];

function FnB() {
  const [tabKey, setTabKey] = useState(TABS[0].key);
  const [toastMsg, setToastMsg] = useState("");

  const [tables, setTables] = useState(INITIAL_TABLES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const { reportRows, setReportRows } = usePurchaseReport();

  function handleOrderCheckout(order) {
    const updated = applyUsage(ingredients, computeOrderUsage(order, categories));
    setIngredients(updated);

    const ticket = buildLowStockTicket(updated, reportRows);
    if (ticket) setReportRows((prev) => [ticket, ...prev]);
  }

  // Tạo phiếu tự chọn nhiều nguyên liệu + số lượng đề nghị từ CreateReportModal
  // (nút "+ Tạo phiếu báo hàng") — độc lập với ngưỡng cảnh báo, phục vụ khi
  // nhân viên muốn báo hàng loạt theo ý mình thay vì chờ hệ thống phát hiện.
  function handleCreateCustomReport(selections, note) {
    const lines = selections.map(({ ingredient, qty }) => buildReportLine(ingredient, qty));
    setReportRows((prev) => [buildReportTicket(lines, note), ...prev]);
    setToastMsg(`Đã tạo phiếu báo hàng cho ${lines.length} nguyên liệu`);
  }

  const activeOrder = orders.find((o) => o.id === activeOrderId) || null;
  const activeOrderTable = activeOrder ? tables.find((t) => t.id === activeOrder.tableId) : null;

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>F&amp;B — Nhà hàng</h1>
        <p className={styles.subtitle}>
          Quản lý sơ đồ bàn, đơn gọi món đang phục vụ và thực đơn nhà hàng của khách sạn.
        </p>
      </div>

      <div className={styles.topTabs}>
        {TABS.map((t) => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              className={`${styles.topTab} ${t.key === tabKey ? styles.topTabActive : ""}`}
              onClick={() => setTabKey(t.key)}
            >
              <TabIcon size={16} />
              {t.label}
              {t.key === "orders" && orders.length > 0 && (
                <span className={styles.tabCount}>{orders.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {tabKey === "tables" && (
        <TableMapPanel
          tables={tables}
          setTables={setTables}
          orders={orders}
          setOrders={setOrders}
          onOpenOrder={setActiveOrderId}
          onToast={setToastMsg}
        />
      )}

      {tabKey === "orders" && (
        <OrdersPanel tables={tables} orders={orders} onOpenOrder={setActiveOrderId} />
      )}

      {tabKey === "menu" && (
        <MenuPanel categories={categories} setCategories={setCategories} ingredients={ingredients} onToast={setToastMsg} />
      )}

      {tabKey === "ingredients" && (
        <IngredientsPanel
          ingredients={ingredients}
          setIngredients={setIngredients}
          categories={categories}
          setCategories={setCategories}
          onToast={setToastMsg}
          onCreateCustomReport={handleCreateCustomReport}
        />
      )}


      {activeOrder && (
        <OrderDetailModal
          order={activeOrder}
          table={activeOrderTable}
          categories={categories}
          setOrders={setOrders}
          setTables={setTables}
          onCheckout={handleOrderCheckout}
          onClose={() => setActiveOrderId(null)}
          onToast={setToastMsg}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default FnB;
