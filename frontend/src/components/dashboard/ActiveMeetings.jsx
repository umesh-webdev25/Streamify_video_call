import React from 'react';
import { VideoIcon, LogInIcon, UsersIcon, ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '../ProfileImage.jsx';

const ActiveMeetings = ({ meetings }) => {
  const navigate = useNavigate();

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-widest">Live Group Meetings</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {meetings && meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div
              key={meeting._id || meeting.id}
              className="relative w-full overflow-hidden border border-base-300 rounded-[1rem] p-6 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Subtle background glow effect */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-success/10 blur-3xl rounded-full group-hover:bg-success/20 transition-all duration-500" />
              
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="min-w-0 flex items-start gap-4 flex-1">
                  <div className="relative">
                    <ProfileImage
                      src={meeting.groupImage}
                      name={meeting.groupName || 'Group'}
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-2 ring-base-100 shrink-0"
                    />
                    <div className="absolute -bottom-1 -right-1 size-4 bg-success border-2 border-base-100 rounded-full shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-extrabold text-success uppercase tracking-wider bg-success/10 px-2 py-0.5 rounded-md">
                        Live Now
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-base-content truncate group-hover:text-primary transition-colors">
                      {meeting.title || meeting.name || 'Group Meeting'}
                    </h3>
                    <p className="text-sm font-medium text-base-content/60 truncate mt-0.5">
                      {meeting.groupName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-base-content/5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60 bg-base-200/50 px-2.5 py-1.5 rounded-lg">
                    <UsersIcon className="size-4 text-primary/70" />
                    {meeting.activeParticipants || meeting.participants?.filter(p => !p.leftAt).length || meeting.participants} <span className="hidden sm:inline">Joined</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60 bg-base-200/50 px-2.5 py-1.5 rounded-lg">
                    <ClockIcon className="size-4 text-primary/70" />
                    {meeting.duration || 'Started recently'}
                  </div>
                </div>
                
                <button
                  onClick={() => navigate(`/meeting/lobby?code=${meeting.meetingCode}`)}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-primary-content text-sm font-bold rounded-xl hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-md shadow-primary/20 transition-all duration-200"
                >
                  <LogInIcon className="size-4" />
                  Join Call
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full border-2 border-dashed border-base-300 bg-base-100/30 rounded-[2rem] p-16 text-center transition-all hover:bg-base-100/50">
            <div className="size-16 rounded-3xl bg-base-200 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <VideoIcon className="size-8 text-base-content/30" />
            </div>
            <p className="text-lg font-bold text-base-content">No Active Meetings</p>
            <p className="text-sm font-medium text-base-content/50 mt-2 max-w-sm mx-auto">
              When a group member starts a video call, it will appear right here for you to join instantly.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActiveMeetings;
