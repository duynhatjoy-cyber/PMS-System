import { ChevronRight } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import { formatCurrency, formatTime } from "../../../utils/format";
import { KITCHEN_STATUS, orderTotal } from "../../../data/fnbData";
import styles from "../FnB.module.css";

function OrdersPanel({ tables, orders, onOpenOrder }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        message="Không có đơn hàng đang mở."
        hint='Mở đơn hàng mới bằng cách "Nhận khách" ở tab Sơ đồ bàn.'
      />
    );
  }

  return (
    <div className={styles.orderList}>
      {orders.map((order) => {
        const table = tables.find((t) => t.id === order.tableId);
        const itemCount = order.items.reduce((sum, line) => sum + line.qty, 0);
        const kitchenMeta = KITCHEN_STATUS[order.kitchenStatus];

        return (
          <button
            key={order.id}
            type="button"
            className={styles.orderCard}
            onClick={() => onOpenOrder(order.id)}
          >
            <div className={styles.orderCardLeft}>
              <span className={styles.orderCardTable}>
                Bàn {table ? table.number : "?"} {table ? `· ${table.zone}` : ""}
              </span>
              <span className={styles.orderCardMeta}>Mở lúc {formatTime(order.openedAt)}</span>
            </div>
            <div className={styles.orderCardRight}>
              <span
                className={styles.kitchenBadge}
                style={{ background: kitchenMeta.soft, color: kitchenMeta.color }}
              >
                {kitchenMeta.label}
              </span>
              <span className={styles.orderCardCount}>{itemCount} món</span>
              <span className={styles.orderCardTotal}>{formatCurrency(orderTotal(order))}</span>
              <ChevronRight size={16} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default OrdersPanel;
