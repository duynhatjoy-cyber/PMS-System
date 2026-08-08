import { useState } from "react";
import { Box, Plus } from "lucide-react";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import ConfirmDialog from "../../../components/ConfirmDialog";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import EmptyState from "../../../components/EmptyState";
import StatCard from "../../FrontDesk/components/StatCard";
import { avatarColorAt } from "./ingredientAvatar";
import { nextDraftId } from "../../../data/fnbData";
import fnbStyles from "../FnB.module.css";
import styles from "../../Warehouse/Warehouse.module.css";

function emptyForm(ingredient) {
  return { name: ingredient?.name ?? "", unit: ingredient?.unit ?? "" };
}

function IngredientsPanel({ ingredients, setIngredients, categories, setCategories, onToast }) {
  const [modal, setModal] = useState(null); // { editing: ingredient|null, form }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const usedIngredientIds = new Set(
    categories.flatMap((c) => c.items.flatMap((item) => item.recipe.map((r) => r.ingredientId)))
  );
  const inUseCount = ingredients.filter((i) => usedIngredientIds.has(i.id)).length;
  const depletedCount = ingredients.filter((i) => i.usedQty > 0).length;
  const topUsed = ingredients.reduce((max, i) => (i.usedQty > (max?.usedQty ?? 0) ? i : max), null);

  function openAddModal() {
    setModal({ editing: null, form: emptyForm(null) });
  }

  function openEditModal(ingredient) {
    setModal({ editing: ingredient, form: emptyForm(ingredient) });
  }

  function patchForm(key, value) {
    setModal((prev) => ({ ...prev, form: { ...prev.form, [key]: value } }));
  }

  function handleSave() {
    const { editing, form } = modal;
    const name = form.name.trim();
    const unit = form.unit.trim();
    if (!name) return;

    if (editing) {
      setIngredients((prev) => prev.map((i) => (i.id === editing.id ? { ...i, name, unit } : i)));
      onToast(`Đã cập nhật nguyên vật liệu "${name}"`);
    } else {
      setIngredients((prev) => [...prev, { id: nextDraftId("ing"), name, unit, usedQty: 0 }]);
      onToast(`Đã thêm nguyên vật liệu "${name}"`);
    }
    setModal(null);
  }

  function handleConfirmDelete() {
    setIngredients((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        items: c.items.map((item) => ({
          ...item,
          recipe: item.recipe.filter((r) => r.ingredientId !== deleteTarget.id),
        })),
      }))
    );
    onToast(`Đã xóa nguyên vật liệu "${deleteTarget.name}"`);
    setDeleteTarget(null);
  }

  const canSave = modal && modal.form.name.trim();

  return (
    <div>
      <div className={fnbStyles.panelHeaderRow}>
        <div className={fnbStyles.panelHeaderTitleGroup}>
          <span className={fnbStyles.panelHeaderIcon}>
            <Box size={20} />
          </span>
          <div>
            <div className={fnbStyles.panelHeaderTitle}>Nguyên vật liệu &amp; hao hụt</div>
            <p className={fnbStyles.panelHeaderSubtitle}>
              Danh sách nguyên vật liệu chế biến dùng cho công thức món ăn. Hao hụt tự cộng dồn mỗi khi đơn có
              món dùng nguyên liệu này được thanh toán.
            </p>
          </div>
        </div>
        <button type="button" className={fnbStyles.addBtn} onClick={openAddModal}>
          <Plus size={16} /> Thêm nguyên vật liệu
        </button>
      </div>

      <div className={fnbStyles.statsRow}>
        <div className={fnbStyles.statAccent} style={{ borderTopColor: "var(--fd-primary)" }}>
          <StatCard label="Tổng nguyên vật liệu" value={ingredients.length} hint="mục" />
        </div>
        <div className={fnbStyles.statAccent} style={{ borderTopColor: "var(--fd-status-blue)" }}>
          <StatCard label="Đang dùng trong công thức" value={inUseCount} hint="nguyên liệu" />
        </div>
        <div className={fnbStyles.statAccent} style={{ borderTopColor: "var(--fd-warning)" }}>
          <StatCard label="Đã ghi nhận hao hụt" value={depletedCount} hint="nguyên liệu" />
        </div>
        <div className={fnbStyles.statAccent} style={{ borderTopColor: "var(--fd-danger)" }}>
          <StatCard
            label="Hao hụt nhiều nhất"
            value={topUsed ? topUsed.name : "—"}
            hint={topUsed ? `${Number(topUsed.usedQty.toFixed(2))} ${topUsed.unit}` : "Chưa có dữ liệu"}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nguyên vật liệu</th>
                <th className={styles.numCell}>Đơn vị</th>
                <th className={styles.numCell}>Hao hụt (đã bán)</th>
                <th className={styles.thActionCell} />
              </tr>
            </thead>
            <tbody>
              {ingredients.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={4}>
                    <EmptyState
                      message="Chưa có nguyên vật liệu nào."
                      hint='Nhấn "Thêm nguyên vật liệu" để tạo mục đầu tiên.'
                    />
                  </td>
                </tr>
              ) : (
                ingredients.map((ing, index) => {
                  const avatar = avatarColorAt(index);
                  const usedQty = Number(ing.usedQty.toFixed(2));
                  return (
                    <tr key={ing.id}>
                      <td>
                        <div className={fnbStyles.ingredientNameCell}>
                          <span
                            className={fnbStyles.ingredientAvatar}
                            style={{ background: avatar.bg, color: avatar.fg }}
                          >
                            {ing.name.charAt(0).toUpperCase()}
                          </span>
                          {ing.name}
                        </div>
                      </td>
                      <td className={styles.numCell}>
                        {ing.unit ? <span className={fnbStyles.unitPill}>{ing.unit}</span> : ""}
                      </td>
                      <td className={styles.numCell}>
                        <span className={usedQty > 0 ? fnbStyles.usageValueActive : fnbStyles.usageValueZero}>
                          {usedQty > 0 ? `${usedQty} ${ing.unit}` : "—"}
                        </span>
                      </td>
                      <td>
                        <RowActionMenu
                          items={[
                            { key: "edit", label: "Sửa", onClick: () => openEditModal(ing) },
                            {
                              key: "delete",
                              label: "Xóa",
                              danger: true,
                              divider: true,
                              onClick: () => setDeleteTarget(ing),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ModalShell
          title={modal.editing ? "Sửa nguyên vật liệu" : "Thêm nguyên vật liệu"}
          onClose={() => setModal(null)}
          width={420}
          footer={
            <>
              <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={() => setModal(null)}>
                Huỷ
              </button>
              <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} disabled={!canSave} onClick={handleSave}>
                Lưu
              </button>
            </>
          }
        >
          <div className={shared.stack}>
            <label className={shared.field}>
              <span className={shared.label}>Tên nguyên vật liệu *</span>
              <input
                autoFocus
                className={shared.input}
                value={modal.form.name}
                onChange={(e) => patchForm("name", e.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.label}>Đơn vị</span>
              <input
                className={shared.input}
                value={modal.form.unit}
                onChange={(e) => patchForm("unit", e.target.value)}
                placeholder="VD: kg, Lít, Quả..."
              />
            </label>
          </div>
        </ModalShell>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa nguyên vật liệu"
          message={`Bạn có chắc chắn xóa "${deleteTarget.name}"? Công thức chế biến đang dùng nguyên liệu này sẽ mất dòng tương ứng. Không thể hoàn tác.`}
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default IngredientsPanel;
