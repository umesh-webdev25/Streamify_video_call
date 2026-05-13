import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, LogOutIcon, SettingsIcon, ShipWheelIcon, UsersIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { useState, useRef, useEffect } from "react";
import useLogout from "../hooks/useLogout";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const { logoutMutation } = useLogout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { icon: HomeIcon, label: "Home", path: "/" },
    { icon: UsersIcon, label: "Friends", path: "/friends" },
    { icon: BellIcon, label: "Notifications", path: "/notifications" },
    { icon: SettingsIcon, label: "Settings", path: "/settings" },
  ];

  return (
    <aside className="w-64 bg-base-100 border-r border-base-800 hidden lg:flex flex-col h-screen sticky top-0 z-40">
      {/* LOGO */}
      <div className="h-16 px-6 flex items-center border-b border-base-200">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary rounded-lg">
            <ShipWheelIcon className="size-5 text-primary-content" />
          </div>
          <span className="text-lg font-bold tracking-tight text-base-content">
            Streamify
          </span>
        </Link>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-base-content/60 hover:bg-base-200/70 hover:text-base-content"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className="size-4.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* USER PROFILE */}
      <div className="px-4 pb-5 border-t border-base-200/70 pt-4 bg-base-100/60 backdrop-blur-md relative" ref={dropdownRef}>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-4 right-4 mb-3 bg-base-100 border border-base-200 rounded-2xl shadow-2xl overflow-hidden z-50 origin-bottom"
            >
              <div className="p-2">
                <button
                  onClick={() => {
                    logoutMutation();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-colors duration-150"
                >
                  <div className="p-1.5 bg-error/10 rounded-lg">
                    <LogOutIcon className="size-4" />
                  </div>
                  <span>Sign out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 cursor-pointer border",
            isDropdownOpen 
              ? "bg-base-200 border-primary/20 shadow-inner" 
              : "bg-base-200/40 hover:bg-base-200/70 shadow-sm hover:shadow-md border-base-300/40"
          )}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-primary/30 shadow-lg bg-base-300">
              <img
                src={authUser?.profilePic}
                alt={authUser?.fullName || "User Avatar"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Online Indicator */}
            {/* <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-base-100 shadow-sm animate-pulse" /> */}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-base-content truncate">
              {authUser?.fullName}
            </h3>

            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-xs text-base-content/60 font-medium">
                Online
              </p>
            </div>
          </div>

          {/* Optional Action */}
          <div className="p-2 rounded-xl hover:bg-base-300/60 transition-colors">
            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-base-content/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;