import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {showSidebar && <Sidebar />}

      <div className="flex-1 flex flex-col relative">
        <Navbar />

        <main className={`flex-1 overflow-y-auto ${showSidebar ? "pb-20 lg:pb-0" : ""}`}>
          {children}
        </main>

        {showSidebar && <MobileNav />}
      </div>
    </div>
  );
};
export default Layout;

