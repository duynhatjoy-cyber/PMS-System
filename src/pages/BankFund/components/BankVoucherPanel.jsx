import FundVoucherPanel from "../../shared/fundLedger/FundVoucherPanel";
import { BANK_VOUCHER_ROWS, BANK_VOUCHER_TYPES, BANK_ACCOUNT_OPTIONS } from "../../../data/bankFundData";

function BankVoucherPanel({ onToast }) {
  return (
    <FundVoucherPanel
      onToast={onToast}
      initialRows={BANK_VOUCHER_ROWS}
      voucherTypes={BANK_VOUCHER_TYPES}
      accountOptions={BANK_ACCOUNT_OPTIONS}
      ticketPrefixThu="PTG"
      ticketPrefixChi="PCG"
      unitSuffix="(Chuyển khoản NH)"
      amountColumnLabel="Số tiền phải trả"
    />
  );
}

export default BankVoucherPanel;
