import React from 'react';
import { motion } from 'framer-motion';
import { VideoIcon, CalendarIcon, FolderPlusIcon, ContactIcon, MessageSquareIcon, BarChart3Icon } from 'lucide-react';

const QuickActions = ({ navigate }) => {
  const actions = [
    { icon: VideoIcon, label: "Start Meeting", desc: "Instant call", path: "/meeting/lobby", bg: "bg-primary/10", text: "text-primary", border: "hover:border-primary/50" },
    { icon: CalendarIcon, label: "Schedule Meeting", desc: "Plan a call", path: "/meeting/schedule", bg: "bg-secondary/10", text: "text-secondary", border: "hover:border-secondary/50" },
    { icon: FolderPlusIcon, label: "Create Group", desc: "Start a community", path: "/group", bg: "bg-success/10", text: "text-success", border: "hover:border-success/50" },
    // { icon: ContactIcon, label: "Manage Contacts", desc: "View connections", path: "/friends", bg: "bg-info/10", text: "text-info", border: "hover:border-info/50" },
    // { icon: MessageSquareIcon, label: "Open Chats", desc: "Send messages", path: "/chat", bg: "bg-warning/10", text: "text-warning", border: "hover:border-warning/50" },
    // { icon: BarChart3Icon, label: "View Reports", desc: "See analytics", path: "/", bg: "bg-error/10", text: "text-error", border: "hover:border-error/50" },
  ];

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {actions.map((action, idx) => (
          <motion.button
            key={action.label}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.path)}
            className={`w-full flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-base-100 border border-base-300 shadow-sm transition-all duration-300 ${action.border} hover:shadow-md group cursor-pointer`}
          >
            <div className={`size-14 rounded-2xl ${action.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <action.icon className={`size-6 ${action.text}`} />
            </div>
            <p className="text-sm font-bold text-base-content whitespace-nowrap">{action.label}</p>
            <p className="text-[10px] font-semibold text-base-content/50 mt-1 whitespace-nowrap">{action.desc}</p>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
