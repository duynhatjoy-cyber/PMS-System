import { useState } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { useActiveSuppliers } from "../../../context/WarehouseConfigContext";
import { formatDMY, formatCurrency } from "../../../utils/format";
import useLineItems, { lineAmount } from "../../Warehouse/hooks/useLineItems";
import generateTicketNo from "../../Warehouse/ticketNo";
import { PURCHASE_STATUS_OPTIONS } from "../../../data/purchasingData";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

// Phiếu đặt hàng có dòng hàng (tên - đơn vị - số lượng - đơn giá) để Nhập
// hàng sau này so sánh với hàng nhận thực tế, khác với AddPurchaseTicketModal
// (chỉ 1 ô "Tổng") vẫn dùng cho Báo hàng/Trả lại hàng mua. seedLine điền sẵn
// dòng đầu khi tạo đơn từ 1 phiếu báo hàng (ReportPanel).
function AddPurchaseOrderModal({ seedLine, onSave, onClose }) {
  const activeSuppliers = useActiveSuppliers();
  const [ticketDate] = useState(() => new Date());
  const [status, setStatus] = useState(PURCHASE_STATUS_OPTIONS[1]);
  const [supplierIndex, setSupplierIndex] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [note, setNote] = useState(seedLine ? `Đặt hàng theo phiếu báo hàng — ${seedLine.name}` : "");

  function makeLine(id) {
    if (id === 1 && seedLine) {
      return { id, name: seedLine.name || "", unit: seedLine.unit || "", qty: seedLine.qty ?? "", price: "" };
    }
    return { id, name: "", unit: "", qty: "", price: "" };
  }

  const { lines, updateLine, addLine, removeLine } = useLineItems(makeLine);

  const supplier = supplierIndex === "" ? null : activeSuppliers[Number(supplierIndex)];
  const total = lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const canSave = lines.some((line) => line.name.trim() && Number(line.qty) > 0);

  function handleSave() {
    if (!canSave) return;
    const ticketNo = generateTicketNo("DH");
    onSave({
      id: ticketNo,
      ticketNo,
      date: ticketDate,
      status,
      supplier: supplier?.name || "",
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      lines: lines
        .filter((line) => line.name.trim() && Number(line.qty) > 0)
        .map((line) => ({
          name: line.name.trim(),
          unit: line.unit.trim(),
          qty: Number(line.qty) || 0,
          price: Number(line.price) || 0,
        })),
      total,
      note,
    });
  }

  return (
    <SlidePanelShell title="Thêm phiếu đặt hàng" onClose={onClose} tone="brand" width={900}>
      <div className={styles.formGrid}>
        <div>
          <div className={styles.field}>
            <label className={styles.label}>Ngày đặt</label>
            <div className={styles.datetimeRow}>
              <span>{formatDMY(ticketDate)}</span>
              <Calendar size={14} />
            </div>
          </div>

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
        </div>

        <div>
          <div className={styles.field}>
            <label className={styles.label}>Trạng thái</label>
            <select className={styles.underlineSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
              {PURCHASE_STATUS_OPTIONS.slice(1).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ngày nhận dự kiến</label>
            <input
              type="date"
              className={styles.underlineInput}
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

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

      <div className={styles.tableWrap} style={{ marginTop: 18 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên hàng</th>
              <th>Đơn vị</th>
              <th>Số lượng (*)</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
              <th className={styles.thAction}>
                <button type="button" className={styles.addRowBtn} onClick={addLine}>
                  <Plus size={16} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={line.name}
                    onChange={(e) => updateLine(line.id, { name: e.target.value })}
                    placeholder="Tên nguyên liệu / hàng hóa"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className={styles.textInput}
                    style={{ width: 90 }}
                    value={line.unit}
                    onChange={(e) => updateLine(line.id, { unit: e.target.value })}
                    placeholder="kg, lít..."
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    className={styles.numInput}
                    value={line.qty}
                    onChange={(e) => updateLine(line.id, { qty: e.target.value })}
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    className={styles.numInput}
                    value={line.price}
                    onChange={(e) => updateLine(line.id, { price: e.target.value })}
                    placeholder="0"
                  />
                </td>
                <td className={styles.thanhTien}>{formatCurrency(lineAmount(line))}</td>
                <td>
                  <button type="button" className={styles.removeBtn} onClick={() => removeLine(line.id)}>
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.totalRow}>
              <td colSpan={4}>Tổng</td>
              <td colSpan={2}>{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={styles.footerBtns}>
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} disabled={!canSave} onClick={handleSave}>
          LƯU
        </button>
        <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
          BỎ QUA
        </button>
      </div>
    </SlidePanelShell>
  );
}

export default AddPurchaseOrderModal;
