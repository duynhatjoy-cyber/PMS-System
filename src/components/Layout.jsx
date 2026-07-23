import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-layout">
        <Header />

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;