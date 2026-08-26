import { useState } from "react";
import ReportPanel from "./components/ReportPanel";
import OrderPanel from "./components/OrderPanel";
import ReceiptPanel from "./components/ReceiptPanel";
import ReturnPanel from "./components/ReturnPanel";
import DebtPanel from "./components/DebtPanel";
import Toast from "../FrontDesk/components/Toast";
import { ORDER_ROWS, RECEIPT_ROWS, RETURN_ROWS, PAYMENT_ROWS } from "../../data/purchasingData";
import styles from "../Warehouse/Warehouse.module.css";

const TABS = [
  { key: "report", label: "Báo hàng" },
  { key: "order", label: "Đặt hàng" },
  { key: "receipt", label: "Nhập hàng" },
  { key: "return", label: "Trả lại hàng mua" },
  { key: "debt", label: "Trả nợ" },
];

function Purchasing() {
  const [activeTab, setActiveTab] = useState("report");
  const [toastMsg, setToastMsg] = useState("");
  const [orderRows, setOrderRows] = useState(ORDER_ROWS);
  const [receiptRows, setReceiptRows] = useState(RECEIPT_ROWS);
  const [returnRows, setReturnRows] = useState(RETURN_ROWS);
  const [paymentRows, setPaymentRows] = useState(PAYMENT_ROWS);
  // Dòng hàng gợi ý khi tạo đơn đặt hàng từ 1 phiếu báo hàng — xem
  // ReportPanel's "Tạo đơn đặt hàng". null khi mở modal thủ công qua nút +.
  const [orderSeedLine, setOrderSeedLine] = useState(null);
  // Phiếu nhập hàng gợi ý khi tạo trả lại hàng mua từ bước kiểm kê hàng hóa
  // (ReceiptPanel's "Trả lại hàng mua") — xem ReceiptInspectionModal.
  const [returnSeedReceiptId, setReturnSeedReceiptId] = useState(null);

  function toast(message) {
    setToastMsg(message);
  }

  function handleCreateOrderFromReport(seedLine) {
    setOrderSeedLine(seedLine);
    setActiveTab("order");
  }

  function handleCreateReturnFromReceipt(receiptId) {
    setReturnSeedReceiptId(receiptId);
    setActiveTab("return");
  }

  function handleOrderReceived(orderId) {
    setOrderRows((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "Đã thực hiện" } : o))
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {activeTab === "report" && (
          <ReportPanel onToast={toast} onCreateOrder={handleCreateOrderFromReport} />
        )}
        {activeTab === "order" && (
          <OrderPanel
            onToast={toast}
            rows={orderRows}
            setRows={setOrderRows}
            seedLine={orderSeedLine}
            onSeedConsumed={() => setOrderSeedLine(null)}
          />
        )}
        {activeTab === "receipt" && (
          <ReceiptPanel
            onToast={toast}
            rows={receiptRows}
            setRows={setReceiptRows}
            orderRows={orderRows}
            onOrderReceived={handleOrderReceived}
            onCreateReturn={handleCreateReturnFromReceipt}
          />
        )}
        {activeTab === "return" && (
          <ReturnPanel
            onToast={toast}
            rows={returnRows}
            setRows={setReturnRows}
            receiptRows={receiptRows}
            seedReceiptId={returnSeedReceiptId}
            onSeedConsumed={() => setReturnSeedReceiptId(null)}
          />
        )}
        {activeTab === "debt" && (
          <DebtPanel
            onToast={toast}
            receiptRows={receiptRows}
            returnRows={returnRows}
            paymentRows={paymentRows}
            setPaymentRows={setPaymentRows}
          />
        )}
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default Purchasing;
