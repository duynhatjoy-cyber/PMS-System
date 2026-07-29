import { createContext, useContext, useState } from "react";
import { WAREHOUSE_RECORDS, SUPPLIER_RECORDS } from "../data/warehouseConfigData";

const WarehouseConfigContext = createContext(null);

// Single source of truth for kho/nhà cung cấp, shared between Cấu hình >
// Quản lý kho (full CRUD) and the operational Kho page's dropdowns (read-only,
// active-only) — so ngừng sử dụng/xóa ở Cấu hình phản ánh ngay bên vận hành.
export function WarehouseConfigProvider({ children }) {
  const [warehouses, setWarehouses] = useState(WAREHOUSE_RECORDS);
  const [suppliers, setSuppliers] = useState(SUPPLIER_RECORDS);

  const value = { warehouses, setWarehouses, suppliers, setSuppliers };

  return (
    <WarehouseConfigContext.Provider value={value}>{children}</WarehouseConfigContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hooks colocated by design
export function useWarehouseConfig() {
  const ctx = useContext(WarehouseConfigContext);
  if (!ctx) throw new Error("useWarehouseConfig must be used within WarehouseConfigProvider");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hooks colocated by design
export function useActiveWarehouseNames() {
  const { warehouses } = useWarehouseConfig();
  return warehouses.filter((w) => w.active).map((w) => w.name);
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hooks colocated by design
export function useActiveSuppliers() {
  const { suppliers } = useWarehouseConfig();
  return suppliers.filter((s) => s.active);
}
