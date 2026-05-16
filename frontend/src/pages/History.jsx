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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">

      {/* ── PAGE HEADER ── */}
      <div
        className="
    flex items-center justify-between
    mb-6
    bg-white
    border border-gray-200
    rounded-2xl
    px-6 py-5
    shadow-sm
  "
      >
        {/* Left */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Session History
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitor and manage all user sessions
          </p>
        </div>

        {/* Right */}
        <button
          className="
      w-10 h-10
      rounded-xl
      flex items-center justify-center
      text-gray-400
      hover:text-gray-700
      hover:bg-gray-100
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
      bg-white
      border border-gray-200
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
        >
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Sessions
            </p>

            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              {totalSessions}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-blue-50
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <Clock3Icon className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        {/* Active Sessions */}
        <div
          className="
      bg-white
      border border-gray-200
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
        >
          <div>
            <p className="text-sm font-medium text-gray-500">
              Active Sessions
            </p>

            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              {activeSessions}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-green-50
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <ShieldCheckIcon className="w-7 h-7 text-green-600" />
          </div>
        </div>

        {/* Expired Sessions */}
        <div
          className="
      bg-white
      border border-gray-200
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
        >
          <div>
            <p className="text-sm font-medium text-gray-500">
              Expired Sessions
            </p>

            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              {expiredSessions}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-red-50
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <Clock3Icon className="w-7 h-7 text-red-500" />
          </div>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock3Icon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">All Login Sessions</span>
          </div>
          <span className="ml-auto text-xs text-gray-400">
            {totalSessions} total
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[30%]">Device</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[18%]">IP Address</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[12%]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[20%]">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[20%]">Expires</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-500">Loading sessions...</p>
                    </div>
                  </td>
                </tr>
              ) : !sessions?.length ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Clock3Icon className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-base font-semibold text-gray-700">No Sessions Found</p>
                      <p className="text-sm text-gray-400">No active login sessions available</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sessions.map((session, idx) => (
                  <tr
                    key={session._id}
                    className={`border-b border-gray-50 hover:bg-blue-50 transition-colors duration-150 ${idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}
                  >
                    {/* Device */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <MonitorIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-blue-600 truncate max-w-[180px]">
                          {session.deviceInfo}
                        </span>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <WifiIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 font-mono">{session.ipAddress}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${session.isValid
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-500 border-red-200"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${session.isValid ? "bg-green-500" : "bg-red-400"}`} />
                        {session.isValid ? "Active" : "Expired"}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600">
                          {new Date(session.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Expires */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Clock3Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className={`text-sm ${session.isValid ? "text-gray-600" : "text-red-400"}`}>
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
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {sessions.length} session{sessions.length !== 1 ? "s" : ""} · {activeSessions} active · {expiredSessions} expired
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;