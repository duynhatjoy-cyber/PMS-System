import { useState } from "react";
import { CirclePause, CirclePlay, Plus, Search, X } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import { useWarehouseConfig } from "../../../context/WarehouseConfigContext";
import { createIdSequence } from "../../../utils/id";

const NEW_ID = "__new_warehouse__";

const nextId = createIdSequence();

function emptyDraft() {
  return {
    name: "",
    address: "",
    description: "",
    allowFrontDesk: false,
    allowSales: false,
    active: true,
    hasRelatedData: false,
  };
}

function WarehousesPanel({ styles, onToast }) {
  const { warehouses, setWarehouses } = useWarehouseConfig();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(warehouses[1]?.id ?? null);
  const [draft, setDraft] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [cannotDeleteTarget, setCannotDeleteTarget] = useState(null);

  const isNew = selectedId === NEW_ID;
  const selected = isNew ? draft : warehouses.find((w) => w.id === selectedId) || null;

  const filteredWarehouses = warehouses.filter((w) =>
    w.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  function selectWarehouse(id) {
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
      setWarehouses((prev) => prev.map((w) => (w.id === selectedId ? { ...w, [key]: value } : w)));
    }
  }

  function handleSave() {
    if (!selected.name.trim()) {
      onToast("Vui lòng nhập tên kho trước khi lưu");
      return;
    }
    if (isNew) {
      const newWarehouse = { ...draft, id: nextId("kho-draft") };
      setWarehouses((prev) => [...prev, newWarehouse]);
      setDraft(null);
      setSelectedId(newWarehouse.id);
      onToast(`Đã thêm kho "${newWarehouse.name}"`);
    } else {
      onToast(`Đã lưu kho "${selected.name}"`);
    }
  }

  function handleDeleteClick(w) {
    if (w.hasRelatedData) {
      setCannotDeleteTarget(w);
    } else {
      setDeleteTarget(w);
    }
  }

  function handleConfirmDelete() {
    setWarehouses((prev) => prev.filter((w) => w.id !== deleteTarget.id));
    if (selectedId === deleteTarget.id) setSelectedId(null);
    onToast(`Đã xóa kho "${deleteTarget.name}"`);
    setDeleteTarget(null);
  }

  function handleToggleActiveClick(w) {
    if (w.active) {
      setDeactivateTarget(w);
    } else {
      setWarehouses((prev) => prev.map((x) => (x.id === w.id ? { ...x, active: true } : x)));
      onToast(`Đã sử dụng lại kho "${w.name}"`);
    }
  }

  function handleConfirmDeactivate() {
    setWarehouses((prev) =>
      prev.map((w) => (w.id === deactivateTarget.id ? { ...w, active: false } : w))
    );
    onToast(`Đã ngừng sử dụng kho "${deactivateTarget.name}"`);
    setDeactivateTarget(null);
  }

  function rowMenuItems(w) {
    return [
      {
        key: "toggle",
        label: w.active ? "Ngừng sử dụng" : "Sử dụng lại",
        onClick: () => handleToggleActiveClick(w),
      },
      {
        key: "delete",
        label: "Xóa kho",
        danger: true,
        divider: true,
        onClick: () => handleDeleteClick(w),
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
              placeholder="Lọc kho"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.scrollList}>
            {filteredWarehouses.length === 0 ? (
              <EmptyState message="Không tìm thấy kho" />
            ) : (
              filteredWarehouses.map((w) => (
                <div
                  key={w.id}
                  className={`${styles.groupRow} ${w.id === selectedId ? styles.groupRowActive : ""}`}
                >
                  <button
                    type="button"
                    className={styles.groupRowLabel}
                    onClick={() => selectWarehouse(w.id)}
                  >
                    <span className={!w.active ? styles.rowInactive : ""}>{w.name}</span>
                  </button>
                  <RowActionMenu items={rowMenuItems(w)} />
                </div>
              ))
            )}
          </div>

          <button type="button" className={styles.addRowBtn} onClick={handleStartCreate}>
            <Plus size={14} /> Thêm kho
          </button>
        </div>

        <div className={styles.detailCard}>
          {!selected ? (
            <EmptyState message="Chọn một kho ở bên trái để xem chi tiết" />
          ) : (
            <>
              <div className={styles.detailHeadRow}>
                <div className={styles.detailTitle}>Chi tiết kho</div>
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
                      title="Xóa kho"
                      onClick={() => handleDeleteClick(selected)}
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.detailBody}>
                <div className={styles.detailCol}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Tên kho *</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.name}
                      onChange={(e) => patchField("name", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Địa chỉ</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.address}
                      onChange={(e) => patchField("address", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Mô tả</span>
                    <textarea
                      className={styles.fieldTextarea}
                      rows={3}
                      value={selected.description}
                      onChange={(e) => patchField("description", e.target.value)}
                    />
                  </label>
                </div>

                <div className={styles.detailAside}>
                  <span className={styles.asideLabel}>Cho phép trừ số lượng từ</span>
                  <label className={shared.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={selected.allowFrontDesk}
                      onChange={(e) => patchField("allowFrontDesk", e.target.checked)}
                    />
                    Lễ tân
                  </label>
                  <label className={shared.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={selected.allowSales}
                      onChange={(e) => patchField("allowSales", e.target.checked)}
                    />
                    Quản lý bán hàng
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
          title="Xóa kho"
          message="Bạn có chắc chắn xóa kho này"
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {deactivateTarget && (
        <ConfirmDialog
          title="Ngừng sử dụng kho"
          message="Bạn có muốn ngừng sử dụng kho này"
          confirmLabel="Đồng ý"
          onConfirm={handleConfirmDeactivate}
          onClose={() => setDeactivateTarget(null)}
        />
      )}

      {cannotDeleteTarget && (
        <ModalShell
          title="Không thể xóa kho"
          onClose={() => setCannotDeleteTarget(null)}
          width={420}
          footer={
            <button
              type="button"
              className={`${shared.btn} ${shared.btnPrimary}`}
              onClick={() => setCannotDeleteTarget(null)}
            >
              Đồng ý
            </button>
          }
        >
          <p className={shared.bodyText}>Không thể xóa kho vì tồn tại dữ liệu liên quan</p>
        </ModalShell>
      )}
    </div>
  );
}

export default WarehousesPanel;
