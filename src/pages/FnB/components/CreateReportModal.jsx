import { useState } from "react";
import { Plus, X } from "lucide-react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { avatarColorAt } from "./ingredientAvatar";
import styles from "../FnB.module.css";

let draftId = 0;
function blankLine() {
  return { id: `draft-${draftId++}`, ingredientId: "", qty: "" };
}

function thresholdLine(ing) {
  const qty = ing.threshold || Number(ing.usedQty.toFixed(2)) || "";
  return { id: `draft-${draftId++}`, ingredientId: ing.id, qty: String(qty) };
}

// Tạo tay 1 phiếu báo hàng gộp nhiều nguyên vật liệu tự chọn — độc lập với
// ngưỡng cảnh báo, dùng khi nhân viên muốn báo hàng loạt theo ý mình. Cùng
// mẫu dòng chọn nguyên liệu + số lượng với RecipeModal. seedIngredients điền
// sẵn dòng cho nguyên liệu gọi vào (nút đầu trang = mọi NVL vượt ngưỡng, "Tạo
// phiếu báo hàng" ở từng dòng = đúng 1 NVL đó) — luôn cho xem/sửa/xoá trước
// khi lưu, không tạo phiếu ngay lúc bấm.
function CreateReportModal({ ingredients, seedIngredients = [], onSave, onClose }) {
  const [note, setNote] = useState("");
  const [lines, setLines] = useState(() =>
    seedIngredients.length > 0 ? seedIngredients.map(thresholdLine) : [blankLine()]
  );

  function updateLine(id, patch) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, blankLine()]);
  }

  function removeLine(id) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  const selected = lines
    .filter((l) => l.ingredientId && Number(l.qty) > 0)
    .map((l) => ({ ingredient: ingredients.find((i) => i.id === l.ingredientId), qty: Number(l.qty) }))
    .filter((s) => s.ingredient);

  const canSave = selected.length > 0;

  function handleSave() {
    if (!canSave) return;
    const names = selected.map((s) => `"${s.ingredient.name}"`).join(", ");
    onSave(selected, note.trim() || `Báo hàng thủ công cho ${names}.`);
  }

  return (
    <SlidePanelShell
      title="Tạo phiếu báo hàng"
      onClose={onClose}
      tone="brand"
      width={820}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Huỷ
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            disabled={!canSave}
            onClick={handleSave}
          >
            Tạo phiếu
          </button>
        </>
      }
    >
      <div className={shared.stack}>
        <label className={shared.field}>
          <span className={shared.label}>Ghi chú</span>
          <input
            className={shared.input}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Chuẩn bị cho tiệc cuối tuần"
          />
        </label>

        <div>
          <div className={styles.lineHeaderRow}>
            <span className={styles.recipeSelectWrap}>Nguyên vật liệu</span>
            <span className={styles.recipeQtyWrap}>Số lượng đề nghị</span>
            <span className={styles.recipeUnit}>Đvt</span>
          </div>
          <div className={styles.lineList}>
            {lines.map((line) => {
              const ingredient = ingredients.find((i) => i.id === line.ingredientId);
              const colorIndex = ingredients.findIndex((i) => i.id === line.ingredientId);
              return (
                <div key={line.id} className={styles.lineRow}>
                  {ingredient ? (
                    <span
                      className={styles.ingredientAvatar}
                      style={{ background: avatarColorAt(colorIndex).bg, color: avatarColorAt(colorIndex).fg }}
                    >
                      {ingredient.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <span className={styles.ingredientAvatar} />
                  )}
                  <div className={styles.recipeSelectWrap}>
                    <select
                      className={shared.select}
                      value={line.ingredientId}
                      onChange={(e) => updateLine(line.id, { ingredientId: e.target.value })}
                    >
                      <option value="">Chọn nguyên vật liệu</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.recipeQtyWrap}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={shared.input}
                      value={line.qty}
                      onChange={(e) => updateLine(line.id, { qty: e.target.value })}
                      placeholder="SL"
                    />
                  </div>
                  <span className={styles.recipeUnit}>{ingredient?.unit ?? ""}</span>
                  <button type="button" className={styles.lineRemoveBtn} onClick={() => removeLine(line.id)}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <button type="button" className={styles.addCategoryBtn} onClick={addLine}>
          <Plus size={14} /> Thêm nguyên liệu
        </button>
      </div>
    </SlidePanelShell>
  );
}

export default CreateReportModal;
