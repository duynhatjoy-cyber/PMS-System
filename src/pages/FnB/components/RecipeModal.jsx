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

function RecipeModal({ item, ingredients, onSave, onClose }) {
  const [lines, setLines] = useState(
    item.recipe.length > 0
      ? item.recipe.map((r) => ({ id: `draft-${draftId++}`, ingredientId: r.ingredientId, qty: String(r.qty) }))
      : [blankLine()]
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

  function handleSave() {
    const recipe = lines
      .filter((l) => l.ingredientId && Number(l.qty) > 0)
      .map((l) => ({ ingredientId: l.ingredientId, qty: Number(l.qty) }));
    onSave(recipe);
  }

  return (
    <SlidePanelShell
      title={`Công thức chế biến — ${item.name}`}
      onClose={onClose}
      tone="brand"
      width={540}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Huỷ
          </button>
          <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={handleSave}>
            Lưu
          </button>
        </>
      }
    >
      <div className={shared.stack}>
        <p className={shared.hint}>
          Định lượng nguyên vật liệu tiêu hao cho 1 phần "{item.name}". Khi món này được bán, hao hụt sẽ tự cộng
          dồn theo công thức bên dưới.
        </p>

        <div>
          <div className={styles.lineHeaderRow}>
            <span className={styles.recipeSelectWrap}>Nguyên vật liệu</span>
            <span className={styles.recipeQtyWrap}>Số lượng</span>
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

export default RecipeModal;
