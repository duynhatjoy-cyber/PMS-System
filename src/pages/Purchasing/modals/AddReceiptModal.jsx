import { useState } from "react";
import { Calendar, Clock, Plus, X, Trash2 } from "lucide-react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import {
  useActiveSuppliers,
  useActiveWarehouseNames,
  useActiveMaterials,
  useWarehouseConfig,
} from "../../../context/WarehouseConfigContext";
import { formatDateTimeDMY, formatCurrency } from "../../../utils/format";
import { lineAmount } from "../../Warehouse/hooks/useLineItems";
import generateTicketNo from "../../Warehouse/ticketNo";
import AddMaterialModal from "../../Warehouse/modals/AddMaterialModal";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

const PAYMENT_METHODS = ["Ghi nợ NCC", "Thanh toán ngay"];

// Nhập hàng có thể chọn "Từ đơn đặt hàng" (1 phiếu Đặt hàng chưa hoàn tất) —
// khi chọn, các dòng hàng được điền sẵn nguyên vật liệu/số lượng/đơn giá đã
// đặt để người dùng sửa lại theo hàng thực nhận + chọn Kho nhận, dòng nào lệch
// so với lúc đặt được đánh dấu ngay trong bảng. Không dùng useLineItems ở đây
// vì cần thay TOÀN BỘ danh sách dòng mỗi khi đổi đơn đặt hàng — khác với nhu
// cầu chỉ thêm/xóa từng dòng của hook đó.
//
// Khi có `row` (mở từ Chi tiết), phiếu đã gắn cố định với 1 đơn đặt hàng (hay
// không) từ lúc tạo — ẩn hẳn dropdown "Từ đơn đặt hàng" thay vì cho đổi lại.
function AddReceiptModal({ row, openOrders = [], onSave, onClose, onToast }) {
  const activeSuppliers = useActiveSuppliers();
  const activeWarehouseNames = useActiveWarehouseNames();
  const materials = useActiveMaterials();
  const { setMaterials } = useWarehouseConfig();
  const [addMaterialFor, setAddMaterialFor] = useState(null);

  function blankLine(id) {
    return { id, materialId: "", warehouse: activeWarehouseNames[0] || "", qty: "", price: "" };
  }

  function rowLinesToState(r) {
    if (!r?.lines?.length) return null;
    return r.lines.map((l, i) => ({
      id: i + 1,
      materialId: materials.find((m) => m.name === l.name)?.id || "",
      warehouse: l.warehouse || activeWarehouseNames[0] || "",
      orderedQty: l.orderedQty,
      orderedPrice: l.orderedPrice,
      qty: l.qty,
      price: l.price,
    }));
  }

  const [ticketDate] = useState(() => row?.date ?? new Date());
  const [orderIndex, setOrderIndex] = useState("");
  const [manualSupplierIndex, setManualSupplierIndex] = useState(() => {
    if (!row || row.orderId) return "";
    const idx = activeSuppliers.findIndex((s) => s.name === row.supplier);
    return idx >= 0 ? String(idx) : "";
  });
  const [deliveryPerson, setDeliveryPerson] = useState(row?.deliveryPerson ?? "");
  const [reference, setReference] = useState(row?.reference ?? "");
  const [note, setNote] = useState(row?.note ?? "");
  const [paymentMethod, setPaymentMethod] = useState(row?.paymentMethod ?? PAYMENT_METHODS[0]);
  const [lines, setLines] = useState(() => rowLinesToState(row) || [blankLine(1)]);
  const [nextLineId, setNextLineId] = useState(() => (row?.lines?.length ? row.lines.length + 1 : 2));
  // Theo dõi lần đổi "Từ đơn đặt hàng" gần nhất để nạp lại toàn bộ dòng hàng
  // ngay trong lúc render (không dùng effect) — mẫu "adjusting state during
  // render" của React, tránh setState lồng trong effect. Bỏ qua khi đang sửa
  // 1 phiếu có sẵn (`row`) vì dropdown này ẩn, orderIndex không đổi.
  const [linesForOrderIndex, setLinesForOrderIndex] = useState(orderIndex);

  const selectedOrder = orderIndex === "" ? null : openOrders[Number(orderIndex)];

  if (!row && orderIndex !== linesForOrderIndex) {
    setLinesForOrderIndex(orderIndex);
    if (selectedOrder) {
      setLines(
        selectedOrder.lines.map((l, i) => ({
          id: i + 1,
          materialId: materials.find((m) => m.name === l.name)?.id || "",
          warehouse: activeWarehouseNames[0] || "",
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
  const canSave = lines.some((line) => line.materialId && line.warehouse && Number(line.qty) > 0);
  const hasOrderColumn = Boolean(selectedOrder) || lines.some((l) => l.orderedQty != null);
  const orderRefLabel = selectedOrder?.ticketNo || row?.orderRef;

  function buildLines() {
    return lines
      .filter((line) => line.materialId && line.warehouse && Number(line.qty) > 0)
      .map((line) => {
        const material = materials.find((m) => m.id === line.materialId);
        return {
          name: material?.name || "",
          unit: material?.unit || "",
          warehouse: line.warehouse,
          qty: Number(line.qty) || 0,
          price: Number(line.price) || 0,
          orderedQty: line.orderedQty,
          orderedPrice: line.orderedPrice,
        };
      });
  }

  function handleSave() {
    if (!canSave) return;
    if (row) {
      onSave({
        ...row,
        date: ticketDate,
        reference,
        deliveryPerson,
        paymentMethod,
        supplier: row.orderId ? row.supplier : manualSupplier?.name || "",
        total,
        note,
        mismatch: anyMismatch,
        lines: buildLines(),
      });
      return;
    }
    const ticketNo = generateTicketNo("PN");
    onSave({
      id: ticketNo,
      ticketNo,
      date: ticketDate,
      reference,
      deliveryPerson,
      paymentMethod,
      inspectionStatus: "Chưa kiểm kê hàng hóa",
      supplier: selectedOrder ? selectedOrder.supplier : manualSupplier?.name || "",
      total,
      note,
      orderRef: selectedOrder?.ticketNo,
      orderId: selectedOrder?.id,
      mismatch: selectedOrder ? anyMismatch : false,
      lines: buildLines(),
    });
  }

  function handleAddMaterial(material) {
    setMaterials((prev) => [...prev, material]);
    updateLine(addMaterialFor, { materialId: material.id });
    setAddMaterialFor(null);
    onToast(`Đã thêm nguyên vật liệu "${material.name}"`);
  }

  return (
    <>
      <SlidePanelShell
        title={row ? "Chi tiết phiếu nhập hàng" : "Thêm phiếu nhập hàng"}
        onClose={onClose}
        tone="brand"
        width={1080}
      >
        <div className={styles.formGrid}>
          <div>
            <div className={styles.field}>
              <label className={styles.label}>Từ đơn đặt hàng</label>
              {row ? (
                <input type="text" className={styles.underlineInput} value={row.orderRef || "—"} readOnly />
              ) : (
                <select
                  className={styles.underlineSelect}
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(e.target.value)}
                >
                  <option value="">Nhập trực tiếp, không theo đơn đặt hàng</option>
                  {openOrders.map((o, i) => (
                    <option key={o.id} value={i}>
                      {o.ticketNo} — {o.supplier || "Chưa có NCC"} ({formatDateTimeDMY(o.date)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className={styles.field}>
              {selectedOrder || (row && row.orderId) ? (
                <input
                  type="text"
                  className={styles.underlineInput}
                  value={selectedOrder ? selectedOrder.supplier : row.supplier || ""}
                  readOnly
                />
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
              <label className={styles.label}>Người giao hàng</label>
              <input
                type="text"
                className={styles.underlineInput}
                value={deliveryPerson}
                onChange={(e) => setDeliveryPerson(e.target.value)}
                placeholder="Người giao hàng"
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
              <label className={styles.label}>Mã</label>
              <input
                type="text"
                className={styles.underlineInput}
                value={row?.ticketNo ?? ""}
                readOnly
                placeholder="Tự động"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ngày nhập hàng</label>
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
                      name="receiptPaymentMethod"
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

        {orderRefLabel && (
          <p className={styles.tableHint}>
            Đang so sánh với đơn <strong>{orderRefLabel}</strong> — sửa lại Số lượng/Đơn giá theo hàng thực nhận,
            dòng lệch so với lúc đặt sẽ hiện màu đỏ.
          </p>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nguyên vật liệu</th>
                <th>Đơn vị</th>
                <th>Kho (*)</th>
                {hasOrderColumn && <th>SL/Giá đã đặt</th>}
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
              {lines.map((line) => {
                const material = materials.find((m) => m.id === line.materialId);
                const mismatch = isMismatchLine(line);
                const fromOrder = line.orderedQty != null;
                return (
                  <tr key={line.id}>
                    <td>
                      <div className={styles.chipCell}>
                        <select
                          className={styles.chipSelect}
                          value={line.materialId}
                          disabled={fromOrder}
                          onChange={(e) => updateLine(line.id, { materialId: e.target.value })}
                        >
                          <option value="">Chọn nguyên vật liệu</option>
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                        {line.materialId && !fromOrder && (
                          <button
                            type="button"
                            className={styles.chipClearBtn}
                            onClick={() => updateLine(line.id, { materialId: "" })}
                          >
                            <X size={13} />
                          </button>
                        )}
                        {!fromOrder && (
                          <button
                            type="button"
                            className={styles.chipAddBtn}
                            onClick={() => setAddMaterialFor(line.id)}
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
                    {hasOrderColumn && (
                      <td className={styles.numCell}>
                        {fromOrder ? `${line.orderedQty} × ${formatCurrency(line.orderedPrice)}` : "—"}
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
                      />
                    </td>
                    <td className={styles.thanhTien}>{formatCurrency(lineAmount(line))}</td>
                    <td>
                      {!fromOrder && (
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
                <td colSpan={hasOrderColumn ? 6 : 5}>Tổng</td>
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

      {addMaterialFor != null && (
        <AddMaterialModal onClose={() => setAddMaterialFor(null)} onSave={handleAddMaterial} />
      )}
    </>
  );
}

export default AddReceiptModal;
