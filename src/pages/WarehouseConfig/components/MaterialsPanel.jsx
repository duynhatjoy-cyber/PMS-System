import { useState } from "react";
import { CirclePause, CirclePlay, Plus, Search, X } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import { useWarehouseConfig } from "../../../context/WarehouseConfigContext";
import { createIdSequence } from "../../../utils/id";

const NEW_ID = "__new_material__";

const UNIT_SUGGESTIONS = ["Cái", "Chai", "Kg", "Thùng", "Gói", "Lít"];

const nextId = createIdSequence();

function emptyDraft() {
  return { name: "", unit: "", supplierId: "", active: true };
}

function MaterialsPanel({ styles, onToast }) {
  const { materials, setMaterials, suppliers } = useWarehouseConfig();
  const activeSuppliers = suppliers.filter((s) => s.active);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(materials[0]?.id ?? null);
  const [draft, setDraft] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const isNew = selectedId === NEW_ID;
  const selected = isNew ? draft : materials.find((m) => m.id === selectedId) || null;

  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  function selectMaterial(id) {
    setDraft(null);
    setSelectedId(id);
  }

  function handleStartCreate() {
    setDraft(emptyDraft());
    setSelectedId(NEW_ID);
  }

  function patchField(key, value) {
    if (isNew) {
      setDraft((prev) => ({ ...prev, [key]: value }));
    } else {
      setMaterials((prev) => prev.map((m) => (m.id === selectedId ? { ...m, [key]: value } : m)));
    }
  }

  function handleSave() {
    if (!selected.name.trim() || !selected.unit.trim()) {
      onToast("Vui lòng nhập tên và đơn vị tính trước khi lưu");
      return;
    }
    if (isNew) {
      const newMaterial = { ...draft, id: nextId("nvl-draft") };
      setMaterials((prev) => [...prev, newMaterial]);
      setDraft(null);
      setSelectedId(newMaterial.id);
      onToast(`Đã thêm nguyên vật liệu "${newMaterial.name}"`);
    } else {
      onToast(`Đã lưu nguyên vật liệu "${selected.name}"`);
    }
  }

  function handleConfirmDelete() {
    setMaterials((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    if (selectedId === deleteTarget.id) setSelectedId(null);
    onToast(`Đã xóa nguyên vật liệu "${deleteTarget.name}"`);
    setDeleteTarget(null);
  }

  function handleToggleActiveClick(m) {
    if (m.active) {
      setDeactivateTarget(m);
    } else {
      setMaterials((prev) => prev.map((x) => (x.id === m.id ? { ...x, active: true } : x)));
      onToast(`Đã sử dụng lại nguyên vật liệu "${m.name}"`);
    }
  }

  function handleConfirmDeactivate() {
    setMaterials((prev) =>
      prev.map((m) => (m.id === deactivateTarget.id ? { ...m, active: false } : m))
    );
    onToast(`Đã ngừng sử dụng nguyên vật liệu "${deactivateTarget.name}"`);
    setDeactivateTarget(null);
  }

  function rowMenuItems(m) {
    return [
      {
        key: "toggle",
        label: m.active ? "Ngừng sử dụng" : "Sử dụng lại",
        onClick: () => handleToggleActiveClick(m),
      },
      {
        key: "delete",
        label: "Xóa nguyên vật liệu",
        danger: true,
        divider: true,
        onClick: () => setDeleteTarget(m),
      },
    ];
  }

  return (
    <div className={styles.main}>
      <div className={styles.categoryLayout}>
        <div className={styles.listCard}>
          <div className={styles.listSearch}>
            <Search size={14} />
            <input
              placeholder="Lọc nguyên vật liệu"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.scrollList}>
            {filteredMaterials.length === 0 ? (
              <EmptyState message="Không tìm thấy nguyên vật liệu" />
            ) : (
              filteredMaterials.map((m) => (
                <div
                  key={m.id}
                  className={`${styles.groupRow} ${m.id === selectedId ? styles.groupRowActive : ""}`}
                >
                  <button
                    type="button"
                    className={styles.groupRowLabel}
                    onClick={() => selectMaterial(m.id)}
                  >
                    <span className={!m.active ? styles.rowInactive : ""}>{m.name}</span>
                  </button>
                  <RowActionMenu items={rowMenuItems(m)} />
                </div>
              ))
            )}
          </div>

          <button type="button" className={styles.addRowBtn} onClick={handleStartCreate}>
            <Plus size={14} /> Thêm nguyên vật liệu
          </button>
        </div>

        <div className={styles.detailCard}>
          {!selected ? (
            <EmptyState message="Chọn một nguyên vật liệu ở bên trái để xem chi tiết" />
          ) : (
            <>
              <div className={styles.detailHeadRow}>
                <div className={styles.detailTitle}>Chi tiết nguyên vật liệu</div>
                {!isNew && (
                  <div className={styles.detailHeadActions}>
                    <button
                      type="button"
                      className={styles.iconGhostBtn}
                      title={selected.active ? "Ngừng sử dụng" : "Sử dụng lại"}
                      onClick={() => handleToggleActiveClick(selected)}
                    >
                      {selected.active ? <CirclePause size={17} /> : <CirclePlay size={17} />}
                    </button>
                    <button
                      type="button"
                      className={styles.iconDangerBtn}
                      title="Xóa nguyên vật liệu"
                      onClick={() => setDeleteTarget(selected)}
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.detailBody}>
                <div className={styles.detailCol}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Tên nguyên vật liệu *</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.name}
                      onChange={(e) => patchField("name", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Đơn vị tính (ĐVT) *</span>
                    <input
                      className={styles.fieldInput}
                      list="material-unit-suggestions"
                      value={selected.unit}
                      onChange={(e) => patchField("unit", e.target.value)}
                      placeholder="Vd: cái, chai, kg, thùng, gói, lít"
                    />
                  </label>
                  <datalist id="material-unit-suggestions">
                    {UNIT_SUGGESTIONS.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Nhà cung cấp</span>
                    <select
                      className={styles.fieldInput}
                      value={selected.supplierId || ""}
                      onChange={(e) => patchField("supplierId", e.target.value)}
                    >
                      <option value="">Chưa gán nhà cung cấp</option>
                      {activeSuppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className={styles.actionsRow}>
                <button type="button" className={styles.saveBtn} onClick={handleSave}>
                  Lưu
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa nguyên vật liệu"
          message="Bạn có chắc chắn xóa nguyên vật liệu này"
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {deactivateTarget && (
        <ConfirmDialog
          title="Ngừng sử dụng nguyên vật liệu"
          message="Bạn có muốn ngừng sử dụng nguyên vật liệu này"
          confirmLabel="Đồng ý"
          onConfirm={handleConfirmDeactivate}
          onClose={() => setDeactivateTarget(null)}
        />
      )}
    </div>
  );
}

export default MaterialsPanel;
