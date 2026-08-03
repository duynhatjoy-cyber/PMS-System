import { useState } from "react";
import { Calendar } from "lucide-react";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { useActiveSuppliers } from "../../../context/WarehouseConfigContext";
import { formatDMY } from "../../../utils/format";
import generateTicketNo from "../../Warehouse/ticketNo";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

// One ticket-entry modal reused across Báo hàng/Đặt hàng/Nhập hàng/Trả lại
// hàng mua — the 5th tab (Trả nợ) has no add form. Which fields render is
// driven by props, same pattern as FundVoucherPanel being shared by
// CashFund/BankFund via config props instead of 4 near-duplicate modals.
function AddPurchaseTicketModal({
  title,
  ticketPrefix,
  statusOptions,
  includeSupplier,
  includeTotal,
  docRefLabel,
  onSave,
  onClose,
}) {
  const activeSuppliers = useActiveSuppliers();
  const [ticketDate] = useState(() => new Date());
  const [status, setStatus] = useState(statusOptions?.[0] || "");
  const [supplierIndex, setSupplierIndex] = useState("");
  const [docRef, setDocRef] = useState("");
  const [total, setTotal] = useState("");
  const [note, setNote] = useState("");

  const supplier = supplierIndex === "" ? null : activeSuppliers[Number(supplierIndex)];

  function handleSave() {
    const ticketNo = generateTicketNo(ticketPrefix);
    onSave({
      id: ticketNo,
      ticketNo,
      date: ticketDate,
      status,
      supplier: supplier?.name || "",
      docRef,
      total: Number(total) || 0,
      note,
    });
  }

  return (
    <ModalShell title={title} onClose={onClose} tone="brand" width={520}>
      <div className={styles.field}>
        <label className={styles.label}>Ngày</label>
        <div className={styles.datetimeRow}>
          <span>{formatDMY(ticketDate)}</span>
          <Calendar size={14} />
        </div>
      </div>

      {statusOptions && (
        <div className={styles.field}>
          <label className={styles.label}>Trạng thái</label>
          <select
            className={styles.underlineSelect}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {includeSupplier && (
        <div className={styles.field}>
          <label className={styles.label}>Nhà cung cấp</label>
          <select
            className={styles.underlineSelect}
            value={supplierIndex}
            onChange={(e) => setSupplierIndex(e.target.value)}
          >
            <option value="">Lựa chọn nhà cung cấp?</option>
            {activeSuppliers.map((s, i) => (
              <option key={s.name} value={i}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {docRefLabel && (
        <div className={styles.field}>
          <label className={styles.label}>{docRefLabel}</label>
          <input
            type="text"
            className={styles.underlineInput}
            value={docRef}
            onChange={(e) => setDocRef(e.target.value)}
            placeholder={docRefLabel}
          />
        </div>
      )}

      {includeTotal && (
        <div className={styles.field}>
          <label className={styles.label}>Tổng</label>
          <input
            type="number"
            min="0"
            className={styles.underlineInput}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="0"
          />
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Diễn giải</label>
        <input
          type="text"
          className={styles.underlineInput}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Diễn giải"
        />
      </div>

      <div className={styles.footerBtns}>
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={handleSave}>
          LƯU
        </button>
        <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
          BỎ QUA
        </button>
      </div>
    </ModalShell>
  );
}

export default AddPurchaseTicketModal;
