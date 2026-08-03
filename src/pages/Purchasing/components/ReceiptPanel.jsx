import PurchaseDocPanel from "../../shared/purchaseDoc/PurchaseDocPanel";
import { RECEIPT_ROWS } from "../../../data/purchasingData";

function ReceiptPanel({ onToast }) {
  return (
    <PurchaseDocPanel
      onToast={onToast}
      initialRows={RECEIPT_ROWS}
      savedMessage="Đã thêm phiếu nhập hàng"
      fetchMessage="Đã lấy dữ liệu nhập hàng"
      ticketPrefix="PN"
      docColumnLabel="Phiếu nhập kho"
      addTitle="Thêm phiếu nhập hàng"
      emptyHint="Nhấn nút + ở góc trên để tạo phiếu nhập hàng mới."
    />
  );
}

export default ReceiptPanel;
