import { useState } from "react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";

function EditPriceModal({ item, onClose, onConfirm }) {
  const [price, setPrice] = useState(item.price || "");
  const [qty, setQty] = useState(1);

  function handleConfirm() {
    const numericPrice = Number(price) || 0;
    const numericQty = Math.max(1, Number(qty) || 1);
    onConfirm({ ...item, price: numericPrice, qty: numericQty });
  }

  return (
    <SlidePanelShell title={item.name} onClose={onClose} width={360}>
      <div className={shared.row} style={{ marginBottom: 14 }}>
        <div className={shared.field}>
          <label className={shared.label}>Đơn giá (VND)</label>
          <input
            type="number"
            min="0"
            className={shared.input}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            autoFocus
          />
        </div>
        <div className={shared.field}>
          <label className={shared.label}>Số lượng</label>
          <input
            type="number"
            min="1"
            className={shared.input}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        className={`${shared.btn} ${shared.btnPrimary}`}
        style={{ width: "100%" }}
        onClick={handleConfirm}
      >
        Thêm vào hóa đơn
      </button>
    </SlidePanelShell>
  );
}

export default EditPriceModal;
