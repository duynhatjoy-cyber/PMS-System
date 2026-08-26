import { useState } from "react";
import { Calendar, Clock, Plus, X, Trash2 } from "lucide-react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { useActiveSuppliers, useActiveWarehouseNames, useActiveMaterials } from "../../../context/WarehouseConfigContext";
import { formatDateTimeDMY, formatCurrency } from "../../../utils/format";
import { lineAmount } from "../../Warehouse/hooks/useLineItems";
import generateTicketNo from "../../Warehouse/ticketNo";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

const PAYMENT_METHODS = ["Giảm trừ công nợ", "Nhận lại tiền"];

// Trả lại hàng mua xuất nguyên vật liệu ra khỏi kho (giống Xuất kho) nên dùng
// lại chipCell nguyên vật liệu/kho của AddStockOutModal. Có thể chọn "Từ
// phiếu nhập hàng" để điền sẵn đúng nguyên vật liệu/kho/đơn giá đã nhận (như
// Nhập hàng điền sẵn từ Đặt hàng) — người dùng chỉ cần sửa lại Số lượng theo
// phần thực tế muốn trả, dòng nào để 0 sẽ tự bị bỏ qua lúc lưu. `initialReceiptId`
// (từ bước kiểm kê hàng hóa ở Nhập hàng — xem ReceiptInspectionModal) chọn
// sẵn phiếu nhập tương ứng ngay khi mở, không cần tự tìm lại trong dropdown.
function AddPurchaseReturnModal({ receiptRows, initialReceiptId, onSave, onClose, onToast }) {
  const activeSuppliers = useActiveSuppliers();
  const activeWarehouseNames = useActiveWarehouseNames();
  const materials = useActiveMaterials();

  function blankLine(id) {
    return { id, materialId: "", warehouse: activeWarehouseNames[0] || "", qty: "", price: "" };
  }

  const [ticketDate] = useState(() => new Date());
  const [receiptIndex, setReceiptIndex] = useState(() => {
    if (!initialReceiptId) return "";
    const idx = receiptRows.findIndex((r) => r.id === initialReceiptId);
    return idx === -1 ? "" : idx;
  });
  const [manualSupplierIndex, setManualSupplierIndex] = useState("");
  const [receiver, setReceiver] = useState("");
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [lines, setLines] = useState([blankLine(1)]);
  const [nextLineId, setNextLineId] = useState(2);
  // Theo dõi lần đổi "Từ phiếu nhập hàng" gần nhất để nạp lại toàn bộ dòng
  // hàng ngay trong lúc render (không dùng effect) — cùng mẫu với AddReceiptModal.
  // Khởi tạo khác receiptIndex để nếu đã có initialReceiptId thì nạp dòng
  // hàng ngay từ lần render đầu tiên thay vì chờ người dùng đổi dropdown.
  const [linesForReceiptIndex, setLinesForReceiptIndex] = useState("");

  const selectedReceipt = receiptIndex === "" ? null : receiptRows[Number(receiptIndex)];

  if (receiptIndex !== linesForReceiptIndex) {
    setLinesForReceiptIndex(receiptIndex);
    if (selectedReceipt) {
      setLines(
        selectedReceipt.lines.map((l, i) => ({
          id: i + 1,
          materialId: materials.find((m) => m.name === l.name)?.id || "",
          warehouse: l.warehouse || activeWarehouseNames[0] || "",
          fromReceipt: true,
          qty: l.qty,
          price: l.price,
        }))
      );
      setNextLineId(selectedReceipt.lines.length + 1);
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

  const manualSupplier = manualSupplierIndex === "" ? null : activeSuppliers[Number(manualSupplierIndex)];
  const total = lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const canSave = lines.some((line) => line.materialId && line.warehouse && Number(line.qty) > 0);

  function handleSave() {
    if (!canSave) return;
    const ticketNo = generateTicketNo("PT");
    onSave({
      id: ticketNo,
      ticketNo,
      date: ticketDate,
      supplier: selectedReceipt ? selectedReceipt.supplier : manualSupplier?.name || "",
      receiptRef: selectedReceipt?.ticketNo,
      receiver,
      reference,
      paymentMethod,
      note,
      total,
      lines: lines
        .filter((line) => line.materialId && line.warehouse && Number(line.qty) > 0)
        .map((line) => {
          const material = materials.find((m) => m.id === line.materialId);
          return {
            name: material?.name || "",
            unit: material?.unit || "",
            warehouse: line.warehouse,
            qty: Number(line.qty) || 0,
            price: Number(line.price) || 0,
          };
        }),
    });
  }

  return (
    <SlidePanelShell title="Phiếu trả lại hàng mua" onClose={onClose} tone="brand" width={900}>
      <div className={styles.formGrid}>
        <div>
          <div className={styles.field}>
            <label className={styles.label}>Từ phiếu nhập hàng</label>
            <select
              className={styles.underlineSelect}
              value={receiptIndex}
              onChange={(e) => setReceiptIndex(e.target.value)}
            >
              <option value="">Nhập trực tiếp, không theo phiếu nhập hàng</option>
              {receiptRows.map((r, i) => (
                <option key={r.id} value={i}>
                  {r.ticketNo} — {r.supplier || "Chưa có NCC"} ({formatDateTimeDMY(r.date)})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            {selectedReceipt ? (
              <input type="text" className={styles.underlineInput} value={selectedReceipt.supplier || ""} readOnly />
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
            <label className={styles.label}>Người nhận</label>
            <input
              type="text"
              className={styles.underlineInput}
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="Người nhận"
            />
          </div>

          <div className={styles.field}>
            <input
              type="text"
              className={styles.underlineInput}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tham chiếu</label>
            <input
              type="text"
              className={styles.underlineInput}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Tham chiếu"
            />
          </div>
        </div>

        <div>
          <div className={styles.field}>
            <div className={styles.readonlyBox}>Mã</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ngày trả lại hàng</label>
            <div className={styles.datetimeRow}>
              <span>{formatDateTimeDMY(ticketDate)}</span>
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
                    name="returnPaymentMethod"
                    checked={paymentMethod === opt}
                    onChange={() => setPaymentMethod(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedReceipt && (
        <p className={styles.tableHint}>
          Đang lấy nguyên vật liệu/kho/đơn giá từ phiếu <strong>{selectedReceipt.ticketNo}</strong> — sửa lại Số
          lượng theo phần thực tế muốn trả, để 0 nếu không trả dòng đó.
        </p>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nguyên vật liệu</th>
              <th>Đơn vị</th>
              <th>Kho (*)</th>
              <th>Số lượng đề nghị (*)</th>
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
            {lines.map((line) => {
              const material = materials.find((m) => m.id === line.materialId);
              return (
                <tr key={line.id}>
                  <td>
                    <div className={styles.chipCell}>
                      <select
                        className={styles.chipSelect}
                        value={line.materialId}
                        disabled={line.fromReceipt}
                        onChange={(e) => updateLine(line.id, { materialId: e.target.value })}
                      >
                        <option value="">Chọn nguyên vật liệu</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      {line.materialId && !line.fromReceipt && (
                        <button
                          type="button"
                          className={styles.chipClearBtn}
                          onClick={() => updateLine(line.id, { materialId: "" })}
                        >
                          <X size={13} />
                        </button>
                      )}
                      {!line.fromReceipt && (
                        <button
                          type="button"
                          className={styles.chipAddBtn}
                          onClick={() => onToast("Chức năng đang được phát triển")}
                        >
                          <Plus size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>{material?.unit || ""}</td>
                  <td>
                    <div className={styles.chipCell}>
                      <select
                        className={styles.chipSelect}
                        value={line.warehouse}
                        onChange={(e) => updateLine(line.id, { warehouse: e.target.value })}
                      >
                        {activeWarehouseNames.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                      {line.warehouse && (
                        <button
                          type="button"
                          className={styles.chipClearBtn}
                          onClick={() => updateLine(line.id, { warehouse: "" })}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className={styles.numInput}
                      value={line.qty}
                      onChange={(e) => updateLine(line.id, { qty: e.target.value })}
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className={styles.numInput}
                      value={line.price}
                      onChange={(e) => updateLine(line.id, { price: e.target.value })}
                    />
                  </td>
                  <td className={styles.thanhTien}>{formatCurrency(lineAmount(line))}</td>
                  <td>
                    {!line.fromReceipt && (
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
              <td colSpan={5}>Tổng</td>
              <td colSpan={2}>{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
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

export default AddPurchaseReturnModal;
