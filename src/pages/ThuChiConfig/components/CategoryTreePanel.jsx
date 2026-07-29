import { useState } from "react";
import { CirclePause, CirclePlay, Plus, X } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import { EXPENSE_GROUPS, INCOME_GROUPS } from "../../../data/thuChiConfigData";

const SCOPES = [
  { key: "income", label: "Mục thu" },
  { key: "expense", label: "Mục chi" },
];

let draftSeq = 0;
function nextDraftId(prefix) {
  draftSeq += 1;
  return `${prefix}-draft-${draftSeq}`;
}

function CategoryTreePanel({ styles, onToast }) {
  const [groupsByScope, setGroupsByScope] = useState({ income: INCOME_GROUPS, expense: EXPENSE_GROUPS });
  const [scope, setScope] = useState("income");
  const [groupId, setGroupId] = useState(INCOME_GROUPS[0]?.id ?? null);
  const [categoryId, setCategoryId] = useState(INCOME_GROUPS[0]?.categories[0]?.id ?? null);
  const [addModal, setAddModal] = useState(null); // { kind: "group" | "category", value }
  const [deleteTarget, setDeleteTarget] = useState(null); // { kind, id, name }

  const groups = groupsByScope[scope];
  const group = groups.find((g) => g.id === groupId) || null;
  const categories = group?.categories || [];
  const category = categories.find((c) => c.id === categoryId) || null;

  function updateGroups(updater) {
    setGroupsByScope((prev) => ({ ...prev, [scope]: updater(prev[scope]) }));
  }

  function handleScopeChange(key) {
    setScope(key);
    const firstGroup = groupsByScope[key][0] || null;
    setGroupId(firstGroup?.id ?? null);
    setCategoryId(firstGroup?.categories[0]?.id ?? null);
  }

  function handleSelectGroup(id) {
    setGroupId(id);
    const g = groups.find((x) => x.id === id);
    setCategoryId(g?.categories[0]?.id ?? null);
  }

  function handleToggleGroupActive(g) {
    updateGroups((list) => list.map((x) => (x.id === g.id ? { ...x, active: !x.active } : x)));
    onToast(g.active ? `Đã ngừng sử dụng nhóm "${g.name}"` : `Đã sử dụng lại nhóm "${g.name}"`);
  }

  function handleToggleCategoryActive() {
    updateGroups((list) =>
      list.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              categories: g.categories.map((c) =>
                c.id === category.id ? { ...c, active: !c.active } : c
              ),
            }
      )
    );
    onToast(
      category.active
        ? `Đã ngừng sử dụng danh mục "${category.name}"`
        : `Đã sử dụng lại danh mục "${category.name}"`
    );
  }

  function handleAddGroup(name) {
    const newGroup = { id: nextDraftId("grp"), name, active: true, categories: [] };
    updateGroups((list) => [...list, newGroup]);
    setGroupId(newGroup.id);
    setCategoryId(null);
    setAddModal(null);
  }

  function handleAddCategory(name) {
    const newCategory = { id: nextDraftId("cat"), groupId, name, code: "", note: "", active: true };
    updateGroups((list) =>
      list.map((g) => (g.id === groupId ? { ...g, categories: [...g.categories, newCategory] } : g))
    );
    setCategoryId(newCategory.id);
    setAddModal(null);
  }

  function patchCategory(key, value) {
    updateGroups((list) =>
      list.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, categories: g.categories.map((c) => (c.id === categoryId ? { ...c, [key]: value } : c)) }
      )
    );
  }

  function handleSaveCategory() {
    if (!category.name.trim() || !category.code.trim()) {
      onToast("Vui lòng nhập tên và mã danh mục trước khi lưu");
      return;
    }
    onToast(`Đã lưu danh mục "${category.name}"`);
  }

  function handleConfirmDelete() {
    if (deleteTarget.kind === "group") {
      updateGroups((list) => list.filter((g) => g.id !== deleteTarget.id));
      if (groupId === deleteTarget.id) {
        setGroupId(null);
        setCategoryId(null);
      }
    } else {
      updateGroups((list) =>
        list.map((g) =>
          g.id !== groupId ? g : { ...g, categories: g.categories.filter((c) => c.id !== deleteTarget.id) }
        )
      );
      if (categoryId === deleteTarget.id) setCategoryId(null);
    }
    onToast(`Đã xoá ${deleteTarget.kind === "group" ? "nhóm" : "danh mục"} "${deleteTarget.name}"`);
    setDeleteTarget(null);
  }

  function groupMenuItems(g) {
    return [
      {
        key: "toggle",
        label: g.active ? "Ngừng sử dụng" : "Sử dụng lại",
        onClick: () => handleToggleGroupActive(g),
      },
      {
        key: "delete",
        label: "Xóa nhóm",
        danger: true,
        divider: true,
        onClick: () => setDeleteTarget({ kind: "group", id: g.id, name: g.name }),
      },
    ];
  }

  return (
    <div className={styles.main}>
      <div className={styles.categoryLayout}>
        <div className={styles.scopeCol}>
          {SCOPES.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`${styles.scopeItem} ${s.key === scope ? styles.scopeItemActive : ""}`}
              onClick={() => handleScopeChange(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className={styles.listCard}>
          <div className={styles.listCardHead}>Nhóm</div>
          <div className={styles.scrollList}>
            {groups.map((g) => (
              <div
                key={g.id}
                className={`${styles.groupRow} ${g.id === groupId ? styles.groupRowActive : ""}`}
              >
                <button type="button" className={styles.groupRowLabel} onClick={() => handleSelectGroup(g.id)}>
                  <span className={!g.active ? styles.rowInactive : ""}>{g.name}</span>
                  {!g.active && <span className={styles.inactiveTag}>Ngừng dùng</span>}
                </button>
                <RowActionMenu items={groupMenuItems(g)} />
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.addRowBtn}
            onClick={() => setAddModal({ kind: "group", value: "" })}
          >
            <Plus size={14} /> Thêm nhóm
          </button>
        </div>

        <div className={styles.listCard}>
          <div className={styles.listCardHead}>Danh mục</div>
          <div className={styles.scrollList}>
            {!group ? (
              <EmptyState message="Chọn một nhóm ở bên trái" />
            ) : categories.length === 0 ? (
              <EmptyState
                message="Chưa có danh mục nào"
                hint='Nhấn "+ Thêm danh mục" để tạo danh mục đầu tiên.'
              />
            ) : (
              categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.categoryRow} ${c.id === categoryId ? styles.categoryRowActive : ""}`}
                  onClick={() => setCategoryId(c.id)}
                >
                  <span className={!c.active ? styles.rowInactive : ""}>{c.name}</span>
                  {!c.active && <span className={styles.inactiveTag}>Ngừng dùng</span>}
                </button>
              ))
            )}
          </div>
          {group && (
            <button
              type="button"
              className={styles.addRowBtn}
              onClick={() => setAddModal({ kind: "category", value: "" })}
            >
              <Plus size={14} /> Thêm danh mục
            </button>
          )}
        </div>

        <div className={styles.detailCard}>
          {!category ? (
            <EmptyState message="Chọn một danh mục ở bên trái để xem chi tiết" />
          ) : (
            <>
              <div className={styles.detailHeadRow}>
                <div className={styles.detailTitle}>Chi tiết danh mục</div>
                <div className={styles.detailHeadActions}>
                  <button
                    type="button"
                    className={styles.iconGhostBtn}
                    title={category.active ? "Ngừng sử dụng" : "Sử dụng lại"}
                    onClick={handleToggleCategoryActive}
                  >
                    {category.active ? <CirclePause size={17} /> : <CirclePlay size={17} />}
                  </button>
                  <button
                    type="button"
                    className={styles.iconDangerBtn}
                    title="Xoá danh mục"
                    onClick={() => setDeleteTarget({ kind: "category", id: category.id, name: category.name })}
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Tên danh mục *</span>
                <input
                  className={styles.fieldInput}
                  value={category.name}
                  onChange={(e) => patchCategory("name", e.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Code *</span>
                <input
                  className={styles.fieldInput}
                  value={category.code}
                  onChange={(e) => patchCategory("code", e.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Ghi chú</span>
                <textarea
                  className={styles.fieldTextarea}
                  rows={3}
                  value={category.note}
                  onChange={(e) => patchCategory("note", e.target.value)}
                />
              </label>

              <div className={styles.actionsRow}>
                <button type="button" className={styles.saveBtn} onClick={handleSaveCategory}>
                  Lưu
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {addModal && (
        <ModalShell
          title={addModal.kind === "group" ? "Thêm nhóm" : "Thêm danh mục"}
          onClose={() => setAddModal(null)}
          width={420}
          footer={
            <>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnSecondary}`}
                onClick={() => setAddModal(null)}
              >
                Bỏ qua
              </button>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnPrimary}`}
                disabled={!addModal.value.trim()}
                onClick={() =>
                  addModal.kind === "group"
                    ? handleAddGroup(addModal.value.trim())
                    : handleAddCategory(addModal.value.trim())
                }
              >
                Lưu
              </button>
            </>
          }
        >
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{addModal.kind === "group" ? "Tên nhóm" : "Tên danh mục"}</span>
            <input
              autoFocus
              className={styles.fieldInput}
              value={addModal.value}
              onChange={(e) => setAddModal((prev) => ({ ...prev, value: e.target.value }))}
            />
          </label>
        </ModalShell>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={deleteTarget.kind === "group" ? "Xoá nhóm" : "Xoá danh mục"}
          message={`Bạn có chắc chắn xoá ${deleteTarget.kind === "group" ? "nhóm" : "danh mục"} "${deleteTarget.name}"? Không thể hoàn tác.`}
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default CategoryTreePanel;
