import React from 'react';
import { motion } from 'framer-motion';
import { FolderIcon, ContactIcon, ActivityIcon, FolderArchiveIcon, VideoIcon, Trash2Icon, UserXIcon, MessageSquareIcon } from 'lucide-react';
const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
const DashboardStats = ({ stats }) => {
  const cards = [
    { label: "Total Groups", value: stats.totalGroups, desc: "All Groups Created", icon: FolderIcon, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Total Contacts", value: stats.totalContacts, desc: "Saved Contacts", icon: ContactIcon, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
    { label: "Active Groups", value: stats.activeGroups, desc: "Currently active", icon: ActivityIcon, color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
    { label: "Inactive Groups", value: stats.inactiveGroups, desc: "Currently inactive", icon: FolderArchiveIcon, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
    { label: "Total Sessions", value: stats.totalSessions, desc: "Meetings Completed", icon: VideoIcon, color: "text-info", bg: "bg-info/10", border: "border-info/20" },
    { label: "Deleted Groups", value: stats.deletedGroups, desc: "Soft deleted", icon: Trash2Icon, color: "text-error", bg: "bg-error/10", border: "border-error/20" },
    { label: "Deleted Contacts", value: stats.deletedContacts, desc: "Soft deleted", icon: UserXIcon, color: "text-error", bg: "bg-error/10", border: "border-error/20" },
    { label: "Total Messages", value: stats.totalMessages, desc: "Sent across chats", icon: MessageSquareIcon, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          variants={statVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-base-100 border border-base-300 rounded-2xl px-4 sm:px-6 h-[120px] flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative"
        >
          <div className="relative z-10">
            <p className="text-sm font-medium text-base-content/60">
              {card.label}
            </p>
            <h2 className="text-4xl font-bold text-base-content mt-2">
              {card.value}
            </h2>
          </div>
          <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center flex-shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-300`}>
            <card.icon className={`w-7 h-7 ${card.color}`} />
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-transparent to-base-300/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;
