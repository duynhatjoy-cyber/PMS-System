import { useState } from "react";
import { Box, LayoutGrid, Receipt, BookOpen } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import TableMapPanel from "./components/TableMapPanel";
import OrdersPanel from "./components/OrdersPanel";
import OrderDetailModal from "./components/OrderDetailModal";
import MenuPanel from "./components/MenuPanel";
import IngredientsPanel from "./components/IngredientsPanel";
import {
  INITIAL_CATEGORIES,
  INITIAL_INGREDIENTS,
  INITIAL_ORDERS,
  INITIAL_TABLES,
  applyUsage,
  computeOrderUsage,
} from "../../data/fnbData";
import styles from "./FnB.module.css";

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

  function handleOrderCheckout(order) {
    setIngredients((prev) => applyUsage(prev, computeOrderUsage(order, categories)));
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
