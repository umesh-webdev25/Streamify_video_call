import React from 'react';
import { FolderPlusIcon, UserPlusIcon, VideoIcon, CheckCircle2Icon, MessageSquareIcon, ActivityIcon } from 'lucide-react';

const ActivityTimeline = ({ activities }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'group': return <FolderPlusIcon className="size-4" />;
      case 'contact': return <UserPlusIcon className="size-4" />;
      case 'meeting_start': return <VideoIcon className="size-4" />;
      case 'meeting_end': return <CheckCircle2Icon className="size-4" />;
      case 'message': return <MessageSquareIcon className="size-4" />;
      default: return <ActivityIcon className="size-4" />;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'group': return "bg-success text-success-content";
      case 'contact': return "bg-info text-info-content";
      case 'meeting_start': return "bg-primary text-primary-content";
      case 'meeting_end': return "bg-secondary text-secondary-content";
      case 'message': return "bg-warning text-warning-content";
      default: return "bg-base-300 text-base-content";
    }
  };

  return (
    <section className="mb-10 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">Activity Timeline</h2>
        <button className="text-xs font-bold text-primary hover:underline">View All</button>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm h-[calc(100%-2rem)] flex flex-col">
        {activities && activities.length > 0 ? (
          <div className="relative pl-6 border-l-2 border-base-200 space-y-8 mt-2">
            {activities.map((activity, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[37px] top-0 size-8 rounded-full flex items-center justify-center shadow-sm border-4 border-base-100 ${getColor(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-base-content">{activity.title}</h4>
                  <p className="text-xs font-medium text-base-content/60 mt-1">{activity.desc}</p>
                  <span className="text-[10px] font-bold text-base-content/40 mt-1 block uppercase tracking-wider">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <ActivityIcon className="size-10 text-base-content/20 mb-3" />
            <p className="text-sm font-bold text-base-content/50">No recent activity</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityTimeline;
