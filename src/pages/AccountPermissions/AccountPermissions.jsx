import { useState } from "react";
import { ChevronRight, Minus, PauseCircle, Plus, UserRound, X } from "lucide-react";
import styles from "./AccountPermissions.module.css";

const INITIAL_USERS = [
  { id: "owner", name: "Chủ khách sạn", email: "owner@bellhop.vn", role: "Chủ khách sạn", owner: true, expiresAt: "" },
  { id: "manager", name: "Thiều Hoài Thương", email: "thieuhoaithuong123@gmail.com", role: "Quản lý", expiresAt: "2027-07-30" },
  { id: "reception", name: "Lễ Tân", email: "letan@bellhop.vn", role: "Lễ tân", expiresAt: "2027-01-30" },
];

const ROLES = ["Quản lý", "Lễ tân", "Buồng phòng", "Kế toán"];

function AccountPermissions() {
  const [activeTab, setActiveTab] = useState("accounts");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [selectedId, setSelectedId] = useState("owner");
  const [showInvite, setShowInvite] = useState(false);
  const selected = users.find((user) => user.id === selectedId);

  function patchSelected(patch) {
    if (selected?.owner) return;
    setUsers((items) => items.map((user) => user.id === selectedId ? { ...user, ...patch } : user));
  }

  return (
    <main className={styles.page}>
      <div className={styles.tabs}>
        <button className={activeTab === "accounts" ? styles.tabActive : ""} onClick={() => setActiveTab("accounts")}>Tài khoản</button>
        <button className={activeTab === "permissions" ? styles.tabActive : ""} onClick={() => setActiveTab("permissions")}>Phân quyền</button>
      </div>

      {activeTab === "accounts" ? (
        <div className={styles.workspace}>
          <aside className={styles.userList}>
            <div className={styles.listHead}>
              <strong>Tài khoản</strong>
              <button onClick={() => setShowInvite(true)}><Plus size={15} /> Mời thêm user</button>
            </div>
            {users.map((user) => (
              <button key={user.id} className={`${styles.userItem} ${selectedId === user.id ? styles.userActive : ""}`} onClick={() => setSelectedId(user.id)}>
                <span className={styles.avatar}><UserRound size={18} /></span>
                <span><strong>{user.name}</strong><small>{user.email}</small><em>{user.role}</em></span>
              </button>
            ))}
          </aside>

          <section className={styles.detail}>
            <header>
              <div><h2>{selected.name}</h2><p>{selected.email}</p></div>
              {!selected.owner && <button className={styles.updateBtn}>Cập nhật</button>}
            </header>
            {selected.owner && <div className={styles.ownerNotice}>Đây là tài khoản chủ khách sạn. Thông tin và quyền không thể chỉnh sửa.</div>}
            <div className={styles.form}>
              <label><span>Họ và tên</span><input value={selected.name} disabled={selected.owner} onChange={(e) => patchSelected({ name: e.target.value })} /></label>
              <label><span>Email</span><input value={selected.email} disabled /></label>
              <label><span>Ngày hết hạn</span><input type="date" value={selected.expiresAt} disabled={selected.owner} onChange={(e) => patchSelected({ expiresAt: e.target.value })} /></label>
              <label><span>Nhóm quyền</span><select value={selected.role} disabled={selected.owner} onChange={(e) => patchSelected({ role: e.target.value })}>{selected.owner && <option>Chủ khách sạn</option>}{ROLES.map((role) => <option key={role}>{role}</option>)}</select></label>
            </div>
            {!selected.owner && <button className={styles.pauseBtn}><PauseCircle size={16} /> Tạm dừng tài khoản</button>}
          </section>
        </div>
      ) : (
        <PermissionPanel />
      )}

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSend={(data) => {
        const id = `user-${Date.now()}`;
        setUsers((items) => [...items, { id, name: data.email.split("@")[0], email: data.email, role: data.role, expiresAt: "" }]);
        setSelectedId(id);
        setShowInvite(false);
      }} />}
    </main>
  );
}

const PERMISSION_MODULES = [
  { id: "general", label: "Thông tin chung", pages: ["Trang tổng quan", "Thông tin khách sạn"], actions: ["Xem thông tin", "Cập nhật thông tin chung"] },
  { id: "booking", label: "Quản lý đặt phòng", pages: ["Sơ đồ phòng", "Danh sách booking", "Quản lý khách", "Quản lý công nợ"], actions: ["Xem chi tiết đặt phòng", "Tạo đặt phòng", "Nhận phòng", "Trả phòng", "Đổi ngày ở", "Chuyển phòng", "Undo check-in", "Undo checkout", "Sửa giá", "Hủy đặt phòng"] },
  { id: "finance", label: "Thu chi", pages: ["Quỹ tiền mặt", "Quỹ tiền gửi", "Danh sách thu chi"], actions: ["Tạo phiếu thu", "Tạo phiếu chi", "Sửa phiếu", "Xóa phiếu", "In phiếu"] },
  { id: "sales", label: "Quản lý bán hàng", pages: ["Tạo hóa đơn", "Danh sách hóa đơn"], actions: ["Tạo hóa đơn", "Sửa hóa đơn", "Hủy hóa đơn", "In hóa đơn"] },
  { id: "housekeeping", label: "Buồng phòng", pages: ["Sơ đồ trạng thái phòng", "Việc cần làm"], actions: ["Làm sạch phòng", "Chuyển phòng bẩn", "Thiết lập sửa phòng", "Xóa sửa phòng"] },
  { id: "email", label: "Email marketing", pages: ["Chiến dịch email", "Lịch sử email", "Cấu hình email"], actions: ["Tạo chiến dịch", "Gửi email", "Tạm dừng chiến dịch", "Sửa cấu hình"] },
  { id: "warehouse", label: "Quản lý kho", pages: ["Tổng quan kho", "Nhập kho", "Xuất kho", "Chuyển kho", "Kiểm kho"], actions: ["Tạo phiếu kho", "Duyệt phiếu", "Sửa phiếu", "In phiếu"] },
  { id: "statistics", label: "Thống kê", pages: ["Tổng quan", "Biểu đồ", "Dự báo phòng"], actions: ["Xem thống kê", "Xuất dữ liệu"] },
  { id: "reports", label: "Báo cáo", pages: ["Báo cáo doanh thu", "Báo cáo công suất", "Báo cáo tài chính"], actions: ["Xem báo cáo", "Xuất Excel", "In báo cáo"] },
  { id: "settings", label: "Cấu hình", pages: ["Phòng & Giá", "Quản lý đặt phòng", "Dịch vụ", "Tài khoản & phân quyền"], actions: ["Thêm cấu hình", "Sửa cấu hình", "Xóa cấu hình"] },
];
const PERMISSION_ROLES = ["Quản lý", "Lễ tân", "Buồng phòng", "Kế toán"];

function PermissionPanel() {
  const allPermissionKeys = PERMISSION_MODULES.flatMap((module) => [...module.pages, ...module.actions].map((item) => `${module.id}:${item}`));
  const [selectedRole, setSelectedRole] = useState("Quản lý");
  const [selectedModuleId, setSelectedModuleId] = useState("booking");
  const [grantsByRole, setGrantsByRole] = useState(() => ({
    "Quản lý": new Set(allPermissionKeys),
    "Lễ tân": new Set(allPermissionKeys.filter((key) => ["general", "booking", "sales", "housekeeping"].some((module) => key.startsWith(`${module}:`)))),
    "Buồng phòng": new Set(allPermissionKeys.filter((key) => key.startsWith("housekeeping:"))),
    "Kế toán": new Set(allPermissionKeys.filter((key) => ["finance", "reports", "statistics"].some((module) => key.startsWith(`${module}:`)))),
  }));
  const [saved, setSaved] = useState(false);
  const selectedModule = PERMISSION_MODULES.find((module) => module.id === selectedModuleId);
  const granted = grantsByRole[selectedRole] || new Set();

  function updateRoleGrants(updater) {
    setGrantsByRole((current) => ({
      ...current,
      [selectedRole]: updater(current[selectedRole] || new Set()),
    }));
  }

  function moduleKeys(module) {
    return [...module.pages, ...module.actions].map((item) => `${module.id}:${item}`);
  }

  function toggleModule(module) {
    const keys = moduleKeys(module);
    const allGranted = keys.every((key) => granted.has(key));
    updateRoleGrants((current) => {
      const next = new Set(current);
      keys.forEach((key) => allGranted ? next.delete(key) : next.add(key));
      return next;
    });
    setSaved(false);
  }

  function togglePermission(key) {
    updateRoleGrants((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setSaved(false);
  }

  return <section className={styles.permissionPanel}>
    <header className={styles.permissionHead}>
      <div><strong>Cho phép {selectedRole} được truy cập:</strong><p>Các cập nhật được áp dụng sau khi người dùng đăng nhập lại.</p></div>
      <button onClick={() => setSaved(true)}>{saved ? "Đã lưu" : "Lưu"}</button>
    </header>
    <div className={styles.permissionBody}>
      <aside className={styles.roleList}>
        <div className={styles.permissionColumnTitle}>Nhóm quyền</div>
        {PERMISSION_ROLES.map((role) => (
          <button
            key={role}
            className={selectedRole === role ? styles.roleActive : ""}
            onClick={() => {
              setSelectedRole(role);
              setSaved(false);
            }}
          >
            {role}
            <ChevronRight size={15} />
          </button>
        ))}
      </aside>
      <aside className={styles.moduleList}>
        <div className={styles.permissionColumnTitle}>Chức năng hệ thống</div>
        {PERMISSION_MODULES.map((module) => {
          const keys = moduleKeys(module);
          const checkedCount = keys.filter((key) => granted.has(key)).length;
          const allChecked = checkedCount === keys.length;
          const partial = checkedCount > 0 && !allChecked;
          return <div key={module.id} className={`${styles.moduleRow} ${selectedModuleId === module.id ? styles.moduleActive : ""}`}>
            <button className={styles.permissionCheck} onClick={() => toggleModule(module)} aria-label={`Chọn toàn bộ ${module.label}`}>
              {partial ? <Minus size={13} /> : <input type="checkbox" checked={allChecked} readOnly />}
            </button>
            <button className={styles.moduleName} onClick={() => setSelectedModuleId(module.id)}>{module.label}<ChevronRight size={15} /></button>
          </div>;
        })}
      </aside>
      <div className={styles.permissionDetail}>
        <PermissionGroup title="Quyền truy cập các trang" items={selectedModule.pages} moduleId={selectedModule.id} granted={granted} onToggle={togglePermission} />
        <PermissionGroup title="Các thao tác với" subtitle={selectedModule.label} items={selectedModule.actions} moduleId={selectedModule.id} granted={granted} onToggle={togglePermission} />
      </div>
    </div>
  </section>;
}

function PermissionGroup({ title, subtitle, items, moduleId, granted, onToggle }) {
  return <section className={styles.permissionGroup}>
    <h3>{title}{subtitle && <span>{subtitle}</span>}</h3>
    {items.map((item) => {
      const key = `${moduleId}:${item}`;
      return <label key={item}><input type="checkbox" checked={granted.has(key)} onChange={() => onToggle(key)} /><span>{item}</span></label>;
    })}
  </section>;
}

function InviteModal({ onClose, onSend }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Lễ tân");
  const [message, setMessage] = useState("");
  return <div className={styles.overlay} onMouseDown={onClose}><section className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
    <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
    <h2>Mời người truy cập dữ liệu vào Bellhop Hotel</h2>
    <div className={styles.inviteRow}><input autoFocus type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><select value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map((item) => <option key={item}>{item}</option>)}</select></div>
    <textarea placeholder="Tin nhắn" value={message} onChange={(e) => setMessage(e.target.value)} />
    <div className={styles.modalActions}><button onClick={onClose}>Bỏ qua</button><button disabled={!email.includes("@")} onClick={() => onSend({ email, role, message })}>Gửi</button></div>
  </section></div>;
}

export default AccountPermissions;
