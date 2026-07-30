import { useState } from "react";
import { Plus } from "lucide-react";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import ConfirmDialog from "../../../components/ConfirmDialog";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import EmptyState from "../../../components/EmptyState";
import { formatCurrency } from "../../../utils/format";
import { nextDraftId } from "../../../data/fnbData";
import styles from "../FnB.module.css";

function emptyItemForm(item) {
  return {
    name: item?.name ?? "",
    price: item ? String(item.price) : "",
  };
}

function MenuPanel({ categories, setCategories, onToast }) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [itemModal, setItemModal] = useState(null); // { editing: item|null, form }
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);
  const [renameCategoryTarget, setRenameCategoryTarget] = useState(null); // { id, value }

  const category = categories.find((c) => c.id === categoryId) || categories[0] || null;

  function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const newCategory = { id: nextDraftId("cat"), name, items: [] };
    setCategories((prev) => [...prev, newCategory]);
    setCategoryId(newCategory.id);
    setNewCategoryName("");
    onToast(`Đã thêm danh mục "${name}"`);
  }

  function handleRenameCategory() {
    const name = renameCategoryTarget.value.trim();
    if (!name) return;
    setCategories((prev) => prev.map((c) => (c.id === renameCategoryTarget.id ? { ...c, name } : c)));
    onToast(`Đã đổi tên danh mục thành "${name}"`);
    setRenameCategoryTarget(null);
  }

  function handleConfirmDeleteCategory() {
    setCategories((prev) => prev.filter((c) => c.id !== deleteCategoryTarget.id));
    if (categoryId === deleteCategoryTarget.id) setCategoryId(null);
    onToast(`Đã xóa danh mục "${deleteCategoryTarget.name}"`);
    setDeleteCategoryTarget(null);
  }

  function categoryMenuItems(cat) {
    return [
      {
        key: "rename",
        label: "Đổi tên",
        onClick: () => setRenameCategoryTarget({ id: cat.id, value: cat.name }),
      },
      {
        key: "delete",
        label: "Xóa danh mục",
        danger: true,
        divider: true,
        onClick: () => setDeleteCategoryTarget(cat),
      },
    ];
  }

  function openAddItemModal() {
    setItemModal({ editing: null, form: emptyItemForm(null) });
  }

  function openEditItemModal(item) {
    setItemModal({ editing: item, form: emptyItemForm(item) });
  }

  function patchItemForm(key, value) {
    setItemModal((prev) => ({ ...prev, form: { ...prev.form, [key]: value } }));
  }

  function handleSaveItem() {
    const { editing, form } = itemModal;
    const name = form.name.trim();
    const price = Number(form.price);
    if (!name || !(price > 0)) return;

    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== categoryId) return c;
        if (editing) {
          return { ...c, items: c.items.map((i) => (i.id === editing.id ? { ...i, name, price } : i)) };
        }
        return { ...c, items: [...c.items, { id: nextDraftId("mi"), name, price, available: true }] };
      })
    );
    onToast(editing ? `Đã cập nhật món "${name}"` : `Đã thêm món "${name}"`);
    setItemModal(null);
  }

  function handleToggleAvailable(item) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId
          ? c
          : { ...c, items: c.items.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i)) }
      )
    );
    onToast(item.available ? `Đã đánh dấu "${item.name}" hết hàng` : `"${item.name}" đã có hàng trở lại`);
  }

  function handleConfirmDeleteItem() {
    setCategories((prev) =>
      prev.map((c) => (c.id !== categoryId ? c : { ...c, items: c.items.filter((i) => i.id !== deleteItemTarget.id) }))
    );
    onToast(`Đã xóa món "${deleteItemTarget.name}"`);
    setDeleteItemTarget(null);
  }

  function itemMenuItems(item) {
    return [
      { key: "edit", label: "Sửa món", onClick: () => openEditItemModal(item) },
      {
        key: "toggle",
        label: item.available ? "Đánh dấu hết hàng" : "Còn hàng trở lại",
        onClick: () => handleToggleAvailable(item),
      },
      { key: "delete", label: "Xóa món", danger: true, divider: true, onClick: () => setDeleteItemTarget(item) },
    ];
  }

  const canSaveItem = itemModal && itemModal.form.name.trim() && Number(itemModal.form.price) > 0;

  return (
    <div className={styles.menuLayout}>
      <div className={styles.categoryCol}>
        <div className={styles.categoryColHead}>Danh mục</div>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`${styles.categoryRow} ${cat.id === category?.id ? styles.categoryRowActive : ""}`}
          >
            <button type="button" className={styles.categoryRowLabel} onClick={() => setCategoryId(cat.id)}>
              {cat.name} <span className={styles.categoryRowCount}>({cat.items.length})</span>
            </button>
            <RowActionMenu items={categoryMenuItems(cat)} />
          </div>
        ))}
        <div className={styles.addCategoryRow}>
          <input
            className={styles.addCategoryInput}
            placeholder="Thêm danh mục mới (VD: Khai vị)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          />
          <button
            type="button"
            className={styles.addCategoryBtn}
            disabled={!newCategoryName.trim()}
            onClick={handleAddCategory}
          >
            <Plus size={14} /> Thêm
          </button>
        </div>
      </div>

      <div className={styles.itemsCol}>
        {category ? (
          <>
            <div className={styles.itemsColHead}>
              <span className={styles.itemsColTitle}>{category.name}</span>
              <button type="button" className={styles.addBtn} onClick={openAddItemModal}>
                <Plus size={16} /> Thêm món
              </button>
            </div>

            {category.items.length === 0 ? (
              <EmptyState message="Danh mục này chưa có món nào." hint='Nhấn "Thêm món" để tạo món đầu tiên.' />
            ) : (
              <div className={styles.itemGrid}>
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.menuItemCard} ${!item.available ? styles.menuItemCardInactive : ""}`}
                  >
                    <div>
                      <div className={styles.menuItemName}>{item.name}</div>
                      <div className={styles.menuItemPrice}>{formatCurrency(item.price)}</div>
                      {!item.available && <span className={styles.inactiveTag}>Hết hàng</span>}
                    </div>
                    <RowActionMenu items={itemMenuItems(item)} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState message="Chưa có danh mục thực đơn nào." hint="Thêm danh mục đầu tiên ở cột bên trái." />
        )}
      </div>

      {itemModal && (
        <ModalShell
          title={itemModal.editing ? "Sửa món" : "Thêm món"}
          onClose={() => setItemModal(null)}
          width={420}
          footer={
            <>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnSecondary}`}
                onClick={() => setItemModal(null)}
              >
                Huỷ
              </button>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnPrimary}`}
                disabled={!canSaveItem}
                onClick={handleSaveItem}
              >
                Lưu
              </button>
            </>
          }
        >
          <div className={shared.stack}>
            <label className={shared.field}>
              <span className={shared.label}>Tên món *</span>
              <input
                autoFocus
                className={shared.input}
                value={itemModal.form.name}
                onChange={(e) => patchItemForm("name", e.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.label}>Giá bán *</span>
              <input
                type="number"
                min="0"
                className={shared.input}
                value={itemModal.form.price}
                onChange={(e) => patchItemForm("price", e.target.value)}
              />
            </label>
          </div>
        </ModalShell>
      )}

      {renameCategoryTarget && (
        <ModalShell
          title="Đổi tên danh mục"
          onClose={() => setRenameCategoryTarget(null)}
          width={400}
          footer={
            <>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnSecondary}`}
                onClick={() => setRenameCategoryTarget(null)}
              >
                Huỷ
              </button>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnPrimary}`}
                disabled={!renameCategoryTarget.value.trim()}
                onClick={handleRenameCategory}
              >
                Lưu
              </button>
            </>
          }
        >
          <label className={shared.field}>
            <span className={shared.label}>Tên danh mục</span>
            <input
              autoFocus
              className={shared.input}
              value={renameCategoryTarget.value}
              onChange={(e) => setRenameCategoryTarget((prev) => ({ ...prev, value: e.target.value }))}
            />
          </label>
        </ModalShell>
      )}

      {deleteCategoryTarget && (
        <ConfirmDialog
          title="Xóa danh mục"
          message={`Bạn có chắc chắn xóa danh mục "${deleteCategoryTarget.name}" và ${deleteCategoryTarget.items.length} món bên trong? Không thể hoàn tác.`}
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDeleteCategory}
          onClose={() => setDeleteCategoryTarget(null)}
        />
      )}

      {deleteItemTarget && (
        <ConfirmDialog
          title="Xóa món"
          message={`Bạn có chắc chắn xóa món "${deleteItemTarget.name}"? Không thể hoàn tác.`}
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDeleteItem}
          onClose={() => setDeleteItemTarget(null)}
        />
      )}
    </div>
  );
}

export default MenuPanel;
