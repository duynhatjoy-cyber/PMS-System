import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, ShoppingCart } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import shared from "../FrontDesk/modals/shared.module.css";
import EmptyState from "../../components/EmptyState";
import { useActiveMaterials } from "../../context/WarehouseConfigContext";
import { STOCK_OUT_ROWS } from "../../data/warehouseData";
import { formatCurrency, formatDateTimeDMY } from "../../utils/format";
import styles from "./InvoiceDetail.module.css";

// Không có bảng hóa đơn riêng trong mock data — hóa đơn được dựng lại từ chính
// phiếu xuất kho (invoiceCode) đang giữ nó, vì đây là nơi duy nhất phát sinh
// invoiceCode hiện nay. Các trường không có trong phiếu xuất kho (người tạo,
// thông tin khách...) hiển thị N/A/Anonymous giống hành vi của app khi thiếu dữ liệu.
function findSourceTicket(invoiceCode) {
  return STOCK_OUT_ROWS.find((row) => row.invoiceCode === invoiceCode);
}

function InvoiceDetail() {
  const navigate = useNavigate();
  const { invoiceCode } = useParams();
  const materials = useActiveMaterials();
  const [toastMsg, setToastMsg] = useState("");
  const ticket = findSourceTicket(invoiceCode);

  if (!ticket) {
    return (
      <main className={styles.page}>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Quay lại
        </button>
        <div className={styles.notFound}>
          <EmptyState message={`Không tìm thấy hóa đơn ${invoiceCode}`} />
        </div>
      </main>
    );
  }

  const services = ticket.lines.map((line) => {
    const material = materials.find((m) => m.id === line.materialId);
    const qty = Number(line.qty) || 0;
    const price = Number(line.price) || 0;
    return { name: material?.name || line.materialId, qty, price, amount: qty * price };
  });

  function notImplemented() {
    setToastMsg("Chức năng đang được phát triển");
  }

  return (
    <main className={styles.page}>
      <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Quay lại
      </button>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Thông tin hóa đơn</h2>
            <div className={styles.cardHeadActions}>
              <button type="button" className={styles.printBtn} title="In hóa đơn" onClick={notImplemented}>
                <Printer size={16} />
              </button>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnPrimary} ${styles.createBtn}`}
                onClick={notImplemented}
              >
                <ShoppingCart size={15} /> TẠO HÓA ĐƠN
              </button>
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Số hóa đơn</span>
            <span className={styles.value}>{ticket.invoiceCode}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Trạng thái</span>
            <span className={`${styles.value} ${styles.valueSuccess}`}>Đã trả</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Người tạo</span>
            <span className={styles.value}>N/A</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Ngày tạo</span>
            <span className={styles.value}>{formatDateTimeDMY(ticket.date)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Giảm tiền</span>
            <span className={styles.value}>{formatCurrency(0)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Giảm giá %</span>
            <span className={styles.value}>0 (%)</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Lý do giảm giá</span>
            <span className={styles.value}>N/A</span>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Thông tin liên hệ</h2>
          <div className={styles.row}>
            <span className={styles.label}>Tên đầy đủ</span>
            <span className={styles.value}>Anonymous</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Sinh nhật</span>
            <span className={styles.value}>N/A</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Số chứng minh thư</span>
            <span className={styles.value}>N/A</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Di động</span>
            <span className={styles.value}>N/A</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>N/A</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Ghi chú</span>
            <span className={styles.value}>N/A</span>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Danh sách dịch vụ</h2>
          {services.map((s, i) => (
            <div key={i} className={styles.lineItem}>
              <div className={styles.lineItemTop}>
                <span>
                  {s.name} (x{s.qty})
                </span>
                <span>{formatCurrency(s.amount)}</span>
              </div>
              <div className={styles.lineItemMeta}>
                Ngày tạo: {formatDateTimeDMY(ticket.date)}, Người tạo: N/A
              </div>
            </div>
          ))}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Thanh toán</h2>
          <div className={styles.lineItem}>
            <div className={styles.lineItemTop}>
              <span>Người tạo: N/A</span>
              <span>{formatCurrency(ticket.total)}</span>
            </div>
            <div className={styles.lineItemMeta}>Ngày tạo: {formatDateTimeDMY(ticket.date)}</div>
          </div>
        </section>
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </main>
  );
}

export default InvoiceDetail;
