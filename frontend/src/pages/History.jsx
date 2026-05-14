import React from "react";

import {
  Clock3Icon,
  MonitorIcon,
} from "lucide-react";

import useSessions from "../hooks/session.js";

const History = () => {
  const { sessions, isLoading } =
    useSessions();

  if (isLoading) {
    return (
      <div className="p-6">
        Loading sessions...
      </div>
    );
  }

  console.log("Sessions:", sessions);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Clock3Icon className="w-7 h-7 text-primary" />

        <div>
          <h1 className="text-2xl font-bold">
            Session History
          </h1>

          <p className="text-sm text-base-content/70">
            All active login sessions
          </p>
        </div>
      </div>

      {/* Sessions */}
      <div className="space-y-4">
        {sessions?.map((session) => (
          <div
            key={session._id}
            className="
              bg-base-200
              border border-base-300
              rounded-2xl
              p-5
            "
          >
            <div className="flex items-center gap-2 mb-2">
              <MonitorIcon className="w-5 h-5 text-primary" />

              <h2 className="font-semibold">
                {session.deviceInfo}
              </h2>
            </div>

            <p className="text-sm text-base-content/70">
              IP Address: {session.ipAddress}
            </p>

            <p className="text-sm text-base-content/70 mt-1">
              Status:
              {" "}
              {session.isValid
                ? "Active"
                : "Invalid"}
            </p>

            <p className="text-sm text-base-content/70 mt-1">
              Created:
              {" "}
              {new Date(
                session.createdAt
              ).toLocaleString()}
            </p>

            <p className="text-sm text-base-content/70 mt-1">
              Expires:
              {" "}
              {new Date(
                session.expiresAt
              ).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;