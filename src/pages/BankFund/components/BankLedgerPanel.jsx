import { useState } from "react";
import FundLedgerPanel from "../../shared/fundLedger/FundLedgerPanel";
import { BANK_VOUCHER_ROWS, OPENING_BANK_BALANCE } from "../../../data/bankFundData";

function BankLedgerPanel({ onToast }) {
  const [rows] = useState(() => [...BANK_VOUCHER_ROWS].sort((a, b) => b.dateTime - a.dateTime));

  return (
    <FundLedgerPanel
      onToast={onToast}
      rows={rows}
      openingBalance={OPENING_BANK_BALANCE}
      searchToastMessage="Đã tìm kiếm sổ chi tiết tiền gửi"
    />
  );
}

export default BankLedgerPanel;
