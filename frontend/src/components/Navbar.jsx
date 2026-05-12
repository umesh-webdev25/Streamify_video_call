import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, MoonIcon, ShipWheelIcon, SunIcon } from "lucide-react";
import useLogout from "../hooks/useLogout";
import { useThemeStore } from "../store/useThemeStore";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { toggleTheme, theme } = useThemeStore();

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-30 h-16 flex items-center transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE OR MOBILE */}
          {isChatPage ? (
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <ShipWheelIcon className="size-6 text-primary" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 tracking-tight">
                  Streamify
                </span>
              </Link>
            </div>
          ) : (
            <div className="lg:hidden">
               <Link to="/" className="flex items-center gap-2 group">
                <ShipWheelIcon className="size-7 text-primary" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 tracking-tight">
                  Streamify
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle btn-sm hover:bg-base-content/5">
                <BellIcon className="h-5 w-5 text-base-content/70" />
              </button>
            </Link>

            <div className="h-6 w-[1px] bg-base-300 mx-1" />

            {/* THEME TOGGLE */}
            <button
              className="btn btn-ghost btn-circle btn-sm hover:bg-base-content/5 transition-all duration-300"
              onClick={toggleTheme}
              title={`Switch to ${theme === "streamify-pro" ? "dark" : "light"} mode`}
            >
              {theme === "streamify-pro" ? (
                <MoonIcon className="size-5 text-base-content/70" />
              ) : (
                <SunIcon className="size-5 text-yellow-500" />
              )}
            </button>

            <div className="avatar">
              <div className="w-9 rounded-lg ring-1 ring-base-300">
                <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
              </div>
            </div>

            <button
              className="btn btn-ghost btn-circle btn-sm text-error/70 hover:bg-error/10 hover:text-error"
              onClick={logoutMutation}
            >
              <LogOutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
