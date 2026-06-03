import React from 'react';
import { FolderIcon, ContactIcon, VideoIcon, MessageSquareIcon } from 'lucide-react';

const DashboardSummary = ({ summary }) => {
  const items = [
    { label: "Total Groups", value: summary.groups || 12, icon: FolderIcon },
    { label: "Total Contacts", value: summary.contacts || 890, icon: ContactIcon },
    { label: "Total Sessions", value: summary.sessions || "1,250", icon: VideoIcon },
    { label: "Total Messages", value: summary.messages || "14.5k", icon: MessageSquareIcon },
  ];

  return (
    <footer className="mt-12 mb-6 bg-gradient-to-r from-base-200/50 to-base-200/20 border border-base-300 rounded-3xl p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Dashboard Summary</h3>
          <p className="text-xs font-medium text-base-content/50 mt-1">Your all-time statistics on MeetFlow.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 md:gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-base-100 border border-base-300 flex items-center justify-center text-base-content/60 shadow-sm">
                <item.icon className="size-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-black text-base-content">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default DashboardSummary;
