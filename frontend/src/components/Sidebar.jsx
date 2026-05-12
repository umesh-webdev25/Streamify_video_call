import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon } from "lucide-react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-68 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300">
      <div className="p-6 border-b border-base-300">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <ShipWheelIcon className="size-8 text-primary" />
          </div>
          <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 tracking-tight">
            Streamify
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-4 py-3 rounded-xl normal-case font-medium transition-all duration-200 ${
            currentPath === "/" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-base-content/70 hover:bg-base-content/5"
          }`}
        >
          <HomeIcon className={`size-5 ${currentPath === "/" ? "text-primary" : "text-base-content/60"}`} />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-4 py-3 rounded-xl normal-case font-medium transition-all duration-200 ${
            currentPath === "/friends" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-base-content/70 hover:bg-base-content/5"
          }`}
        >
          <UsersIcon className={`size-5 ${currentPath === "/friends" ? "text-primary" : "text-base-content/60"}`} />
          <span>Friends</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-4 py-3 rounded-xl normal-case font-medium transition-all duration-200 ${
            currentPath === "/notifications" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-base-content/70 hover:bg-base-content/5"
          }`}
        >
          <BellIcon className={`size-5 ${currentPath === "/notifications" ? "text-primary" : "text-base-content/60"}`} />
          <span>Notifications</span>
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-6 border-t border-base-300 mt-auto bg-base-100/50">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-11 rounded-xl ring-2 ring-primary/10 ring-offset-base-100 ring-offset-2">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-sm truncate">{authUser?.fullName}</p>
            <p className="text-[11px] font-semibold text-success flex items-center gap-1.5 uppercase tracking-wider">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              Active Now
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
