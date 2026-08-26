import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { formatDMY, formatCurrency } from "../../../utils/format";
import tableStyles from "../../Warehouse/Warehouse.module.css";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

// Mở khi bấm xem chi tiết 1 phiếu nhập hàng còn "Chưa kiểm kê hàng hóa" —
// thay cho form sửa chung (TicketDetailModal), để người kiểm hàng chỉ có 2
// lựa chọn rõ ràng: Duyệt hàng (nếu Ghi nợ NCC thì ghi nhận công nợ luôn) hay
// Trả lại hàng mua (mở sẵn phiếu trả, điền sẵn từ đúng phiếu nhập này).
function ReceiptInspectionModal({ row, onApprove, onReject, onClose }) {
  return (
    <SlidePanelShell title={`Kiểm kê hàng hóa — ${row.ticketNo}`} onClose={onClose} tone="brand" width={820}>
      <div className={styles.printSheet} style={{ maxWidth: "none" }}>
        <div className={styles.printRow}>
          <span className={styles.printLabel}>Ngày nhập hàng</span>
          <span className={styles.printValue}>{formatDMY(row.date)}</span>
        </div>
        <div className={styles.printRow}>
          <span className={styles.printLabel}>Tham chiếu</span>
          <span className={styles.printValue}>{row.reference || "—"}</span>
        </div>
        <div className={styles.printRow}>
          <span className={styles.printLabel}>Nhà cung cấp</span>
          <span className={styles.printValue}>{row.supplier || "—"}</span>
        </div>
        <div className={styles.printRow}>
          <span className={styles.printLabel}>Người giao hàng</span>
          <span className={styles.printValue}>{row.deliveryPerson || "—"}</span>
        </div>
        <div className={styles.printRow}>
          <span className={styles.printLabel}>Phương thức thanh toán</span>
          <span className={styles.printValue}>{row.paymentMethod || "—"}</span>
        </div>
        <div className={styles.printRow}>
          <span className={styles.printLabel}>Tổng</span>
          <span className={styles.printValue}>{formatCurrency(row.total)}</span>
        </div>
      </div>

      <div className={styles.tableWrap} style={{ marginTop: 16 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nguyên vật liệu</th>
              <th>Đơn vị</th>
              <th>Kho</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            {(row.lines || []).map((line, i) => (
              <tr key={i}>
                <td>{line.name}</td>
                <td>{line.unit}</td>
                <td>{line.warehouse}</td>
                <td className={tableStyles.numCell}>{line.qty}</td>
                <td className={tableStyles.numCell}>{formatCurrency(line.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.tableHint} style={{ marginTop: 12 }}>
        Kiểm tra hàng thực nhận rồi chọn: <strong>Duyệt hàng</strong> nếu đạt (
        {row.paymentMethod === "Ghi nợ NCC" ? "sẽ ghi nhận công nợ vào Trả nợ" : "không phát sinh công nợ"}
        ), hoặc <strong>Trả lại hàng mua</strong> nếu hàng không đạt.
      </p>

      <div className={styles.footerBtns}>
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={() => onApprove(row)}>
          DUYỆT HÀNG
        </button>
        <button type="button" className={`${shared.btn} ${styles.btnWarning}`} onClick={() => onReject(row)}>
          TRẢ LẠI HÀNG MUA
        </button>
        <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
          ĐÓNG
        </button>
      </div>
    </SlidePanelShell>
  );
}

export default ReceiptInspectionModal;
