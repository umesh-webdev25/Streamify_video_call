import React from "react";
import {
  Clock3Icon,
  MonitorIcon,
  ShieldCheckIcon,
  WifiIcon,
  CalendarIcon,
  MoreVerticalIcon,
} from "lucide-react";
import useSessions from "../hooks/session.js";

const History = () => {
  const { sessions, isLoading } = useSessions();

  console.log("Sessions:", sessions);

  /* ── Stats derived from sessions ── */
  const totalSessions = sessions?.length ?? 0;
  const activeSessions = sessions?.filter((s) => s.isValid).length ?? 0;
  const expiredSessions = sessions?.filter((s) => !s.isValid).length ?? 0;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans">

      {/* ── PAGE HEADER ── */}
      <div
        className="
    flex items-center justify-between
    mb-6
    bg-base-100
    border border-base-300
    rounded-2xl
    px-6 py-5
    shadow-sm
  "
      >
        {/* Left */}
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            Session History
          </h1>

          <p className="text-sm text-base-content/50 mt-1">
            Monitor and manage all user sessions
          </p>
        </div>

        {/* Right */}
        <button
          className="
      w-10 h-10
      rounded-xl
      flex items-center justify-center
      text-base-content/40
      hover:text-base-content
      hover:bg-base-200
      transition-all
    "
        >
          <MoreVerticalIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">

        {/* Total Sessions */}
        <div
          className="
      bg-base-100
      border border-base-300
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
        >
          <div>
            <p className="text-sm font-medium text-base-content/60">
              Total Sessions
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {totalSessions}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-primary/10
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <Clock3Icon className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Active Sessions */}
        <div
          className="
      bg-base-100
      border border-base-300
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
        >
          <div>
            <p className="text-sm font-medium text-base-content/60">
              Active Sessions
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {activeSessions}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-success/10
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <ShieldCheckIcon className="w-7 h-7 text-success" />
          </div>
        </div>

        {/* Expired Sessions */}
        <div
          className="
      bg-base-100
      border border-base-300
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
        >
          <div>
            <p className="text-sm font-medium text-base-content/60">
              Expired Sessions
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {expiredSessions}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-error/10
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <Clock3Icon className="w-7 h-7 text-error" />
          </div>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-base-200">
          <div className="flex items-center gap-2">
            <Clock3Icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-base-content">All Login Sessions</span>
          </div>
          <span className="ml-auto text-xs text-base-content/40">
            {totalSessions} total
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-base-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider border-b border-base-300 w-[20%]">Device</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider border-b border-base-300 w-[15%]">IP Address</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider border-b border-base-300 w-[10%]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider border-b border-base-300 w-[18%]">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider border-b border-base-300 w-[17%]">Expires</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-base-content/50">Loading sessions...</p>
                    </div>
                  </td>
                </tr>
              ) : !sessions?.length ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Clock3Icon className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-base font-semibold text-base-content">No Sessions Found</p>
                      <p className="text-sm text-base-content/40">No active login sessions available</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sessions.map((session, idx) => (
                  <tr
                    key={session._id}
                    className={`border-b border-base-200 hover:bg-base-200/50 transition-colors duration-150 ${idx % 2 === 1 ? "bg-base-200/20" : "bg-base-100"}`}
                  >
                    {/* User */}
                    {/* <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <img
                            src={session.user?.profilePic || "/avatar.png"}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {session.user?.fullName || "Deleted User"}
                        </span>
                      </div>
                    </td> */}

                    {/* Device */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MonitorIcon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-primary truncate max-w-[180px]">
                          {session.deviceInfo}
                        </span>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <WifiIcon className="w-3.5 h-3.5 text-base-content/40 flex-shrink-0" />
                        <span className="text-sm text-base-content/60 font-mono">{session.ipAddress}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${session.isValid
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-error/10 text-error border-error/20"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${session.isValid ? "bg-success" : "bg-error"}`} />
                        {session.isValid ? "Active" : "Expired"}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-base-content/40 flex-shrink-0" />
                        <span className="text-sm text-base-content/60">
                          {new Date(session.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Expires */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Clock3Icon className="w-3.5 h-3.5 text-base-content/40 flex-shrink-0" />
                        <span className={`text-sm ${session.isValid ? "text-base-content/60" : "text-error"}`}>
                          {new Date(session.expiresAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        {!isLoading && sessions?.length > 0 && (
          <div className="px-4 py-3 border-t border-base-200">
            <p className="text-xs text-base-content/40">
              Showing {sessions.length} session{sessions.length !== 1 ? "s" : ""} · {activeSessions} active · {expiredSessions} expired
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;