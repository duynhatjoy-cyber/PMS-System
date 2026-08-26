import { useState } from "react";
import { Calendar, Clock, Landmark } from "lucide-react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import ImageUploadField from "../../../components/ImageUploadField";
import { useActiveSuppliers } from "../../../context/WarehouseConfigContext";
import { formatDateTimeDMY, formatCurrency } from "../../../utils/format";
import generateTicketNo from "../../Warehouse/ticketNo";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

const PAYMENT_METHODS = ["Tiền mặt", "Chuyển khoản"];

// Lập phiếu thanh toán cho đúng nhà cung cấp đang xem ở tab Trả nợ — số tiền
// mặc định điền sẵn full "Còn nợ" nhưng cho sửa để trả từng phần, không cho
// vượt quá còn nợ hiện tại. Lưu vào PAYMENT_ROWS (nâng state ở Purchasing.jsx)
// nên cập nhật ngay Còn nợ và lịch sử công nợ, không cần tải lại trang. Chọn
// "Chuyển khoản" hiện QR/số tài khoản NCC (cấu hình ở Quản lý kho > Nhà cung
// cấp) và cho đính kèm ảnh bill chuyển khoản để đối soát sau này.
function AddSupplierPaymentModal({ supplierName, remaining, onSave, onClose }) {
  const supplier = useActiveSuppliers().find((s) => s.name === supplierName);
  const [paymentDate] = useState(() => new Date());
  const [amount, setAmount] = useState(String(remaining));
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [note, setNote] = useState("");
  const [billImage, setBillImage] = useState("");

  const amountNumber = Number(amount) || 0;
  const canSave = amountNumber > 0 && amountNumber <= remaining;

  function handleSave() {
    if (!canSave) return;
    const ticketNo = generateTicketNo("TT");
    onSave({
      id: ticketNo,
      ticketNo,
      date: paymentDate,
      supplier: supplierName,
      amount: amountNumber,
      method,
      note,
      billImage: method === "Chuyển khoản" ? billImage : "",
    });
  }

  return (
    <SlidePanelShell title="Lập phiếu thanh toán" onClose={onClose} tone="brand" width={640}>
      <div className={styles.formGrid}>
        <div>
          <div className={styles.field}>
            <label className={styles.label}>Nhà cung cấp</label>
            <div className={styles.readonlyBox}>{supplierName}</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Còn nợ hiện tại</label>
            <div className={styles.readonlyBox}>{formatCurrency(remaining)}</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Số tiền thanh toán (*)</label>
            <input
              type="number"
              min="0"
              max={remaining}
              className={styles.underlineInput}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
            {amountNumber > remaining && (
              <span style={{ color: "var(--fd-danger)", fontSize: 12.5 }}>
                Không thể thanh toán vượt quá số còn nợ.
              </span>
            )}
          </div>
        </div>

        <div>
          <div className={styles.field}>
            <div className={styles.readonlyBox}>Mã</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ngày thanh toán</label>
            <div className={styles.datetimeRow}>
              <span>{formatDateTimeDMY(paymentDate)}</span>
              <Calendar size={14} />
              <Clock size={14} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Phương thức thanh toán</label>
            <div className={styles.radioGroup}>
              {PAYMENT_METHODS.map((opt) => (
                <label key={opt} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="supplierPaymentMethod"
                    checked={method === opt}
                    onChange={() => setMethod(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {method === "Chuyển khoản" && supplier?.bankAccountNumber && (
        <div className={styles.formGrid} style={{ marginBottom: 18 }}>
          <div className={styles.printSheet} style={{ maxWidth: "none" }}>
            <div className={styles.printRow}>
              <span className={styles.printLabel}>
                <Landmark size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                Ngân hàng
              </span>
              <span className={styles.printValue}>{supplier.bankName}</span>
            </div>
            <div className={styles.printRow}>
              <span className={styles.printLabel}>Số tài khoản</span>
              <span className={styles.printValue}>{supplier.bankAccountNumber}</span>
            </div>
            <div className={styles.printRow}>
              <span className={styles.printLabel}>Chủ tài khoản</span>
              <span className={styles.printValue}>{supplier.bankAccountHolder}</span>
            </div>
          </div>

          {supplier.qrCodeImage && (
            <img
              src={supplier.qrCodeImage}
              alt={`Mã QR ${supplier.name}`}
              style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain", justifySelf: "center" }}
            />
          )}
        </div>
      )}

      {method === "Chuyển khoản" && (
        <div className={styles.field}>
          <label className={styles.label}>Ảnh bill chuyển khoản</label>
          <ImageUploadField value={billImage} onChange={setBillImage} label="Chọn ảnh bill chuyển khoản" />
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Ghi chú</label>
        <input
          type="text"
          className={styles.underlineInput}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú"
        />
      </div>

      <div className={styles.footerBtns}>
        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary}`}
          disabled={!canSave}
          onClick={handleSave}
        >
          LƯU
        </button>
        <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
          BỎ QUA
        </button>
      </div>
    </SlidePanelShell>
  );
}

export default AddSupplierPaymentModal;
