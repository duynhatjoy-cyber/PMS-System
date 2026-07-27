import { useMemo, useState } from "react";
import { Minus, Plus, RefreshCw, Save, Search, Trash2 } from "lucide-react";
import {
  SERVICE_TABS,
  SERVICE_CATALOG,
  PAYMENT_METHODS,
  CURRENCIES,
  COUNTER_OPTIONS,
} from "../../data/invoiceServiceData";
import { formatCurrency } from "../../utils/format";
import ServiceCard from "./components/ServiceCard";
import EditPriceModal from "./components/EditPriceModal";
import Toast from "../FrontDesk/components/Toast";
import shared from "../FrontDesk/modals/shared.module.css";
import styles from "./CreateInvoice.module.css";

function CreateInvoice() {
  const [activeTab, setActiveTab] = useState(SERVICE_TABS[0]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const [paymentTab, setPaymentTab] = useState("pay");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [payAmount, setPayAmount] = useState(0);
  const [note, setNote] = useState("");
  const [customerName, setCustomerName] = useState("Anonymous");
  const [counterOption, setCounterOption] = useState(COUNTER_OPTIONS[0]);
  const [payments, setPayments] = useState([]);

  const [toastMsg, setToastMsg] = useState("");

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICE_CATALOG.filter((item) => {
      const matchesTab = activeTab === "Tất cả" || item.category === activeTab;
      const matchesQuery = !q || item.name.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [activeTab, query]);

  const total = useMemo(() => cart.reduce((sum, line) => sum + line.price * line.qty, 0), [cart]);
  const paidTotal = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const remaining = Math.max(0, total - paidTotal);

  // Keep the "Số tiền phải trả" input following the remaining balance whenever
  // the cart/payments change, while still letting the user type a custom value.
  const [prevRemaining, setPrevRemaining] = useState(remaining);
  if (remaining !== prevRemaining) {
    setPrevRemaining(remaining);
    setPayAmount(remaining);
  }

  function addToCart(entry, lineId) {
    setCart((prev) => {
      if (!entry.editable) {
        const existing = prev.find((line) => line.id === entry.id);
        if (existing) {
          return prev.map((line) => (line.id === entry.id ? { ...line, qty: line.qty + entry.qty } : line));
        }
      }
      return [...prev, { ...entry, lineId: lineId || entry.id, qty: entry.qty }];
    });
  }

  function handleSelectItem(item) {
    if (item.editable) {
      setEditingItem(item);
      return;
    }
    addToCart({ ...item, qty: 1 });
  }

  function handleConfirmEdit(entry) {
    addToCart(entry, `${entry.id}-${Date.now()}`);
    setEditingItem(null);
  }

  function changeQty(lineId, delta) {
    setCart((prev) =>
      prev
        .map((line) => (line.lineId === lineId ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0)
    );
  }

  function removeLine(lineId) {
    setCart((prev) => prev.filter((line) => line.lineId !== lineId));
  }

  function handleReset() {
    setCart([]);
    setPayments([]);
    setNote("");
    setCustomerName("Anonymous");
    setToastMsg("Đã làm mới hóa đơn");
  }

  function handleSaveDraft() {
    setToastMsg("Đã lưu hóa đơn nháp");
  }

  function handleSaveInvoice() {
    if (cart.length === 0) {
      setToastMsg("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }
    if (!customerName.trim()) {
      setToastMsg("Vui lòng nhập tên khách hàng");
      return;
    }
    const amount = Math.min(Math.max(0, Number(payAmount) || 0), remaining);
    if (amount > 0) {
      setPayments((prev) => [
        ...prev,
        { id: `PAY-${prev.length + 1}`, method: paymentMethod, amount, note },
      ]);
    }
    setToastMsg("Đã lưu hóa đơn");
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <section className={styles.catalogCard}>
          <div className={styles.catalogHeader}>
            <h2 className={styles.catalogTitle}>Danh sách dịch vụ</h2>
            <div className={styles.searchBox}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.tabs}>
            {SERVICE_TABS.map((tab) => (
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

          <div className={styles.catalogScroll}>
            {filteredItems.length === 0 ? (
              <div className={styles.emptyState}>Không tìm thấy dịch vụ phù hợp</div>
            ) : (
              <div className={styles.cardGrid}>
                {filteredItems.map((item) => (
                  <ServiceCard key={item.id} item={item} onSelect={handleSelectItem} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.cartCard}>
          <div className={styles.cartHeader}>
            <h2 className={styles.cartTitle}>Danh sách đã chọn</h2>
            <div className={styles.cartHeaderActions}>
              <button type="button" className={styles.iconBtn} title="Làm mới" onClick={handleReset}>
                <RefreshCw size={16} />
              </button>
              <button type="button" className={styles.iconBtnSave} title="Lưu nháp" onClick={handleSaveDraft}>
                <Save size={16} />
              </button>
              <button type="button" className={styles.saveInvoiceBtn} onClick={handleSaveInvoice}>
                LƯU HÓA ĐƠN
              </button>
            </div>
          </div>

          <div className={styles.cartList}>
            {cart.map((line) => (
              <div key={line.lineId} className={styles.cartRow}>
                <div className={styles.cartRowMain}>
                  <span>{line.name}</span>
                  <span className={styles.cartRowPrice}>{formatCurrency(line.price)}</span>
                </div>
                <div className={styles.qtyControl}>
                  <button type="button" onClick={() => changeQty(line.lineId, -1)}>
                    <Minus size={13} />
                  </button>
                  <span>{line.qty}</span>
                  <button type="button" onClick={() => changeQty(line.lineId, 1)}>
                    <Plus size={13} />
                  </button>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeLine(line.lineId)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.tabsRow}>
            <button
              type="button"
              className={`${styles.payTab} ${paymentTab === "pay" ? styles.payTabActive : ""}`}
              onClick={() => setPaymentTab("pay")}
            >
              Thanh toán
            </button>
            <button
              type="button"
              className={`${styles.payTab} ${paymentTab === "history" ? styles.payTabActive : ""}`}
              onClick={() => setPaymentTab("history")}
            >
              Danh sách đã thanh toán
            </button>
          </div>

          <div className={styles.payForm}>
            {paymentTab === "pay" ? (
              <>
                <div className={styles.payRow3}>
                  <div className={shared.field}>
                    <label className={shared.label}>Hình thức TT</label>
                    <select
                      className={shared.select}
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className={shared.field}>
                    <label className={shared.label}>Loại tiền</label>
                    <select
                      className={shared.select}
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.underlineField}>
                    <label className={shared.label}>Số tiền phải trả</label>
                    <input
                      type="number"
                      min="0"
                      className={styles.underlineInput}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className={shared.field}>
                  <label className={shared.label}>Mô tả ngắn</label>
                  <input
                    type="text"
                    className={shared.input}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className={styles.historyList}>
                {payments.length === 0 ? (
                  <div className={styles.emptyState}>Chưa có thanh toán nào</div>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className={styles.historyRow}>
                      <span className={styles.historyMethod}>{p.method}</span>
                      <span className={styles.historyAmount}>{formatCurrency(p.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className={styles.divider} />
            <div className={styles.sectionTitle}>Thành tiền</div>

            <div className={styles.customerGrid}>
              <div className={shared.field}>
                <label className={shared.label}>Tên khách hàng(*)</label>
                <input
                  type="text"
                  className={shared.input}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className={styles.statList}>
                <div className={styles.statRow}>
                  <span>Tổng tiền:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className={styles.statRow}>
                  <span>Đã thanh toán:</span>
                  <span>{formatCurrency(paidTotal)}</span>
                </div>
                <div className={`${styles.statRow} ${styles.statRowDanger}`}>
                  <span>Còn lại:</span>
                  <span>{formatCurrency(remaining)}</span>
                </div>
              </div>
            </div>

            <div className={shared.field}>
              <label className={shared.label}>Lựa chọn TT</label>
              <select
                className={shared.select}
                value={counterOption}
                onChange={(e) => setCounterOption(e.target.value)}
              >
                {COUNTER_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </div>

      {editingItem && (
        <EditPriceModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onConfirm={handleConfirmEdit}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default CreateInvoice;
