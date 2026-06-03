import React from 'react';
import { BellIcon, CalendarIcon, UsersIcon, AlertCircleIcon, CheckIcon, FolderIcon, ContactIcon } from 'lucide-react';

const NotificationsPanel = ({ notifications }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'meeting': return <CalendarIcon className="size-4 text-secondary" />;
      case 'group': return <FolderIcon className="size-4 text-success" />;
      case 'contact': return <ContactIcon className="size-4 text-info" />;
      case 'system': return <AlertCircleIcon className="size-4 text-error" />;
      default: return <BellIcon className="size-4 text-primary" />;
    }
  };

  const getBg = (type) => {
    switch(type) {
      case 'meeting': return "bg-secondary/10 text-secondary";
      case 'group': return "bg-success/10 text-success";
      case 'contact': return "bg-info/10 text-info";
      case 'system': return "bg-error/10 text-error";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">Recent Notifications</h2>
        <button className="text-xs font-bold text-primary hover:underline">Mark all read</button>
      </div>
      <div className="space-y-4 flex-1">
        {notifications && notifications.length > 0 ? (
          notifications.map((notif, idx) => (
            <div key={idx} className={`flex items-start gap-4 p-3 rounded-2xl transition-colors ${notif.read ? '' : 'bg-base-200/50'}`}>
              <div className={`relative z-10 size-10 rounded-xl flex items-center justify-center shrink-0 ${getBg(notif.type)}`}>
                {getIcon(notif.type)}
                {!notif.read && <span className="absolute -top-1 -right-1 size-2.5 bg-error rounded-full border-2 border-base-100"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-base-content truncate">{notif.title}</p>
                <p className="text-xs font-medium text-base-content/60 mt-0.5 line-clamp-1">{notif.desc}</p>
                <span className="text-[10px] font-bold text-base-content/40 mt-1 block uppercase tracking-wider">{notif.time}</span>
              </div>
              {!notif.read && (
                <button className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-success shrink-0">
                  <CheckIcon className="size-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-base-content/50 text-center py-4">All caught up!</p>
        )}
      </div>
      {notifications && notifications.length > 0 && (
        <button className="btn btn-ghost btn-sm w-full mt-4 text-xs font-bold uppercase tracking-wider">View All</button>
      )}
    </div>
  );
};

export default NotificationsPanel;
