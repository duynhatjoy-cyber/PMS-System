import { useState } from "react";
import { Calendar, Plus, X, Trash2 } from "lucide-react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { useActiveSuppliers, useActiveMaterials, useWarehouseConfig } from "../../../context/WarehouseConfigContext";
import { formatDMY, formatCurrency } from "../../../utils/format";
import useLineItems, { lineAmount } from "../../Warehouse/hooks/useLineItems";
import generateTicketNo from "../../Warehouse/ticketNo";
import AddMaterialModal from "../../Warehouse/modals/AddMaterialModal";
import { PURCHASE_STATUS_OPTIONS } from "../../../data/purchasingData";
import styles from "../../Warehouse/modals/WarehouseModal.module.css";

// Phiếu đặt hàng có dòng hàng (nguyên vật liệu - đơn vị - số lượng - đơn giá)
// để Nhập hàng sau này so sánh với hàng nhận thực tế. seedLine điền sẵn dòng
// đầu khi tạo đơn từ 1 phiếu báo hàng (ReportPanel) — chỉ có tên/đơn vị dạng
// chữ nên tra lại đúng nguyên vật liệu theo tên khi dựng dòng đầu.
function AddPurchaseOrderModal({ row, seedLine, actions = [], onSave, onClose, onToast }) {
  const activeSuppliers = useActiveSuppliers();
  const materials = useActiveMaterials();
  const { setMaterials } = useWarehouseConfig();
  const [addMaterialFor, setAddMaterialFor] = useState(null);

  const [ticketDate] = useState(() => row?.date ?? new Date());
  const [status, setStatus] = useState(row?.status ?? PURCHASE_STATUS_OPTIONS[1]);
  const [supplierIndex, setSupplierIndex] = useState(() => {
    const idx = activeSuppliers.findIndex((s) => s.name === row?.supplier);
    return idx >= 0 ? String(idx) : "";
  });
  const [expectedDate, setExpectedDate] = useState(() => {
    if (!row?.expectedDate) return "";
    const d = row.expectedDate;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [note, setNote] = useState(row?.note ?? (seedLine ? `Đặt hàng theo phiếu báo hàng — ${seedLine.name}` : ""));

  function emptyLine(id) {
    return { id, materialId: "", qty: "", price: "" };
  }

  function makeLine(id) {
    if (id === 1 && seedLine) {
      return { id, materialId: materials.find((m) => m.name === seedLine.name)?.id || "", qty: seedLine.qty ?? "", price: "" };
    }
    return emptyLine(id);
  }

  function rowLinesToLines(lines) {
    return lines?.map((l) => ({
      materialId: materials.find((m) => m.name === l.name)?.id || "",
      qty: l.qty,
      price: l.price,
    }));
  }

  const { lines, updateLine, addLine, removeLine } = useLineItems(makeLine, rowLinesToLines(row?.lines));

  const supplier = supplierIndex === "" ? null : activeSuppliers[Number(supplierIndex)];
  const total = lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const canSave = lines.some((line) => line.materialId && Number(line.qty) > 0);

  function buildLines() {
    return lines
      .filter((line) => line.materialId && Number(line.qty) > 0)
      .map((line) => {
        const material = materials.find((m) => m.id === line.materialId);
        return {
          name: material?.name || "",
          unit: material?.unit || "",
          qty: Number(line.qty) || 0,
          price: Number(line.price) || 0,
        };
      });
  }

  function handleSave() {
    if (!canSave) return;
    if (row) {
      onSave({
        ...row,
        date: ticketDate,
        status,
        supplier: supplier?.name || "",
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        lines: buildLines(),
        total,
        note,
      });
      return;
    }
    const ticketNo = generateTicketNo("DH");
    onSave({
      id: ticketNo,
      ticketNo,
      date: ticketDate,
      status,
      supplier: supplier?.name || "",
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      lines: buildLines(),
      total,
      note,
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
        title={row ? "Chi tiết phiếu đặt hàng" : "Thêm phiếu đặt hàng"}
        onClose={onClose}
        tone="brand"
        width={1080}
      >
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
                <th>Nguyên vật liệu</th>
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
                        <button
                          type="button"
                          className={styles.chipAddBtn}
                          onClick={() => setAddMaterialFor(line.id)}
                        >
                          <Plus size={13} />
                        </button>
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
                );
              })}
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
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`${shared.btn} ${action.danger ? shared.btnDanger : shared.btnSuccess}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
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

      {addMaterialFor != null && (
        <AddMaterialModal onClose={() => setAddMaterialFor(null)} onSave={handleAddMaterial} />
      )}
    </>
  );
}

export default AddPurchaseOrderModal;
