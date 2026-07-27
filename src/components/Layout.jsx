import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children, onNavigate }) {
  return (
    <div className="app-layout">
      <Sidebar onNavigate={onNavigate} />

      <div className="main-layout">
        <Header />

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;