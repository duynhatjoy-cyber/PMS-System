import { useState } from "react";
import FundLedgerPanel from "../../shared/fundLedger/FundLedgerPanel";
import { atTime, CASH_VOUCHER_ROWS, OPENING_CASH_BALANCE } from "../../../data/cashFundData";
import { startOfDay } from "../../../utils/format";

const today = startOfDay(new Date());

function CashLedgerPanel({ onToast }) {
  const [rows] = useState(() =>
    CASH_VOUCHER_ROWS.map((r) => ({ ...r, dateTime: atTime(today, r) })).sort(
      (a, b) => b.dateTime - a.dateTime
    )
  );

  return (
    <FundLedgerPanel
      onToast={onToast}
      rows={rows}
      openingBalance={OPENING_CASH_BALANCE}
      searchToastMessage="Đã tìm kiếm sổ chi tiết tiền mặt"
    />
  );
}

export default CashLedgerPanel;
