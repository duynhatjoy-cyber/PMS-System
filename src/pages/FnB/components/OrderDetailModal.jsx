import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { formatCurrency } from "../../../utils/format";
import { KITCHEN_STATUS_ORDER, KITCHEN_STEP_LABELS, orderTotal } from "../../../data/fnbData";
import styles from "../FnB.module.css";

function OrderDetailModal({ order, table, categories, setOrders, setTables, onCheckout, onClose, onToast }) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? null);

  function updateOrder(updater) {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updater(o) : o)));
  }

  function handleAddItem(menuItem) {
    updateOrder((o) => {
      const existing = o.items.find((line) => line.itemId === menuItem.id);
      if (existing) {
        return {
          ...o,
          items: o.items.map((line) =>
            line.itemId === menuItem.id ? { ...line, qty: line.qty + 1 } : line
          ),
        };
      }
      return {
        ...o,
        items: [...o.items, { itemId: menuItem.id, name: menuItem.name, price: menuItem.price, qty: 1 }],
      };
    });
  }

  function handleChangeQty(itemId, delta) {
    updateOrder((o) => ({
      ...o,
      items: o.items
        .map((line) => (line.itemId === itemId ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0),
    }));
  }

  function handleRemoveLine(itemId) {
    updateOrder((o) => ({ ...o, items: o.items.filter((line) => line.itemId !== itemId) }));
  }

  function handleCheckout() {
    onCheckout(order);
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status: "cleaning" } : t)));
    onToast(`Đã thanh toán bàn ${table.number} — ${formatCurrency(orderTotal(order))}`);
    onClose();
  }

  // kitchenStatus chỉ tiến lên khi bấm nút bước bếp — thêm/bớt món sau khi đã
  // gửi bếp không tự lùi trạng thái lại "Chưa gửi bếp".
  function handleAdvanceKitchen() {
    const currentIndex = KITCHEN_STATUS_ORDER.indexOf(order.kitchenStatus);
    const nextStatus = KITCHEN_STATUS_ORDER[currentIndex + 1];
    updateOrder((o) => ({ ...o, kitchenStatus: nextStatus }));
    onToast(
      nextStatus === "sent"
        ? `Đã gửi bếp — Bàn ${table.number}`
        : `Bếp đã xong — Bàn ${table.number} sẵn sàng phục vụ`
    );
  }

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];
  const total = orderTotal(order);
  const stepIndex = KITCHEN_STATUS_ORDER.indexOf(order.kitchenStatus);
  const isReadyToPay = stepIndex === KITCHEN_STATUS_ORDER.length - 1;

  return (
    <SlidePanelShell
      title={`Đơn hàng — Bàn ${table ? table.number : "?"}`}
      onClose={onClose}
      width={620}
      footer={
        <div className={styles.orderFooter}>
          <div>
            <span className={styles.orderTotalLabel}>Tổng cộng</span>
            <span className={styles.orderTotalValue}>{formatCurrency(total)}</span>
          </div>
          <div className={styles.orderFooterActions}>
            <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
              Đóng
            </button>
            <button
              type="button"
              className={`${shared.btn} ${shared.btnPrimary}`}
              disabled={order.items.length === 0}
              onClick={isReadyToPay ? handleCheckout : handleAdvanceKitchen}
            >
              {isReadyToPay ? "Thanh toán" : KITCHEN_STEP_LABELS[stepIndex]}
            </button>
          </div>
        </div>
      }
    >
      <div className={shared.stack}>
        <div className={styles.kitchenSteps}>
          {KITCHEN_STEP_LABELS.map((label, i) => (
            <div key={label} className={styles.kitchenStepGroup}>
              <div className={styles.kitchenStep}>
                <span
                  className={`${styles.kitchenStepDot} ${
                    i < stepIndex ? styles.kitchenStepDotDone : i === stepIndex ? styles.kitchenStepDotActive : ""
                  }`}
                />
                <span className={`${styles.kitchenStepLabel} ${i <= stepIndex ? styles.kitchenStepLabelActive : ""}`}>
                  {label}
                </span>
              </div>
              {i < KITCHEN_STEP_LABELS.length - 1 && (
                <span className={`${styles.kitchenStepConnector} ${i < stepIndex ? styles.kitchenStepConnectorDone : ""}`} />
              )}
            </div>
          ))}
        </div>

        <div className={styles.lineList}>
          {order.items.length === 0 ? (
            <div className={styles.emptyLines}>Chưa có món nào — chọn món bên dưới để thêm vào đơn.</div>
          ) : (
            order.items.map((line) => (
              <div key={line.itemId} className={styles.lineRow}>
                <span className={styles.lineName}>{line.name}</span>
                <span className={styles.linePrice}>{formatCurrency(line.price)}</span>
                <div className={styles.qtyStepper}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => handleChangeQty(line.itemId, -1)}
                  >
                    <Minus size={12} />
                  </button>
                  <span className={styles.qtyValue}>{line.qty}</span>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => handleChangeQty(line.itemId, 1)}
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className={styles.lineTotal}>{formatCurrency(line.price * line.qty)}</span>
                <button
                  type="button"
                  className={styles.lineRemoveBtn}
                  onClick={() => handleRemoveLine(line.itemId)}
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.pickerSectionTitle}>Thêm món từ thực đơn</div>
        <div className={styles.chipRow}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.chip} ${cat.id === activeCategory?.id ? styles.chipActive : ""}`}
              onClick={() => setActiveCategoryId(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className={styles.pickerList}>
          {(activeCategory?.items ?? []).map((item) => (
            <div
              key={item.id}
              className={`${styles.pickerRow} ${!item.available ? styles.pickerRowUnavailable : ""}`}
            >
              <span>
                <span className={styles.pickerName}>{item.name}</span>
                <span className={styles.pickerPrice}>{formatCurrency(item.price)}</span>
              </span>
              <button
                type="button"
                className={styles.pickerAddBtn}
                disabled={!item.available}
                title={item.available ? "Thêm vào đơn" : "Hết hàng"}
                onClick={() => handleAddItem(item)}
              >
                <Plus size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </SlidePanelShell>
  );
}

export default OrderDetailModal;
