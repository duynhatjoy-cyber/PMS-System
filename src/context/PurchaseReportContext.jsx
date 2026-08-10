import { createContext, useContext, useState } from "react";
import { REPORT_ROWS } from "../data/purchasingData";

const PurchaseReportContext = createContext(null);

// Cầu nối cảnh báo hao hụt nguyên vật liệu (F&B) sang phiếu Báo hàng (Mua
// hàng) — 2 trang mount độc lập qua router nên cần 1 nguồn dữ liệu chung ở
// trên cả hai, cùng mẫu với WarehouseConfigContext.
export function PurchaseReportProvider({ children }) {
  const [reportRows, setReportRows] = useState(REPORT_ROWS);

  return (
    <PurchaseReportContext.Provider value={{ reportRows, setReportRows }}>
      {children}
    </PurchaseReportContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook colocated by design
export function usePurchaseReport() {
  const ctx = useContext(PurchaseReportContext);
  if (!ctx) throw new Error("usePurchaseReport must be used within PurchaseReportProvider");
  return ctx;
}
