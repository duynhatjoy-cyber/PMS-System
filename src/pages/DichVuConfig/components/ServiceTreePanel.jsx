import { useState } from "react";
import { Plus } from "lucide-react";
import ConfirmDialog from "../../../components/ConfirmDialog";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import ServiceFormModal from "./ServiceFormModal";
import { formatCurrency } from "../../../utils/format";
import { INITIAL_GROUPS_BY_TYPE, SERVICE_TYPES, nextDraftId } from "../../../data/serviceConfigData";
import styles from "../DichVuConfig.module.css";

function typeLabel(key) {
  return SERVICE_TYPES.find((t) => t.key === key)?.label ?? key;
}

function ServiceTreePanel({ onToast }) {
  const [groupsByType, setGroupsByType] = useState(INITIAL_GROUPS_BY_TYPE);
  const [typeKey, setTypeKey] = useState(SERVICE_TYPES[0].key);
  const [groupId, setGroupId] = useState(INITIAL_GROUPS_BY_TYPE[SERVICE_TYPES[0].key][0]?.id ?? null);

  const [addGroupModal, setAddGroupModal] = useState(null); // { value }
  const [addServiceModal, setAddServiceModal] = useState(false);
  const [moveGroupTarget, setMoveGroupTarget] = useState(null); // { group, destTypeKey }
  const [moveServiceTarget, setMoveServiceTarget] = useState(null); // { service, fromGroupId, destGroupId }
  const [deleteGroupTarget, setDeleteGroupTarget] = useState(null);
  const [deactivateGroupTarget, setDeactivateGroupTarget] = useState(null);
  const [deleteServiceTarget, setDeleteServiceTarget] = useState(null);
  const [deactivateServiceTarget, setDeactivateServiceTarget] = useState(null);

  const groups = groupsByType[typeKey] || [];
  const group = groups.find((g) => g.id === groupId) || null;
  const services = group?.services || [];

  function handleSelectType(key) {
    setTypeKey(key);
    setGroupId(groupsByType[key][0]?.id ?? null);
  }

  // ---- Nhóm dịch vụ ----

  function handleAddGroup(name) {
    const newGroup = { id: nextDraftId("grp"), typeKey, name, active: true, services: [] };
    setGroupsByType((prev) => ({ ...prev, [typeKey]: [...prev[typeKey], newGroup] }));
    setGroupId(newGroup.id);
    setAddGroupModal(null);
    onToast(`Đã thêm nhóm dịch vụ "${name}"`);
  }

  function handleToggleGroupActive(g) {
    if (g.active) {
      setDeactivateGroupTarget(g);
      return;
    }
    setGroupsByType((prev) => ({
      ...prev,
      [g.typeKey]: prev[g.typeKey].map((x) => (x.id === g.id ? { ...x, active: true } : x)),
    }));
    onToast(`Đã sử dụng lại nhóm "${g.name}"`);
  }

  function handleConfirmDeactivateGroup() {
    const g = deactivateGroupTarget;
    setGroupsByType((prev) => ({
      ...prev,
      [g.typeKey]: prev[g.typeKey].map((x) => (x.id === g.id ? { ...x, active: false } : x)),
    }));
    onToast(`Đã ngừng sử dụng nhóm "${g.name}"`);
    setDeactivateGroupTarget(null);
  }

  function handleConfirmDeleteGroup() {
    const g = deleteGroupTarget;
    setGroupsByType((prev) => ({ ...prev, [g.typeKey]: prev[g.typeKey].filter((x) => x.id !== g.id) }));
    if (groupId === g.id) setGroupId(null);
    onToast(`Đã xóa nhóm "${g.name}"`);
    setDeleteGroupTarget(null);
  }

  function handleConfirmMoveGroup() {
    const { group: g, destTypeKey } = moveGroupTarget;
    setGroupsByType((prev) => {
      const next = { ...prev };
      next[g.typeKey] = next[g.typeKey].filter((x) => x.id !== g.id);
      next[destTypeKey] = [...next[destTypeKey], { ...g, typeKey: destTypeKey }];
      return next;
    });
    if (groupId === g.id) setGroupId(null);
    onToast(`Đã chuyển nhóm "${g.name}" sang "${typeLabel(destTypeKey)}"`);
    setMoveGroupTarget(null);
  }

  function groupMenuItems(g) {
    return [
      { key: "move", label: "Chuyển nhóm", onClick: () => setMoveGroupTarget({ group: g, destTypeKey: null }) },
      {
        key: "toggle",
        label: g.active ? "Ngừng sử dụng nhóm dịch vụ" : "Sử dụng lại nhóm dịch vụ",
        onClick: () => handleToggleGroupActive(g),
      },
      { key: "delete", label: "Xóa nhóm", danger: true, divider: true, onClick: () => setDeleteGroupTarget(g) },
    ];
  }

  // ---- Dịch vụ ----

  function handleAddService(fields) {
    const newService = { id: nextDraftId("svc"), active: true, ...fields };
    setGroupsByType((prev) => ({
      ...prev,
      [typeKey]: prev[typeKey].map((g) =>
        g.id === groupId ? { ...g, services: [...g.services, newService] } : g
      ),
    }));
    setAddServiceModal(false);
    onToast(`Đã thêm dịch vụ "${newService.name}"`);
  }

  function handleToggleServiceActive(svc) {
    if (svc.active) {
      setDeactivateServiceTarget(svc);
      return;
    }
    setGroupsByType((prev) => ({
      ...prev,
      [typeKey]: prev[typeKey].map((g) =>
        g.id !== groupId
          ? g
          : { ...g, services: g.services.map((s) => (s.id === svc.id ? { ...s, active: true } : s)) }
      ),
    }));
    onToast(`Đã sử dụng lại dịch vụ "${svc.name}"`);
  }

  function handleConfirmDeactivateService() {
    const svc = deactivateServiceTarget;
    setGroupsByType((prev) => ({
      ...prev,
      [typeKey]: prev[typeKey].map((g) =>
        g.id !== groupId
          ? g
          : { ...g, services: g.services.map((s) => (s.id === svc.id ? { ...s, active: false } : s)) }
      ),
    }));
    onToast(`Đã ngừng sử dụng dịch vụ "${svc.name}"`);
    setDeactivateServiceTarget(null);
  }

  function handleConfirmDeleteService() {
    const svc = deleteServiceTarget;
    setGroupsByType((prev) => ({
      ...prev,
      [typeKey]: prev[typeKey].map((g) =>
        g.id !== groupId ? g : { ...g, services: g.services.filter((s) => s.id !== svc.id) }
      ),
    }));
    onToast(`Đã xóa dịch vụ "${svc.name}"`);
    setDeleteServiceTarget(null);
  }

  function handleConfirmMoveService() {
    const { service: svc, fromGroupId, destGroupId } = moveServiceTarget;
    setGroupsByType((prev) => {
      const next = {};
      for (const key of Object.keys(prev)) {
        next[key] = prev[key].map((g) => {
          if (g.id === fromGroupId) return { ...g, services: g.services.filter((s) => s.id !== svc.id) };
          if (g.id === destGroupId) return { ...g, services: [...g.services, svc] };
          return g;
        });
      }
      return next;
    });
    onToast(`Đã chuyển dịch vụ "${svc.name}" sang nhóm khác`);
    setMoveServiceTarget(null);
  }

  function serviceMenuItems(svc) {
    return [
      {
        key: "move",
        label: "Chuyển nhóm",
        onClick: () => setMoveServiceTarget({ service: svc, fromGroupId: groupId, destGroupId: null }),
      },
      {
        key: "toggle",
        label: svc.active ? "Ngừng sử dụng" : "Sử dụng lại",
        onClick: () => handleToggleServiceActive(svc),
      },
      { key: "delete", label: "Xóa dịch vụ", danger: true, divider: true, onClick: () => setDeleteServiceTarget(svc) },
    ];
  }

  // Popup "Chuyển nhóm dịch vụ" — chọn loại dịch vụ khác để chuyển nhóm đến
  const moveGroupOptions = SERVICE_TYPES.filter((t) => t.key !== moveGroupTarget?.group.typeKey);

  // Popup "Chuyển nhóm" của 1 dịch vụ — chọn nhóm khác (mọi loại dịch vụ) để chuyển đến
  const moveServiceOptions = SERVICE_TYPES.flatMap((t) =>
    groupsByType[t.key]
      .filter((g) => g.id !== moveServiceTarget?.fromGroupId)
      .map((g) => ({ key: g.id, label: `${t.label} › ${g.name}` }))
  );

  return (
    <div className={styles.layout}>
      <div className={styles.typeCol}>
        <div className={styles.colHeadBar}>Dịch vụ mở rộng</div>
        {SERVICE_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.typeItem} ${t.key === typeKey ? styles.typeItemActive : ""}`}
            onClick={() => handleSelectType(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.groupsCol}>
        <div className={styles.colHead}>Nhóm dịch vụ</div>
        {groups.map((g) => (
          <div
            key={g.id}
            className={`${styles.itemCard} ${g.id === groupId ? styles.itemCardActive : ""} ${
              !g.active ? styles.itemInactive : ""
            }`}
          >
            <button type="button" className={styles.itemCardBtn} onClick={() => setGroupId(g.id)}>
              <span className={styles.itemName}>
                {g.name}
                {!g.active && <span className={styles.inactiveTag}>Ngừng dùng</span>}
              </span>
              <span className={styles.itemMeta}>{g.services.length} dịch vụ</span>
            </button>
            <RowActionMenu items={groupMenuItems(g)} />
          </div>
        ))}

        <button type="button" className={styles.addLinkBtn} onClick={() => setAddGroupModal({ value: "" })}>
          <Plus size={14} /> Thêm nhóm
        </button>
      </div>

      <div className={styles.servicesCol}>
        <div className={styles.colHead}>Dịch vụ</div>
        {services.map((svc) => (
          <div key={svc.id} className={`${styles.itemCard} ${!svc.active ? styles.itemInactive : ""}`}>
            <div className={styles.itemCardBtn} style={{ cursor: "default" }}>
              <span className={styles.itemName}>
                {svc.name}
                {!svc.active && <span className={styles.inactiveTag}>Ngừng dùng</span>}
              </span>
              <span className={styles.itemMeta}>
                {formatCurrency(svc.price)}
                {svc.unit ? ` / ${svc.unit}` : ""}
                {svc.code ? ` · ${svc.code}` : ""}
              </span>
            </div>
            <RowActionMenu items={serviceMenuItems(svc)} />
          </div>
        ))}

        {group && (
          <button type="button" className={styles.addLinkBtn} onClick={() => setAddServiceModal(true)}>
            <Plus size={14} /> Thêm dịch vụ
          </button>
        )}
      </div>

      {addGroupModal && (
        <ModalShell
          title="Thêm nhóm dịch vụ"
          onClose={() => setAddGroupModal(null)}
          width={420}
          footer={
            <>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnSecondary}`}
                onClick={() => setAddGroupModal(null)}
              >
                Bỏ qua
              </button>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnPrimary}`}
                disabled={!addGroupModal.value.trim()}
                onClick={() => handleAddGroup(addGroupModal.value.trim())}
              >
                Lưu
              </button>
            </>
          }
        >
          <label className={shared.field}>
            <span className={shared.label}>Tên nhóm</span>
            <input
              autoFocus
              className={shared.input}
              placeholder="Nhập tên nhóm"
              value={addGroupModal.value}
              onChange={(e) => setAddGroupModal((prev) => ({ ...prev, value: e.target.value }))}
            />
          </label>
        </ModalShell>
      )}

      {addServiceModal && <ServiceFormModal onClose={() => setAddServiceModal(false)} onSave={handleAddService} />}

      {moveGroupTarget && (
        <ModalShell
          title="Chuyển nhóm dịch vụ"
          onClose={() => setMoveGroupTarget(null)}
          width={420}
          footer={
            <>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnSecondary}`}
                onClick={() => setMoveGroupTarget(null)}
              >
                Bỏ qua
              </button>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnPrimary}`}
                disabled={!moveGroupTarget.destTypeKey}
                onClick={handleConfirmMoveGroup}
              >
                Lưu
              </button>
            </>
          }
        >
          <p className={styles.formHint} style={{ margin: "0 0 12px" }}>
            Chuyển nhóm "{moveGroupTarget.group.name}" đến loại dịch vụ:
          </p>
          <div className={styles.moveList}>
            {moveGroupOptions.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`${styles.moveOption} ${
                  moveGroupTarget.destTypeKey === t.key ? styles.moveOptionActive : ""
                }`}
                onClick={() => setMoveGroupTarget((prev) => ({ ...prev, destTypeKey: t.key }))}
              >
                {t.label}
              </button>
            ))}
          </div>
        </ModalShell>
      )}

      {moveServiceTarget && (
        <ModalShell
          title="Chuyển nhóm"
          onClose={() => setMoveServiceTarget(null)}
          width={420}
          footer={
            <>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnSecondary}`}
                onClick={() => setMoveServiceTarget(null)}
              >
                Bỏ qua
              </button>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnPrimary}`}
                disabled={!moveServiceTarget.destGroupId}
                onClick={handleConfirmMoveService}
              >
                Lưu
              </button>
            </>
          }
        >
          <p className={styles.formHint} style={{ margin: "0 0 12px" }}>
            Chuyển dịch vụ "{moveServiceTarget.service.name}" đến nhóm:
          </p>
          <div className={styles.moveList}>
            {moveServiceOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`${styles.moveOption} ${
                  moveServiceTarget.destGroupId === opt.key ? styles.moveOptionActive : ""
                }`}
                onClick={() => setMoveServiceTarget((prev) => ({ ...prev, destGroupId: opt.key }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </ModalShell>
      )}

      {deleteGroupTarget && (
        <ConfirmDialog
          title="Xóa nhóm dịch vụ"
          message={`Bạn có chắc chắn xóa nhóm "${deleteGroupTarget.name}"? Không thể hoàn tác.`}
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDeleteGroup}
          onClose={() => setDeleteGroupTarget(null)}
        />
      )}

      {deactivateGroupTarget && (
        <ConfirmDialog
          title="Ngừng sử dụng nhóm dịch vụ"
          message={`Bạn có muốn ngừng sử dụng nhóm "${deactivateGroupTarget.name}"`}
          onConfirm={handleConfirmDeactivateGroup}
          onClose={() => setDeactivateGroupTarget(null)}
        />
      )}

      {deleteServiceTarget && (
        <ConfirmDialog
          title="Xóa dịch vụ"
          message={`Bạn có chắc chắn xóa dịch vụ "${deleteServiceTarget.name}"? Không thể hoàn tác.`}
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDeleteService}
          onClose={() => setDeleteServiceTarget(null)}
        />
      )}

      {deactivateServiceTarget && (
        <ConfirmDialog
          title="Ngừng sử dụng dịch vụ"
          message={`Bạn có muốn ngừng sử dụng dịch vụ "${deactivateServiceTarget.name}"`}
          onConfirm={handleConfirmDeactivateService}
          onClose={() => setDeactivateServiceTarget(null)}
        />
      )}
    </div>
  );
}

export default ServiceTreePanel;
