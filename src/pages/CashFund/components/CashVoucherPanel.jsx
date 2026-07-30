import { useState } from "react";
import FundVoucherPanel from "../../shared/fundLedger/FundVoucherPanel";
import { atTime, CASH_VOUCHER_ROWS, CASH_VOUCHER_TYPES } from "../../../data/cashFundData";
import { startOfDay } from "../../../utils/format";

const today = startOfDay(new Date());

function CashVoucherPanel({ onToast }) {
  const [initialRows] = useState(() =>
    CASH_VOUCHER_ROWS.map((r) => ({ ...r, dateTime: atTime(today, r) }))
  );

  return (
    <FundVoucherPanel
      onToast={onToast}
      initialRows={initialRows}
      voucherTypes={CASH_VOUCHER_TYPES}
      ticketPrefixThu="PTM"
      ticketPrefixChi="PCM"
      unitSuffix="(Tiền mặt)"
      amountColumnLabel="Số tiền"
    />
  );
}

export default CashVoucherPanel;
