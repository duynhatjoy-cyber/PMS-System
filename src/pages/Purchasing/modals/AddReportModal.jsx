import { useState } from "react";
import { Calendar, Clock, Plus, X, Trash2 } from "lucide-react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { useActiveMaterials } from "../../../context/WarehouseConfigContext";
import { STOCK_SUMMARY_ROWS } from "../../../data/warehouseData";
import { formatDateTimeDMY } from "../../../utils/format";
import useLineItems from "../../Warehouse/hooks/useLineItems";
import generateTicketNo from "../../Warehouse/ticketNo";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

// Phiếu báo hàng chỉ là đề xuất mua trước khi có đơn đặt hàng thật (không có
// Kho/Đơn giá như Nhập/Trả hàng) — dòng nào cũng tra "Số lượng tồn" hiện có
// theo đúng nguyên vật liệu (STOCK_SUMMARY_ROWS) để người báo hàng biết còn
// bao nhiêu trước khi đề nghị mua thêm; ẩn/hiện cột này qua checkbox vì không
// phải lúc nào cũng cần so sánh với tồn kho.
function AddReportModal({ statusOptions, onSave, onClose }) {
  const materials = useActiveMaterials();

  function emptyLine(id) {
    return { id, materialId: "", neededQty: "", requestedQty: "" };
  }

  const [ticketDate] = useState(() => new Date());
  const [status, setStatus] = useState(statusOptions[0]);
  const [reporter, setReporter] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");
  const [showStockQty, setShowStockQty] = useState(true);
  const { lines, updateLine, addLine, removeLine } = useLineItems(emptyLine);

  const canSave = lines.some((line) => line.materialId && Number(line.requestedQty) > 0);

  function stockQtyFor(materialName) {
    return STOCK_SUMMARY_ROWS.find((s) => s.material === materialName)?.closing ?? 0;
  }

  function handleSave() {
    if (!canSave) return;
    const ticketNo = generateTicketNo("BH");
    onSave({
      id: ticketNo,
      ticketNo,
      date: ticketDate,
      status,
      reporter,
      address,
      reference,
      note,
      lines: lines
        .filter((line) => line.materialId && Number(line.requestedQty) > 0)
        .map((line) => {
          const material = materials.find((m) => m.id === line.materialId);
          return {
            name: material?.name || "",
            unit: material?.unit || "",
            neededQty: Number(line.neededQty) || 0,
            stockQty: stockQtyFor(material?.name),
            requestedQty: Number(line.requestedQty) || 0,
          };
        }),
    });
  }

  return (
    <SlidePanelShell title="Thêm phiếu báo hàng" onClose={onClose} tone="brand" width={900}>
      <div className={styles.formGrid}>
        <div>
          <div className={styles.field}>
            <input
              type="text"
              className={styles.underlineInput}
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              placeholder="Người báo hàng"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Địa chỉ</label>
            <input
              type="text"
              className={styles.underlineInput}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
            <label className={styles.label}>Ngày</label>
            <div className={styles.datetimeRow}>
              <span>{formatDateTimeDMY(ticketDate)}</span>
              <Calendar size={14} />
              <Clock size={14} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Trạng thái</label>
            <select className={styles.underlineSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <label className={shared.checkboxRow}>
            <input
              type="checkbox"
              checked={showStockQty}
              onChange={(e) => setShowStockQty(e.target.checked)}
            />
            Hiển thị số lượng tồn nguyên vật liệu
          </label>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nguyên vật liệu</th>
              <th>Đơn vị</th>
              <th>Số lượng cần</th>
              {showStockQty && <th>Số lượng tồn</th>}
              <th>Số lượng đề nghị</th>
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
                        onChange={(e) => updateLine(line.id, { materialId: e.target.value })}
                      >
                        <option value="">Chọn nguyên vật liệu</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      {line.materialId && (
                        <button
                          type="button"
                          className={styles.chipClearBtn}
                          onClick={() => updateLine(line.id, { materialId: "" })}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>{material?.unit || ""}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className={styles.numInput}
                      value={line.neededQty}
                      onChange={(e) => updateLine(line.id, { neededQty: e.target.value })}
                      placeholder="0"
                    />
                  </td>
                  {showStockQty && (
                    <td className={styles.numCell}>{material ? stockQtyFor(material.name) : "—"}</td>
                  )}
                  <td>
                    <input
                      type="number"
                      min="0"
                      className={styles.numInput}
                      value={line.requestedQty}
                      onChange={(e) => updateLine(line.id, { requestedQty: e.target.value })}
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <button type="button" className={styles.removeBtn} onClick={() => removeLine(line.id)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
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

export default AddReportModal;
