import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  VideoIcon,
  ArrowLeftIcon,
  SendIcon,
  ArrowRightIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { getUserFriends } from "../lib/api";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { cn } from "../lib/utils";
import { Helmet } from "react-helmet-async";

const MeetingSchedulePage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedInvitees, setSelectedInvitees] = useState([]);
  const [showForm, setShowForm] = useState(true);

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: scheduledMeetings = [] } = useQuery({
    queryKey: ["scheduledMeetings"],
    queryFn: async () => {
      const res = await axiosInstance.get("/meetings/scheduled");
      return res.data.data;
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/meetings/schedule", data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Meeting scheduled! Invitations sent.");
      queryClient.invalidateQueries({ queryKey: ["scheduledMeetings"] });
      setTitle("");
      setDate("");
      setTime("");
      setSelectedInvitees([]);
      setShowForm(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to schedule meeting");
    },
  });

  const toggleInvitee = (id) => {
    setSelectedInvitees((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const handleSchedule = () => {
    if (!title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }
    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }
    if (selectedInvitees.length === 0) {
      toast.error("Please invite at least one participant");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    scheduleMutation.mutate({
      title: title.trim(),
      scheduledAt,
      inviteeIds: selectedInvitees,
    });
  };

  const friendsList = Array.isArray(friends)
    ? friends
    : friends?.friends || [];
  const meetingsList = Array.isArray(scheduledMeetings)
    ? scheduledMeetings
    : [];

  return (
    <div className="min-h-screen bg-base-100">
      <Helmet>
        <title>Schedule Meeting | Streamify</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* HEADER */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/meeting/lobby")}
              className="btn btn-ghost btn-circle btn-sm"
            >
              <ArrowLeftIcon className="size-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-base-content">
                Schedule a Meeting
              </h1>
              <p className="text-sm text-base-content/50 font-medium">
                Plan a future meeting and invite your friends
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* FORM */}
            <div className="backdrop-blur-md bg-base-100/70 border border-base-300/50 rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                <CalendarIcon className="size-5 text-primary" />
                Meeting Details
              </h2>

              {/* TITLE */}
              <div>
                <label className="text-xs font-bold text-base-content/50 uppercase tracking-wider block mb-1.5">
                  Meeting Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spanish Practice Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input input-bordered bg-base-200/50 border-base-300 w-full rounded-xl"
                />
              </div>

              {/* DATE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-base-content/50 uppercase tracking-wider block mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="input input-bordered bg-base-200/50 border-base-300 w-full rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-base-content/50 uppercase tracking-wider block mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time || ""}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-12 px-4 bg-white text-black border border-gray-200 rounded-2xl transition-all duration-200 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 shadow-sm"
                  />
                </div>
              </div>

              {/* INVITE FRIENDS */}
              <div>
                <label className="text-xs font-bold text-base-content/50 uppercase tracking-wider block mb-1.5">
                  Invite Friends ({selectedInvitees.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl bg-base-200/30 p-2 border border-base-300/50">
                  {friendsList.length > 0 ? (
                    friendsList.map((friend) => (
                      <button
                        key={friend._id}
                        onClick={() => toggleInvitee(friend._id)}
                        className={cn(
                          "flex items-center gap-3 w-full p-2.5 rounded-xl transition-all text-left",
                          selectedInvitees.includes(friend._id)
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-base-200 border border-transparent"
                        )}
                      >
                        <div className="size-8 rounded-lg overflow-hidden ring-1 ring-base-300 shrink-0">
                          <img
                            src={friend.profilePic}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-base-content truncate">
                            {friend.fullName}
                          </p>
                          <p className="text-xs text-base-content/40">
                            {friend.nativeLanguage} → {friend.learningLanguage}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "size-5 rounded-md border-2 transition-all flex items-center justify-center",
                            selectedInvitees.includes(friend._id)
                              ? "bg-primary border-primary text-primary-content"
                              : "border-base-300"
                          )}
                        >
                          {selectedInvitees.includes(friend._id) && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-base-content/40 text-center py-4">
                      No friends to invite. Add friends first!
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleSchedule}
                disabled={scheduleMutation.isPending}
                className="btn bg-gradient-to-r from-primary to-blue-500 text-white border-none w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {scheduleMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <SendIcon className="size-5" />
                    Schedule Meeting
                  </>
                )}
              </button>
            </div>

            {/* SCHEDULED MEETINGS */}
            <div className="backdrop-blur-md bg-base-100/70 border border-base-300/50 rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                <ClockIcon className="size-5 text-primary" />
                Upcoming Meetings
              </h2>

              {meetingsList.length > 0 ? (
                <div className="space-y-3">
                  {meetingsList.map((meeting) => (
                    <div
                      key={meeting._id}
                      className="bg-base-200/50 rounded-xl p-4 border border-base-300/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-base-content truncate">
                            {meeting.title}
                          </p>
                          <p className="text-xs text-base-content/40">
                            Hosted by {meeting.hostId?.fullName || "You"}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            navigate(`/meeting/room/${meeting.roomId}`)
                          }
                          className="btn btn-primary btn-xs rounded-lg font-bold"
                        >
                          <VideoIcon className="size-3" />
                          Join
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-base-content/40 uppercase tracking-wider font-bold">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="size-3" />
                          {meeting.scheduledAt
                            ? new Date(
                                meeting.scheduledAt
                              ).toLocaleDateString()
                            : "TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="size-3" />
                          {meeting.scheduledAt
                            ? new Date(
                                meeting.scheduledAt
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="size-3" />
                          {meeting.participants?.length || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="size-12 rounded-full bg-base-200 flex items-center justify-center">
                    <CalendarIcon className="size-6 text-base-content/20" />
                  </div>
                  <p className="text-sm text-base-content/40 font-medium">
                    No upcoming meetings
                  </p>
                  <p className="text-xs text-base-content/30">
                    Schedule a meeting to see it here
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/meeting/lobby")}
                className="btn btn-ghost border border-base-300 w-full h-11 rounded-xl font-bold text-base-content"
              >
                <ArrowRightIcon className="size-4" />
                Go to Meeting Lobby
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MeetingSchedulePage;
