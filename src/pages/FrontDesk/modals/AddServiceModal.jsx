import { useMemo, useState } from "react";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import SlidePanelShell from "./SlidePanelShell";
import { formatCurrency } from "../../../utils/format";
import shared from "./shared.module.css";
import styles from "./AddServiceModal.module.css";

const CATALOG = {
  Minibar: [
    { id: "coke", name: "Coca/Pepsi", price: 15000 },
    { id: "water", name: "Nước suối nhỏ", price: 15000 },
    { id: "oolong", name: "Trà Ô Long", price: 15000 },
    { id: "fuze", name: "Trà Fuze", price: 15000 },
  ],
  "Dịch vụ khác": [
    { id: "laundry", name: "Giặt ủi", price: 50000 },
    { id: "latecheckout", name: "Trả phòng muộn", price: 100000 },
  ],
  "Đền bù": [
    { id: "towel", name: "Đền khăn tắm", price: 120000 },
    { id: "remote", name: "Đền remote TV", price: 200000 },
  ],
  "Dịch vụ phòng": [
    { id: "breakfast", name: "Ăn sáng", price: 90000 },
    { id: "airport", name: "Đưa đón sân bay", price: 350000 },
  ],
  "Dịch vụ mở rộng": [
    { id: "spa", name: "Spa 60 phút", price: 450000 },
    { id: "tour", name: "Tour nửa ngày", price: 600000 },
  ],
};

const TABS = Object.keys(CATALOG);

function AddServiceModal({ onClose, onSave }) {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);

  const items = useMemo(() => {
    const list = CATALOG[activeTab];
    if (!query.trim()) return list;
    return list.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));
  }, [activeTab, query]);

  function addItem(item) {
    setCart((prev) => {
      const existing = prev.find((line) => line.id === item.id);
      if (existing) {
        return prev.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function changeQty(id, delta) {
    setCart((prev) =>
      prev
        .map((line) => (line.id === id ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0)
    );
  }

  const total = cart.reduce((sum, line) => sum + line.price * line.qty, 0);

  return (
    <SlidePanelShell title="Thêm dịch vụ" onClose={onClose} width={760}>
      <div className={styles.searchBar}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Tìm kiếm dịch vụ"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.split}>
        <div className={styles.list}>
          {items.map((item) => (
            <button key={item.id} type="button" className={styles.listItem} onClick={() => addItem(item)}>
              <span>{item.name}</span>
              <span className={styles.price}>{formatCurrency(item.price)}</span>
            </button>
          ))}
        </div>

        <div className={styles.invoice}>
          <div className={styles.invoiceTitle}>Chi tiết hóa đơn</div>

          {cart.length === 0 ? (
            <div className={styles.invoiceEmpty}>Chưa có dịch vụ nào được chọn</div>
          ) : (
            <div className={styles.invoiceList}>
              {cart.map((line) => (
                <div key={line.id} className={styles.invoiceRow}>
                  <div className={styles.invoiceRowMain}>
                    <span>{line.name}</span>
                    <span className={styles.price}>{formatCurrency(line.price)}</span>
                  </div>
                  <div className={styles.qtyControl}>
                    <button type="button" onClick={() => changeQty(line.id, -1)}>
                      <Minus size={13} />
                    </button>
                    <span>{line.qty}</span>
                    <button type="button" onClick={() => changeQty(line.id, 1)}>
                      <Plus size={13} />
                    </button>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => setCart((prev) => prev.filter((l) => l.id !== line.id))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.invoiceFooter}>
            <div className={styles.invoiceTotal}>
              <span>Tổng tiền</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <button
              type="button"
              className={`${shared.btn} ${shared.btnPrimary}`}
              disabled={cart.length === 0}
              style={{ width: "100%" }}
              onClick={() => onSave(cart)}
            >
              + Thêm vào phòng
            </button>
          </div>
        </div>
      </div>
    </SlidePanelShell>
  );
}

export default AddServiceModal;
