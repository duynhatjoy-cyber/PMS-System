import SlidePanelShell from "./SlidePanelShell";
import shared from "./shared.module.css";
import { formatDateTimeDMY } from "../../../utils/format";

function UserActivityModal({ booking, onClose }) {
  return (
    <SlidePanelShell title="Thao tác người dùng" onClose={onClose} width={640}>
      <div className={shared.stack}>
        <div className={shared.row}>
          <label className={shared.field}>
            <span className={shared.label}>Tài khoản</span>
            <select className={shared.select}><option>Tất cả</option></select>
          </label>
          <label className={shared.field}>
            <span className={shared.label}>Thao tác</span>
            <select className={shared.select}><option>Tất cả</option></select>
          </label>
        </div>
        <div style={{ background: "var(--fd-surface-hover)", padding: 10, fontWeight: 700 }}>
          {formatDateTimeDMY(booking.checkIn)}
        </div>
        <div className={shared.bodyText}>
          Thực hiện đặt phòng #{booking.bookingCode}, phòng {booking.room}, khách {booking.guest.name}.
        </div>
      </div>
    </SlidePanelShell>
  );
}

export default UserActivityModal;
