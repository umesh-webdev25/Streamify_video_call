import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGroups } from "../lib/api";
import { GroupIcon, CalendarIcon, VideoIcon, ActivityIcon, UsersIcon } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useAuthUser from "../hooks/useAuthUser";

const resolveImageSrc = (img) => {
  if (!img) return "/group.png";
  if (/^https?:\/\//i.test(img)) return img;
  const base = (import.meta?.env?.VITE_API_BASE_URL || "").replace(/\/api\/v1$/, "").replace(/\/$/, "");
  const path = img.startsWith("/") ? img : `/${img}`;
  return `${base}${path}`;
};

const MyGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  useEffect(() => {
    const fetchMyGroups = async () => {
      try {
        setLoading(true);
        const data = await getMyGroups();
        setGroups(data || []);
      } catch (err) {
        console.error("Failed to fetch my groups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyGroups();
  }, []);

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans">
      <Helmet>
        <title>My Groups | MeetFlow</title>
      </Helmet>

      {/* ── PAGE HEADER ── */}
      <div className="flex items-center justify-between mb-6 bg-base-100 border border-base-300 rounded-2xl px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <GroupIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">My Groups</h1>
            <p className="text-sm text-base-content/50 mt-1">
              Groups where you are a member or an admin
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-base-100 rounded-2xl border border-base-300 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <GroupIcon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-base-content">No Groups Found</h2>
          <p className="text-base-content/60 mt-2 max-w-sm mx-auto">
            You don't belong to any groups yet. When you are added to a group, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.groupId}
              onClick={() => navigate(`/groups/${group.groupId}`)}
              className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Group Banner / Header */}
              <div className="p-5 flex items-start gap-4">
                <img
                  src={resolveImageSrc(group.groupImage)}
                  alt={group.groupName}
                  className="w-16 h-16 rounded-2xl object-cover bg-base-200 shadow-sm border border-base-300"
                  onError={(e) => { e.currentTarget.src = "/group.png"; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-base-content truncate group-hover:text-primary transition-colors">
                    {group.groupName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-base-content/60">
                    <UsersIcon className="w-4 h-4" />
                    <span>{group.memberCount} Members</span>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                <div className="bg-base-200 rounded-xl p-3 flex flex-col items-center justify-center border border-base-300">
                  <span className="text-base-content/60 text-xs font-medium mb-1">Upcoming</span>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-secondary" />
                    <span className="font-bold text-base-content">{group.upcomingMeetingCount}</span>
                  </div>
                </div>

                <div className={`rounded-xl p-3 flex flex-col items-center justify-center border ${group.activeMeeting ? 'bg-success/10 border-success/20' : 'bg-base-200 border-base-300'}`}>
                  <span className={`${group.activeMeeting ? 'text-success/80' : 'text-base-content/60'} text-xs font-medium mb-1`}>Status</span>
                  <div className="flex items-center gap-1.5">
                    {group.activeMeeting ? (
                      <>
                        <ActivityIcon className="w-4 h-4 text-success animate-pulse" />
                        <span className="font-bold text-success text-sm">Live Now</span>
                      </>
                    ) : (
                      <>
                        <VideoIcon className="w-4 h-4 text-base-content/40" />
                        <span className="font-semibold text-base-content/60 text-sm">Offline</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Join Active Button (if any) */}
              {group.activeMeeting && (
                <div className="px-5 pb-5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/meeting/lobby?code=${group.activeMeeting}`);
                    }}
                    className="w-full btn btn-success btn-sm text-white font-medium shadow-sm animate-pulse-slight"
                  >
                    Join Active Meeting
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGroupsPage;
