import { useState } from "react";
import Layout from "./components/Layout";
import FrontDesk from "./pages/FrontDesk/FrontDesk";
import CreateInvoice from "./pages/CreateInvoice/CreateInvoice";
import Warehouse from "./pages/Warehouse/Warehouse";
import CashFund from "./pages/CashFund/CashFund";
import BankFund from "./pages/BankFund/BankFund";
import EmailCampaigns from "./pages/EmailCampaigns/EmailCampaigns";
import EmailHistory from "./pages/EmailHistory/EmailHistory";
import EmailConfig from "./pages/EmailConfig/EmailConfig";

const ROUTES_BY_KEY = {
  "LỄ TÂN::Front Desk": "front-desk",
  "VẬN HÀNH::Quản lý bán hàng::Tạo hóa đơn": "create-invoice",
  "VẬN HÀNH::Kho": "warehouse",
  "TÀI CHÍNH::Thu Chi::Quỹ tiền mặt": "cash-fund",
  "TÀI CHÍNH::Thu Chi::Quỹ tiền gửi": "bank-fund",
  "VẬN HÀNH::Email marketing::Chiến dịch email": "email-campaigns",
  "VẬN HÀNH::Email marketing::Lịch sử": "email-history",
  "VẬN HÀNH::Email marketing::Cấu hình": "email-config",
};

function App() {
  const [page, setPage] = useState("front-desk");

  function handleNavigate(key) {
    const nextPage = ROUTES_BY_KEY[key];
    if (nextPage) setPage(nextPage);
  }

  return (
    <Layout onNavigate={handleNavigate}>
      {page === "create-invoice" ? (
        <CreateInvoice />
      ) : page === "warehouse" ? (
        <Warehouse />
      ) : page === "cash-fund" ? (
        <CashFund />
      ) : page === "bank-fund" ? (
        <BankFund />
      ) : page === "email-campaigns" ? (
        <EmailCampaigns />
      ) : page === "email-history" ? (
        <EmailHistory />
      ) : page === "email-config" ? (
        <EmailConfig />
      ) : (
        <FrontDesk />
      )}
    </Layout>
  );
}

export default App;