import { useState } from "react";
import { Calendar, Plus, X, Trash2 } from "lucide-react";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { MATERIALS, STOCK_SUMMARY_ROWS } from "../../../data/warehouseData";
import { useActiveWarehouseNames } from "../../../context/WarehouseConfigContext";
import { formatDMY } from "../../../utils/format";
import useLineItems from "../hooks/useLineItems";
import generateTicketNo from "../ticketNo";
import styles from "./WarehouseModal.module.css";

function emptyLine(id) {
  return { id, materialId: "", counted: "", reason: "" };
}

function systemQty(materialId) {
  const material = MATERIALS.find((m) => m.id === materialId);
  const summary = material && STOCK_SUMMARY_ROWS.find((r) => r.material === material.name);
  return summary ? summary.closing : 0;
}

function resolutionLabel(diff) {
  if (diff > 0) return "Thừa";
  if (diff < 0) return "Thiếu";
  return "Đủ";
}

function AddStockCheckModal({ onClose, onSave, onToast }) {
  const activeWarehouseNames = useActiveWarehouseNames();
  const [checkDate] = useState(() => new Date());
  const [innerTab, setInnerTab] = useState("materials");
  const [purpose, setPurpose] = useState("");
  const [warehouse, setWarehouse] = useState(activeWarehouseNames[0]);
  const dueDate = checkDate;
  const checkDay = checkDate;
  const [conclusion, setConclusion] = useState("");
  const { lines, updateLine, addLine, removeLine } = useLineItems(emptyLine);

  const canSave = Boolean(warehouse) && lines.some((line) => line.materialId && line.counted !== "");

  function handleSave(status) {
    if (!canSave) return;
    const ticketNo = generateTicketNo("KK");
    onSave({
      id: ticketNo,
      ticketNo,
      date: checkDay,
      warehouse,
      note: conclusion,
      status,
    });
  }

  return (
    <ModalShell title="Thêm phiếu kiểm kê kho" onClose={onClose} tone="brand" width={1000}>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <input
            type="text"
            className={styles.underlineInput}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Mục đích"
          />
        </div>
        <div className={styles.field}>
          <div className={styles.readonlyBox}>Mã</div>
        </div>
      </div>

      <div className={styles.formGrid} style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className={styles.field}>
          <div className={styles.chipCell}>
            <select
              className={styles.chipSelect}
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
            >
              {activeWarehouseNames.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            {warehouse && (
              <button type="button" className={styles.chipClearBtn} onClick={() => setWarehouse("")}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Kiểm kê đến ngày</label>
          <div className={styles.datetimeRow}>
            <span>{formatDMY(dueDate)}</span>
            <Calendar size={14} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Ngày kiểm kê(*)</label>
          <div className={styles.datetimeRow}>
            <span>{formatDMY(checkDay)}</span>
            <Calendar size={14} />
          </div>
        </div>
      </div>

      <div className={styles.innerTabs}>
        <button
          type="button"
          className={`${styles.innerTab} ${innerTab === "materials" ? styles.innerTabActive : ""}`}
          onClick={() => setInnerTab("materials")}
        >
          Nguyên vật liệu
        </button>
        <button
          type="button"
          className={`${styles.innerTab} ${innerTab === "members" ? styles.innerTabActive : ""}`}
          onClick={() => setInnerTab("members")}
        >
          Thành viên tham gia
        </button>
      </div>

      {innerTab === "materials" ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th rowSpan={2}>Nguyên vật liệu</th>
                <th rowSpan={2}>Đơn vị</th>
                <th colSpan={3}>Số lượng(*)</th>
                <th rowSpan={2}>Nguyên nhân</th>
                <th rowSpan={2}>Xử lý</th>
                <th rowSpan={2} className={styles.thAction}>
                  <button type="button" className={styles.addRowBtn} onClick={addLine}>
                    <Plus size={16} />
                  </button>
                </th>
              </tr>
              <tr className={styles.subHeadRow}>
                <th>Hệ thống</th>
                <th>Kiểm kê</th>
                <th>Chênh lệch</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const material = MATERIALS.find((m) => m.id === line.materialId);
                const system = line.materialId ? systemQty(line.materialId) : null;
                const diff = line.materialId && line.counted !== "" ? Number(line.counted) - system : null;
                return (
                  <tr key={line.id}>
                    <td>
                      <div className={styles.chipCell}>
                        <select
                          className={styles.chipSelect}
                          value={line.materialId}
                          onChange={(e) => updateLine(line.id, { materialId: e.target.value })}
                        >
                          <option value="">Chọn nguyên vật liệu?</option>
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
                      </div>
                    </td>
                    <td>{material?.unit || ""}</td>
                    <td className={styles.thanhTien}>{system !== null ? system : ""}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className={styles.numInput}
                        value={line.counted}
                        onChange={(e) => updateLine(line.id, { counted: e.target.value })}
                        placeholder="0.00"
                      />
                    </td>
                    <td className={styles.thanhTien}>{diff !== null ? diff : ""}</td>
                    <td>
                      <input
                        type="text"
                        className={styles.textInput}
                        value={line.reason}
                        onChange={(e) => updateLine(line.id, { reason: e.target.value })}
                      />
                    </td>
                    <td>{diff !== null ? resolutionLabel(diff) : ""}</td>
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
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th className={styles.thAction}>
                  <button
                    type="button"
                    className={styles.addRowBtn}
                    onClick={() => onToast("Chức năng đang được phát triển")}
                  >
                    <Plus size={16} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={2} style={{ textAlign: "center", color: "var(--fd-text-muted)" }}>
                  Chưa có thành viên tham gia
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.field} style={{ marginTop: 16 }}>
        <input
          type="text"
          className={styles.underlineInput}
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value.slice(0, 150))}
          placeholder="Kết luận"
          maxLength={150}
        />
        <span className={styles.charCount}>{conclusion.length}/150</span>
      </div>

      <div className={styles.footerBtns}>
        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary}`}
          disabled={!canSave}
          onClick={() => handleSave("Chưa xử lý")}
        >
          LƯU
        </button>
        <button
          type="button"
          className={`${shared.btn} ${shared.btnSecondary}`}
          disabled={!canSave}
          onClick={() => handleSave("Đã xử lý")}
        >
          XỬ LÝ
        </button>
        <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
          BỎ QUA
        </button>
      </div>
    </ModalShell>
  );
}

export default AddStockCheckModal;
