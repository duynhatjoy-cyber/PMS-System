import { Bell } from "lucide-react";

function Header() {
  return (
    <header className="header">
      <div className="header-hotel-name">Nha Cua My Admin</div>

      <div className="header-actions">
        <div className="notification">
          <Bell size={20} strokeWidth={1.8} />
          <span className="notification-badge">20</span>
        </div>

        <div className="avatar">NC</div>
      </div>
    </header>
  );
}

export default Header;