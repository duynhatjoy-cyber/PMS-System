import PurchaseDocPanel from "../../shared/purchaseDoc/PurchaseDocPanel";
import { RETURN_ROWS } from "../../../data/purchasingData";

function ReturnPanel({ onToast }) {
  return (
    <PurchaseDocPanel
      onToast={onToast}
      initialRows={RETURN_ROWS}
      savedMessage="Đã thêm phiếu trả lại hàng mua"
      fetchMessage="Đã lấy dữ liệu trả lại hàng mua"
      ticketPrefix="PT"
      docColumnLabel="Phiếu xuất kho"
      addTitle="Thêm phiếu trả lại hàng mua"
      emptyHint="Nhấn nút + ở góc trên để tạo phiếu trả lại hàng mua mới."
    />
  );
}

export default ReturnPanel;
