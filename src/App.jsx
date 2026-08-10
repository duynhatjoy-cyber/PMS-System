import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { PinnedReportsProvider } from "./context/PinnedReportsContext";
import { WarehouseConfigProvider } from "./context/WarehouseConfigContext";
import { BookingsProvider } from "./context/BookingsContext";
import { PurchaseReportProvider } from "./context/PurchaseReportContext";
import { DEFAULT_ROUTE, ROUTES } from "./routesConfig";

function App() {
  return (
    <PinnedReportsProvider>
      <WarehouseConfigProvider>
        <PurchaseReportProvider>
          <BookingsProvider>
            <Layout>
              <Routes>
              <Route
                path="/"
                element={<Navigate to={DEFAULT_ROUTE.path} replace />}
              />
              {ROUTES.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
              <Route
                path="*"
                element={<Navigate to={DEFAULT_ROUTE.path} replace />}
              />
              </Routes>
            </Layout>
          </BookingsProvider>
        </PurchaseReportProvider>
      </WarehouseConfigProvider>
    </PinnedReportsProvider>
  );
}

export default App;
