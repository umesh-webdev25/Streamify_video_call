import { Link, useLocation } from "react-router-dom";
import { BellIcon, HomeIcon, UsersIcon, SettingsIcon, SearchIcon, VideoIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

const MobileNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: HomeIcon, label: "Home", path: "/" },
    { icon: VideoIcon, label: "Meetings", path: "/meeting/lobby" },
    { icon: UsersIcon, label: "Friends", path: "/friends" },
    { icon: BellIcon, label: "Alerts", path: "/notifications" },
    { icon: SettingsIcon, label: "Config", path: "/settings" },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <motion.nav 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="glass-dark rounded-[2rem] border border-white/10 px-8 py-4 shadow-2xl"
        >
            <div className="flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "relative flex flex-col items-center gap-1.5 transition-all duration-500",
                                isActive ? "text-primary scale-110" : "text-white/40 hover:text-white"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-all duration-500",
                                isActive ? "bg-primary/20" : "bg-transparent"
                            )}>
                                <item.icon className="size-6" />
                            </div>
                            
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-active-pill"
                                    className="absolute -top-1 size-1 rounded-full bg-primary shadow-lg shadow-primary/50"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    </div>
  );
};

export default MobileNav;
