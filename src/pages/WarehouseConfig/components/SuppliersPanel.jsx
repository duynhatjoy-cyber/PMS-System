import { useState } from "react";
import { CirclePause, CirclePlay, Plus, Search, X } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import ImageUploadField from "../../../components/ImageUploadField";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import shared from "../../FrontDesk/modals/shared.module.css";
import { useWarehouseConfig } from "../../../context/WarehouseConfigContext";
import { createIdSequence } from "../../../utils/id";

const NEW_ID = "__new_supplier__";

const nextId = createIdSequence();

function emptyDraft() {
  return {
    code: "",
    name: "",
    description: "",
    phone: "",
    mobile: "",
    email: "",
    fax: "",
    representative: "",
    vatCode: "",
    contactPhone: "",
    contactEmail: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
    qrCodeImage: "",
    active: true,
  };
}

function SuppliersPanel({ styles, onToast }) {
  const { suppliers, setSuppliers, materials, setMaterials } = useWarehouseConfig();
  const [query, setQuery] = useState("");
  const [materialQuery, setMaterialQuery] = useState("");
  const [selectedId, setSelectedId] = useState(suppliers[0]?.id ?? null);
  const [draft, setDraft] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const isNew = selectedId === NEW_ID;
  const selected = isNew ? draft : suppliers.find((s) => s.id === selectedId) || null;

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  function selectSupplier(id) {
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
      setSuppliers((prev) => prev.map((s) => (s.id === selectedId ? { ...s, [key]: value } : s)));
    }
  }

  function handleSave() {
    if (!selected.code.trim() || !selected.name.trim()) {
      onToast("Vui lòng nhập mã và tên nhà cung cấp trước khi lưu");
      return;
    }
    if (isNew) {
      const newSupplier = { ...draft, id: nextId("ncc-draft") };
      setSuppliers((prev) => [...prev, newSupplier]);
      setDraft(null);
      setSelectedId(newSupplier.id);
      onToast(`Đã thêm nhà cung cấp "${newSupplier.name}"`);
    } else {
      onToast(`Đã lưu nhà cung cấp "${selected.name}"`);
    }
  }

  function handleConfirmDelete() {
    setSuppliers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    if (selectedId === deleteTarget.id) setSelectedId(null);
    onToast(`Đã xóa nhà cung cấp "${deleteTarget.name}"`);
    setDeleteTarget(null);
  }

  function handleToggleActiveClick(s) {
    if (s.active) {
      setDeactivateTarget(s);
    } else {
      setSuppliers((prev) => prev.map((x) => (x.id === s.id ? { ...x, active: true } : x)));
      onToast(`Đã sử dụng lại nhà cung cấp "${s.name}"`);
    }
  }

  function handleConfirmDeactivate() {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === deactivateTarget.id ? { ...s, active: false } : s))
    );
    onToast(`Đã ngừng sử dụng nhà cung cấp "${deactivateTarget.name}"`);
    setDeactivateTarget(null);
  }

  function toggleMaterialSupplier(materialId, checked) {
    setMaterials((prev) =>
      prev.map((m) => (m.id === materialId ? { ...m, supplierId: checked ? selectedId : "" } : m))
    );
  }

  function rowMenuItems(s) {
    return [
      {
        key: "toggle",
        label: s.active ? "Ngừng sử dụng" : "Sử dụng lại",
        onClick: () => handleToggleActiveClick(s),
      },
      {
        key: "delete",
        label: "Xóa nhà cung cấp",
        danger: true,
        divider: true,
        onClick: () => setDeleteTarget(s),
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
              placeholder="Lọc nhà cung cấp"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.scrollList}>
            {filteredSuppliers.length === 0 ? (
              <EmptyState message="Không tìm thấy nhà cung cấp" />
            ) : (
              filteredSuppliers.map((s) => (
                <div
                  key={s.id}
                  className={`${styles.groupRow} ${s.id === selectedId ? styles.groupRowActive : ""}`}
                >
                  <button
                    type="button"
                    className={styles.groupRowLabel}
                    onClick={() => selectSupplier(s.id)}
                  >
                    <span className={!s.active ? styles.rowInactive : ""}>{s.name}</span>
                  </button>
                  <RowActionMenu items={rowMenuItems(s)} />
                </div>
              ))
            )}
          </div>

          <button type="button" className={styles.addRowBtn} onClick={handleStartCreate}>
            <Plus size={14} /> Thêm nhà cung cấp
          </button>
        </div>

        <div className={styles.detailCard}>
          {!selected ? (
            <EmptyState message="Chọn một nhà cung cấp ở bên trái để xem chi tiết" />
          ) : (
            <>
              <div className={styles.detailHeadRow}>
                <div className={styles.detailTitle}>Chi tiết nhà cung cấp</div>
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
                      title="Xóa nhà cung cấp"
                      onClick={() => setDeleteTarget(selected)}
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.detailBody}>
                <div className={styles.detailCol}>
                  <div className={styles.detailColLabel}>Thông tin nhà cung cấp</div>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Mã nhà cung cấp *</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.code}
                      disabled={!isNew}
                      onChange={(e) => patchField("code", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Tên nhà cung cấp *</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.name}
                      onChange={(e) => patchField("name", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Mô tả</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.description}
                      onChange={(e) => patchField("description", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Số điện thoại</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.phone}
                      onChange={(e) => patchField("phone", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Số di động</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.mobile}
                      onChange={(e) => patchField("mobile", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Email</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.email}
                      onChange={(e) => patchField("email", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Số Fax</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.fax}
                      onChange={(e) => patchField("fax", e.target.value)}
                    />
                  </label>
                </div>

                <div className={styles.detailCol}>
                  <div className={styles.detailColLabel}>Thông tin liên hệ</div>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Người đại diện</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.representative}
                      onChange={(e) => patchField("representative", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Mã VAT Nhà Cung Cấp</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.vatCode}
                      onChange={(e) => patchField("vatCode", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Số điện thoại</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.contactPhone}
                      onChange={(e) => patchField("contactPhone", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Email</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.contactEmail}
                      onChange={(e) => patchField("contactEmail", e.target.value)}
                    />
                  </label>
                </div>

                <div className={styles.detailCol}>
                  <div className={styles.detailColLabel}>Ngân hàng &amp; thanh toán</div>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Tên ngân hàng</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.bankName}
                      onChange={(e) => patchField("bankName", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Số tài khoản</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.bankAccountNumber}
                      onChange={(e) => patchField("bankAccountNumber", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Chủ tài khoản</span>
                    <input
                      className={styles.fieldInput}
                      value={selected.bankAccountHolder}
                      onChange={(e) => patchField("bankAccountHolder", e.target.value)}
                    />
                  </label>

                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Mã QR chuyển khoản</span>
                    <ImageUploadField
                      value={selected.qrCodeImage}
                      onChange={(value) => patchField("qrCodeImage", value)}
                      label="Chọn ảnh mã QR"
                    />
                  </div>

                  {!isNew && (
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>
                        Nguyên vật liệu cung cấp ({materials.filter((m) => m.supplierId === selected.id).length})
                      </span>
                      <div className={styles.listSearch}>
                        <Search size={14} />
                        <input
                          placeholder="Lọc nguyên vật liệu"
                          value={materialQuery}
                          onChange={(e) => setMaterialQuery(e.target.value)}
                        />
                      </div>
                      <div className={styles.scrollList} style={{ maxHeight: 220 }}>
                        {materials
                          .filter((m) => m.name.toLowerCase().includes(materialQuery.trim().toLowerCase()))
                          .map((m) => (
                            <label key={m.id} className={shared.checkboxRow} style={{ padding: "8px 12px" }}>
                              <input
                                type="checkbox"
                                checked={m.supplierId === selected.id}
                                onChange={(e) => toggleMaterialSupplier(m.id, e.target.checked)}
                              />
                              <span className={!m.active ? styles.rowInactive : ""}>{m.name}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
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
          title="Xóa nhà cung cấp"
          message="Bạn có chắc chắn xóa nhà cung cấp này"
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {deactivateTarget && (
        <ConfirmDialog
          title="Ngừng sử dụng nhà cung cấp"
          message="Bạn có muốn ngừng sử dụng nhà cung cấp này"
          confirmLabel="Đồng ý"
          onConfirm={handleConfirmDeactivate}
          onClose={() => setDeactivateTarget(null)}
        />
      )}
    </div>
  );
}

export default SuppliersPanel;
