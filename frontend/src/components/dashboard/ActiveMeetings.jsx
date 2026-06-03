import React from 'react';
import { VideoIcon, LogInIcon, UsersIcon, ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActiveMeetings = ({ meetings }) => {
  const navigate = useNavigate();

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-success animate-pulse" />
          <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">Active Meetings</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetings && meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="border border-base-300 bg-base-100 rounded-3xl p-6 hover:border-base-400 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider">
                      Live
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-base-content mt-2 truncate">
                    {meeting.name}
                  </h3>
                  <p className="text-sm font-medium text-base-content/50 mt-1 truncate">
                    Group: {meeting.groupName}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => navigate("/meeting/lobby")}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-content text-sm font-bold rounded-xl hover:bg-primary/90 transition-all duration-200"
                  >
                    <LogInIcon className="size-4" />
                    Join
                  </button>
                  <button className="text-[10px] font-bold text-base-content/50 hover:text-base-content uppercase tracking-wider transition-colors">
                    View Details
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-base-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-base-content/60">
                  <UsersIcon className="size-4" />
                  {meeting.participants} Participants
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-base-content/60">
                  <ClockIcon className="size-4" />
                  {meeting.duration}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full border border-dashed border-base-300 bg-base-100/50 rounded-3xl p-12 text-center">
            <div className="size-14 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-4">
              <VideoIcon className="size-6 text-base-content/30" />
            </div>
            <p className="text-base font-bold text-base-content">No active meetings</p>
            <p className="text-sm font-medium text-base-content/50 mt-1">When a group starts a meeting, it will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActiveMeetings;
