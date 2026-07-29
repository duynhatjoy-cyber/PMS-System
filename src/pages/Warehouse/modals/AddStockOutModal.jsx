import { useState } from "react";
import { Calendar, Clock, Plus, X, Trash2 } from "lucide-react";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { MATERIALS, STOCK_OUT_DOC_TYPES } from "../../../data/warehouseData";
import { useActiveWarehouseNames } from "../../../context/WarehouseConfigContext";
import { formatDateTimeDMY, formatCurrency } from "../../../utils/format";
import useLineItems, { lineAmount } from "../hooks/useLineItems";
import generateTicketNo from "../ticketNo";
import styles from "./WarehouseModal.module.css";

function AddStockOutModal({ onClose, onSave, onToast }) {
  const activeWarehouseNames = useActiveWarehouseNames();

  function emptyLine(id) {
    return { id, materialId: "", warehouse: activeWarehouseNames[0], qty: "", price: "" };
  }

  const [ticketDate] = useState(() => new Date());
  const [docType, setDocType] = useState(STOCK_OUT_DOC_TYPES[0]);
  const [target, setTarget] = useState("");
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");
  const { lines, updateLine, addLine, removeLine } = useLineItems(emptyLine);

  const total = lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const canSave = lines.some((line) => line.materialId && line.warehouse && Number(line.qty) > 0);

  function handleSave() {
    if (!canSave) return;
    const ticketNo = generateTicketNo("XK");
    onSave({
      id: ticketNo,
      ticketNo,
      date: ticketDate,
      bookingCode: "",
      invoiceCode: "",
      total,
      note,
      target,
      docType,
    });
  }

  return (
    <ModalShell title="Thêm phiếu xuất kho" onClose={onClose} tone="brand" width={900}>
      <div className={styles.formGrid}>
        <div>
          <div className={styles.field}>
            <label className={styles.label}>Phiếu xuất kho</label>
            <select
              className={styles.underlineSelect}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              {STOCK_OUT_DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <input
              type="text"
              className={styles.underlineInput}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Đối tượng"
            />
          </div>

          <div className={styles.field}>
            <input
              type="text"
              className={styles.underlineInput}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Diễn giải"
            />
          </div>
        </div>

        <div>
          <div className={styles.field}>
            <div className={styles.readonlyBox}>Mã</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ngày xuất</label>
            <div className={styles.datetimeRow}>
              <span>{formatDateTimeDMY(ticketDate)}</span>
              <Calendar size={14} />
              <Clock size={14} />
            </div>
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
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nguyên vật liệu</th>
              <th>Kho (*)</th>
              <th>Đơn vị</th>
              <th>Số lượng(*)</th>
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
              const material = MATERIALS.find((m) => m.id === line.materialId);
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
                        {MATERIALS.map((m) => (
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
                      <button
                        type="button"
                        className={styles.chipAddBtn}
                        onClick={() => onToast("Chức năng đang được phát triển")}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </td>
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
                    </div>
                  </td>
                  <td>{material?.unit || ""}</td>
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
                    <button type="button" className={styles.removeBtn} onClick={() => removeLine(line.id)}>
                      <Trash2 size={15} />
                    </button>
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
    </ModalShell>
  );
}

export default AddStockOutModal;
