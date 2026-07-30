import { useState } from "react";
import { CircleUserRound, Save } from "lucide-react";
import Toast from "../FrontDesk/components/Toast";
import shared from "../FrontDesk/modals/shared.module.css";
import { formatDMY } from "../../utils/format";
import styles from "./UserProfile.module.css";

const GENDERS = ["Nam", "Nữ", "Khác"];

// Cùng tài khoản "Quản lý" đã có ở tab Nhân viên (Cài đặt) — người đang đăng
// nhập chính là chủ tài khoản quản lý đó, không phải một danh tính mới.
const INITIAL_PROFILE = {
  name: "Nguyễn Văn An",
  email: "quanly@lifrooms.com",
  roleLabel: "Quản lý",
  phone: "0901234567",
  gender: "",
  dob: "",
  createdAt: new Date(2026, 6, 9),
  active: true,
};

function UserProfile() {
  const [form, setForm] = useState(INITIAL_PROFILE);
  const [toastMsg, setToastMsg] = useState("");

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setToastMsg("Đã lưu hồ sơ cá nhân");
  }

  return (
    <div className={styles.page}>
      <div className={styles.headRow}>
        <span className={styles.headIcon}>
          <CircleUserRound size={20} />
        </span>
        <div>
          <h1 className={styles.title}>Hồ sơ cá nhân</h1>
          <p className={styles.subtitle}>Xem và chỉnh sửa thông tin tài khoản của bạn</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Thông tin cơ bản</div>

        <label className={shared.field}>
          <span className={shared.label}>Họ tên</span>
          <input className={shared.input} value={form.name} onChange={(e) => patch("name", e.target.value)} />
        </label>

        <label className={shared.field}>
          <span className={shared.label}>Email</span>
          <input className={`${shared.input} ${styles.readOnlyInput}`} value={form.email} readOnly />
          <span className={shared.hint}>Email không thể thay đổi tại đây.</span>
        </label>

        <label className={shared.field}>
          <span className={shared.label}>Quyền</span>
          <input className={`${shared.input} ${styles.readOnlyInput}`} value={form.roleLabel} readOnly />
          <span className={shared.hint}>Quyền do quản lý thiết lập.</span>
        </label>

        <div className={shared.row}>
          <label className={shared.field}>
            <span className={shared.label}>Số điện thoại</span>
            <input className={shared.input} value={form.phone} onChange={(e) => patch("phone", e.target.value)} />
          </label>
          <label className={shared.field}>
            <span className={shared.label}>Giới tính</span>
            <select className={shared.select} value={form.gender} onChange={(e) => patch("gender", e.target.value)}>
              <option value="">-- Chọn --</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={shared.field}>
          <span className={shared.label}>Ngày sinh</span>
          <input type="date" className={shared.input} value={form.dob} onChange={(e) => patch("dob", e.target.value)} />
        </label>

        <div className={shared.row}>
          <div className={shared.field}>
            <span className={shared.label}>Ngày tạo tài khoản</span>
            <div className={styles.readOnlyText}>{formatDMY(form.createdAt)}</div>
          </div>
          <div className={shared.field}>
            <span className={shared.label}>Trạng thái</span>
            <span
              className={`${styles.statusBadge} ${form.active ? styles.statusBadgeOn : styles.statusBadgeOff}`}
            >
              {form.active ? "Hoạt động" : "Đã tắt"}
            </span>
          </div>
        </div>

        <div>
          <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={handleSave}>
            <Save size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
            Lưu thay đổi
          </button>
        </div>
      </div>

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default UserProfile;
