import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, MoonIcon, ShipWheelIcon, SunIcon } from "lucide-react";
import useLogout from "../hooks/useLogout";
import { useThemeStore } from "../store/useThemeStore";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import SearchModal from "./SearchModal";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { toggleTheme, theme } = useThemeStore();
  const { logoutMutation } = useLogout();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <nav className="bg-base-100 sticky top-0 z-30 h-16 flex items-center border-b border-base-800 px-4 sm:px-6">
        <div className="w-full flex items-center justify-between">

          {/* LEFT — LOGO (mobile only, or always on chat page) */}
          <div className={cn("flex items-center", !isChatPage && "lg:hidden")}>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="p-1.5 bg-primary rounded-lg">
                <ShipWheelIcon className="size-4 text-primary-content" />
              </div>
              <span className="text-base font-bold tracking-tight text-base-content">
                Streamify
              </span>
            </Link>
          </div>

          {/* RIGHT — ACTIONS */}
          <div className="flex items-center gap-2 ml-auto">

            {/* SEARCH TRIGGER */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-base-200 border border-base-300 rounded-lg text-base-content/40 hover:text-base-content/70 hover:bg-base-300/50 transition-colors"
            >
              <span className="text-xs font-medium">Search...</span>
              <kbd className="kbd kbd-xs bg-base-100 border-base-300 font-sans text-[10px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-search">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                  <path d="M21 21l-6 -6" />
                </svg>
              </kbd>
            </button>

            {/* NOTIFICATIONS */}
            <Link to="/notifications">
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 text-base-content/50 hover:text-base-content transition-colors">
                <BellIcon className="size-4.5" />
              </button>
            </Link>

            {/* THEME TOGGLE */}
            <button
              className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 text-base-content/50 hover:text-base-content transition-colors"
              onClick={toggleTheme}
            >
              {theme === "streamify-pro" ? (
                <MoonIcon className="size-4.5" />
              ) : (
                <SunIcon className="size-4.5" />
              )}
            </button>

            {/* <div className="w-px h-5 bg-base-300 mx-1 hidden sm:block" /> */}

            {/* <Link to="/settings?tab=profile" className="size-8 rounded-lg overflow-hidden ring-1 ring-base-300">
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="User Avatar"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
              />
            </Link> */}
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;