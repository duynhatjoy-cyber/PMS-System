import { useState } from "react";
import { UserPlus } from "lucide-react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import ConfirmDialog from "../../../components/ConfirmDialog";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import { INITIAL_STAFF, nextDraftId, STAFF_ROLES } from "../../../data/settingsData";
import styles from "../Settings.module.css";

function roleLabel(key) {
  return STAFF_ROLES.find((r) => r.key === key)?.label ?? key;
}

function emptyInviteForm() {
  return { name: "", email: "", roleKey: "staff" };
}

function StaffPanel({ onToast }) {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [inviteForm, setInviteForm] = useState(null); // { name, email, roleKey } | null
  const [roleModalTarget, setRoleModalTarget] = useState(null); // { id, name, roleKey }
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);

  function patchInvite(key, value) {
    setInviteForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleInvite() {
    const name = inviteForm.name.trim();
    const email = inviteForm.email.trim();
    if (!name || !email) return;
    setStaff((prev) => [...prev, { id: nextDraftId("staff"), name, email, roleKey: inviteForm.roleKey, active: true }]);
    onToast(`Đã mời ${name} tham gia`);
    setInviteForm(null);
  }

  function handleToggleActive(member) {
    if (member.active) {
      setDeactivateTarget(member);
      return;
    }
    setStaff((prev) => prev.map((m) => (m.id === member.id ? { ...m, active: true } : m)));
    onToast(`Đã kích hoạt lại tài khoản ${member.name}`);
  }

  function handleConfirmDeactivate() {
    setStaff((prev) => prev.map((m) => (m.id === deactivateTarget.id ? { ...m, active: false } : m)));
    onToast(`Đã tắt tài khoản ${deactivateTarget.name}`);
    setDeactivateTarget(null);
  }

  function handleConfirmRemove() {
    setStaff((prev) => prev.filter((m) => m.id !== removeTarget.id));
    onToast(`Đã gỡ tài khoản ${removeTarget.name}`);
    setRemoveTarget(null);
  }

  function handleSaveRole() {
    setStaff((prev) =>
      prev.map((m) => (m.id === roleModalTarget.id ? { ...m, roleKey: roleModalTarget.roleKey } : m))
    );
    onToast(`Đã đổi quyền cho ${roleModalTarget.name}`);
    setRoleModalTarget(null);
  }

  function memberMenuItems(member) {
    return [
      { key: "role", label: "Đổi quyền", onClick: () => setRoleModalTarget({ ...member }) },
      {
        key: "toggle",
        label: member.active ? "Tắt tài khoản" : "Kích hoạt lại",
        onClick: () => handleToggleActive(member),
      },
      { key: "remove", label: "Gỡ tài khoản", danger: true, divider: true, onClick: () => setRemoveTarget(member) },
    ];
  }

  const canInvite = inviteForm && inviteForm.name.trim() && inviteForm.email.trim();

  return (
    <div className={styles.panelStack} style={{ maxWidth: 1000 }}>
      <div className={styles.card}>
        <div className={styles.cardHeadRow}>
          <div>
            <div className={styles.cardTitle}>Nhân viên</div>
            <div className={styles.cardSubtitle}>Quản lý tài khoản nhân viên — mời, phân quyền, tắt tài khoản.</div>
          </div>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            onClick={() => setInviteForm(emptyInviteForm())}
          >
            <UserPlus size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
            Mời nhân viên
          </button>
        </div>

        <div className={styles.staffTable}>
          <div className={styles.staffHeaderRow}>
            <span>Tên</span>
            <span>Email</span>
            <span>Quyền</span>
            <span>Trạng thái</span>
            <span />
          </div>
          {staff.map((member) => (
            <div key={member.id} className={`${styles.staffRow} ${!member.active ? styles.staffRowInactive : ""}`}>
              <span className={styles.staffName}>{member.name}</span>
              <span className={styles.staffEmail}>{member.email}</span>
              <span>
                <span className={styles.roleBadge}>{roleLabel(member.roleKey)}</span>
              </span>
              <span>
                <span
                  className={`${styles.statusBadge} ${member.active ? styles.statusBadgeOn : styles.statusBadgeOff}`}
                >
                  {member.active ? "Hoạt động" : "Đã tắt"}
                </span>
              </span>
              <RowActionMenu items={memberMenuItems(member)} />
            </div>
          ))}
        </div>
      </div>

      {inviteForm && (
        <SlidePanelShell
          title="Mời nhân viên"
          onClose={() => setInviteForm(null)}
          width={440}
          footer={
            <>
              <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={() => setInviteForm(null)}>
                Huỷ
              </button>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnPrimary}`}
                disabled={!canInvite}
                onClick={handleInvite}
              >
                Tạo tài khoản
              </button>
            </>
          }
        >
          <div className={shared.stack}>
            <label className={shared.field}>
              <span className={shared.label}>Họ tên *</span>
              <input
                autoFocus
                className={shared.input}
                placeholder="Nguyễn Văn A"
                value={inviteForm.name}
                onChange={(e) => patchInvite("name", e.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.label}>Email *</span>
              <input
                type="email"
                className={shared.input}
                placeholder="nhanvien@khachsan.vn"
                value={inviteForm.email}
                onChange={(e) => patchInvite("email", e.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.label}>Quyền</span>
              <select
                className={shared.select}
                value={inviteForm.roleKey}
                onChange={(e) => patchInvite("roleKey", e.target.value)}
              >
                {STAFF_ROLES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </SlidePanelShell>
      )}

      {roleModalTarget && (
        <SlidePanelShell
          title={`Đổi quyền — ${roleModalTarget.name}`}
          onClose={() => setRoleModalTarget(null)}
          width={400}
          footer={
            <>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnSecondary}`}
                onClick={() => setRoleModalTarget(null)}
              >
                Huỷ
              </button>
              <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={handleSaveRole}>
                Lưu
              </button>
            </>
          }
        >
          <label className={shared.field}>
            <span className={shared.label}>Quyền</span>
            <select
              className={shared.select}
              value={roleModalTarget.roleKey}
              onChange={(e) => setRoleModalTarget((prev) => ({ ...prev, roleKey: e.target.value }))}
            >
              {STAFF_ROLES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </SlidePanelShell>
      )}

      {deactivateTarget && (
        <ConfirmDialog
          title="Tắt tài khoản"
          message={`Bạn có muốn tắt tài khoản của "${deactivateTarget.name}"? Người này sẽ không thể đăng nhập cho đến khi được kích hoạt lại.`}
          onConfirm={handleConfirmDeactivate}
          onClose={() => setDeactivateTarget(null)}
        />
      )}

      {removeTarget && (
        <ConfirmDialog
          title="Gỡ tài khoản"
          message={`Bạn có chắc chắn gỡ tài khoản "${removeTarget.name}"? Không thể hoàn tác.`}
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmRemove}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}

export default StaffPanel;
