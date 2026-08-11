import { useState } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { useActiveSuppliers } from "../../../context/WarehouseConfigContext";
import { formatDMY, formatCurrency } from "../../../utils/format";
import { lineAmount } from "../../Warehouse/hooks/useLineItems";
import generateTicketNo from "../../Warehouse/ticketNo";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

function blankLine(id) {
  return { id, name: "", unit: "", qty: "", price: "" };
}

// Nhập hàng có thể chọn "Từ đơn đặt hàng" (1 phiếu Đặt hàng chưa hoàn tất) —
// khi chọn, các dòng hàng được điền sẵn số lượng/đơn giá đã đặt (orderedQty/
// orderedPrice) để người dùng sửa lại theo hàng thực nhận; dòng nào lệch so
// với lúc đặt được đánh dấu ngay trong bảng. Không dùng useLineItems ở đây vì
// cần thay TOÀN BỘ danh sách dòng mỗi khi đổi đơn đặt hàng — khác với nhu cầu
// chỉ thêm/xóa từng dòng của hook đó.
function AddReceiptModal({ openOrders, onSave, onClose }) {
  const activeSuppliers = useActiveSuppliers();
  const [ticketDate] = useState(() => new Date());
  const [orderIndex, setOrderIndex] = useState("");
  const [manualSupplierIndex, setManualSupplierIndex] = useState("");
  const [docRef, setDocRef] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState([blankLine(1)]);
  const [nextLineId, setNextLineId] = useState(2);
  // Theo dõi lần đổi "Từ đơn đặt hàng" gần nhất để nạp lại toàn bộ dòng hàng
  // ngay trong lúc render (không dùng effect) — mẫu "adjusting state during
  // render" của React, tránh setState lồng trong effect.
  const [linesForOrderIndex, setLinesForOrderIndex] = useState(orderIndex);

  const selectedOrder = orderIndex === "" ? null : openOrders[Number(orderIndex)];

  if (orderIndex !== linesForOrderIndex) {
    setLinesForOrderIndex(orderIndex);
    if (selectedOrder) {
      setLines(
        selectedOrder.lines.map((l, i) => ({
          id: i + 1,
          name: l.name,
          unit: l.unit,
          orderedQty: l.qty,
          orderedPrice: l.price,
          qty: l.qty,
          price: l.price,
        }))
      );
      setNextLineId(selectedOrder.lines.length + 1);
    } else {
      setLines([blankLine(1)]);
      setNextLineId(2);
    }
  }

  function updateLine(id, patch) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, blankLine(nextLineId)]);
    setNextLineId((n) => n + 1);
  }

  function removeLine(id) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  function isMismatchLine(line) {
    return (
      line.orderedQty != null &&
      (Number(line.qty) !== Number(line.orderedQty) || Number(line.price) !== Number(line.orderedPrice))
    );
  }

  const manualSupplier = manualSupplierIndex === "" ? null : activeSuppliers[Number(manualSupplierIndex)];
  const total = lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const anyMismatch = lines.some(isMismatchLine);
  const canSave = lines.some((line) => line.name.trim() && Number(line.qty) > 0);

  function handleSave() {
    if (!canSave) return;
    const ticketNo = generateTicketNo("PN");
    onSave({
      id: ticketNo,
      ticketNo,
      date: ticketDate,
      docRef,
      supplier: selectedOrder ? selectedOrder.supplier : manualSupplier?.name || "",
      total,
      note,
      orderRef: selectedOrder?.ticketNo,
      orderId: selectedOrder?.id,
      mismatch: selectedOrder ? anyMismatch : false,
      lines: lines
        .filter((line) => line.name.trim() && Number(line.qty) > 0)
        .map((line) => ({
          name: line.name.trim(),
          unit: (line.unit || "").trim(),
          qty: Number(line.qty) || 0,
          price: Number(line.price) || 0,
          orderedQty: line.orderedQty,
          orderedPrice: line.orderedPrice,
        })),
    });
  }

  return (
    <ModalShell title="Thêm phiếu nhập hàng" onClose={onClose} tone="brand" width={900}>
      <div className={styles.formGrid}>
        <div>
          <div className={styles.field}>
            <label className={styles.label}>Ngày nhập</label>
            <div className={styles.datetimeRow}>
              <span>{formatDMY(ticketDate)}</span>
              <Calendar size={14} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Từ đơn đặt hàng</label>
            <select
              className={styles.underlineSelect}
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
            >
              <option value="">Nhập trực tiếp, không theo đơn đặt hàng</option>
              {openOrders.map((o, i) => (
                <option key={o.id} value={i}>
                  {o.ticketNo} — {o.supplier || "Chưa có NCC"} ({formatDMY(o.date)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className={styles.field}>
            <label className={styles.label}>Nhà cung cấp</label>
            {selectedOrder ? (
              <input type="text" className={styles.underlineInput} value={selectedOrder.supplier || ""} readOnly />
            ) : (
              <select
                className={styles.underlineSelect}
                value={manualSupplierIndex}
                onChange={(e) => setManualSupplierIndex(e.target.value)}
              >
                <option value="">Lựa chọn nhà cung cấp?</option>
                {activeSuppliers.map((s, i) => (
                  <option key={s.name} value={i}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Số hóa đơn</label>
            <input
              type="text"
              className={styles.underlineInput}
              value={docRef}
              onChange={(e) => setDocRef(e.target.value)}
              placeholder="Số hóa đơn / bill nhà cung cấp"
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

      {selectedOrder && (
        <p className={styles.tableHint}>
          Đang so sánh với đơn <strong>{selectedOrder.ticketNo}</strong> — sửa lại Số lượng/Đơn giá theo hàng thực
          nhận, dòng lệch so với lúc đặt sẽ hiện màu đỏ.
        </p>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên hàng</th>
              <th>Đơn vị</th>
              {selectedOrder && <th>SL/Giá đã đặt</th>}
              <th>SL thực nhận (*)</th>
              <th>Đơn giá thực nhận</th>
              <th>Thành tiền</th>
              <th className={styles.thAction}>
                <button type="button" className={styles.addRowBtn} onClick={addLine}>
                  <Plus size={16} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const mismatch = isMismatchLine(line);
              return (
                <tr key={line.id}>
                  <td>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={line.name}
                      onChange={(e) => updateLine(line.id, { name: e.target.value })}
                      placeholder="Tên nguyên liệu / hàng hóa"
                      readOnly={line.orderedQty != null}
                    />
                  </td>
                  <td>{line.unit}</td>
                  {selectedOrder && (
                    <td className={styles.numCell}>
                      {line.orderedQty != null ? `${line.orderedQty} × ${formatCurrency(line.orderedPrice)}` : "—"}
                    </td>
                  )}
                  <td>
                    <input
                      type="number"
                      min="0"
                      className={styles.numInput}
                      style={mismatch ? { borderColor: "var(--fd-danger)", color: "var(--fd-danger)" } : undefined}
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
                      style={mismatch ? { borderColor: "var(--fd-danger)", color: "var(--fd-danger)" } : undefined}
                      value={line.price}
                      onChange={(e) => updateLine(line.id, { price: e.target.value })}
                      placeholder="0"
                    />
                  </td>
                  <td className={styles.thanhTien}>{formatCurrency(lineAmount(line))}</td>
                  <td>
                    {line.orderedQty == null && (
                      <button type="button" className={styles.removeBtn} onClick={() => removeLine(line.id)}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className={styles.totalRow}>
              <td colSpan={selectedOrder ? 5 : 4}>Tổng</td>
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
    </ModalShell>
  );
}

export default AddReceiptModal;
