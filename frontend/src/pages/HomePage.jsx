import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  VideoIcon,
  PlusIcon,
  UsersIcon,
  MonitorUpIcon,
  CalendarIcon,
  ArrowRightIcon,
  MessageSquareIcon,
  MapPinIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  CopyIcon,
  PhoneIcon,
  ActivityIcon,
  GlobeIcon,
  MessageCircleIcon,
  LogInIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { capitalize, cn } from "../lib/utils";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import Skeleton from "../components/ui/Skeleton";
import { Helmet } from "react-helmet-async";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};

const statsCards = [
  { icon: UsersIcon, label: "Online Friends", value: "8" },
  { icon: VideoIcon, label: "Active Meetings", value: "3" },
  { icon: GlobeIcon, label: "Total Connections", value: "24" },
];

const quickActions = [
  { icon: VideoIcon, label: "Instant Meeting", desc: "Start a video call right now", path: "/meeting/lobby" },
  { icon: PlusIcon, label: "Create Room", desc: "Set up a permanent meeting room", path: "/meeting/lobby" },
  { icon: UsersIcon, label: "Invite Friends", desc: "Share your invite link", path: "/friends" },
  { icon: MonitorUpIcon, label: "Share Screen", desc: "Present your screen to others", path: "/meeting/lobby" },
];

const activities = [
  { user: "You", action: "started a call with Sarah", time: "2 min ago", type: "call" },
  { user: "Sarah", action: "joined the meeting room", time: "5 min ago", type: "join" },
  { user: "Mike", action: "sent you a message", time: "12 min ago", type: "message" },
  { user: "Emma", action: "accepted your friend request", time: "1 hour ago", type: "friend" },
  { user: "Alex", action: "scheduled a meeting", time: "3 hours ago", type: "schedule" },
];

const activeMeetings = [
  { id: 1, name: "Spanish Practice", participants: 4, host: "Sarah" },
  { id: 2, name: "French Study Group", participants: 6, host: "Mike" },
];

const upcomingMeetings = [
  { id: 1, title: "Japanese Conversation", time: "Today, 3:00 PM", participants: ["Sarah", "Mike"], total: 4 },
  { id: 2, title: "German Grammar Review", time: "Tomorrow, 10:00 AM", participants: ["Emma"], total: 3 },
];

const HomePage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showActivity, setShowActivity] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1280);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: friendsRaw = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });
  const friends = Array.isArray(friendsRaw) ? friendsRaw : friendsRaw?.friends || [];

  const { data: recommendedUsersRaw = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });
  const recommendedUsers = Array.isArray(recommendedUsersRaw) ? recommendedUsersRaw : recommendedUsersRaw?.users || [];

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/lobby`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const outgoingRequestsIds = useMemo(() => {
    const ids = new Set();
    const reqs = Array.isArray(outgoingFriendReqs) ? outgoingFriendReqs : outgoingFriendReqs?.requests || [];
    reqs.forEach((req) => ids.add(req.recipient?._id));
    return ids;
  }, [outgoingFriendReqs]);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Dashboard | Streamify</title>
      </Helmet>

      <div className="flex">
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10 max-w-6xl mx-auto w-full">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 sm:space-y-10">

            {/* HERO */}
            <motion.section variants={itemVariants} className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                    Welcome back,{" "}
                    <span className="text-blue-600">
                      {authUser?.fullName?.split(" ")[0] || "User"}
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500 mt-1">
                    Start or join meetings instantly
                  </p>
                </div>

                <button
                  onClick={() => navigate("/meeting/schedule")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <CalendarIcon className="size-4" />
                  Schedule
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {statsCards.map((stat) => (
                  <div
                    key={stat.label}
                    className="border border-gray-200 rounded-2xl p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-50">
                        <stat.icon className="size-4 sm:size-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {stat.label}
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/meeting/lobby")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  <VideoIcon className="size-4 sm:size-5" />
                  Start Meeting
                </button>
                <button
                  onClick={() => navigate("/meeting/lobby")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-700 font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <LogInIcon className="size-4 sm:size-5" />
                  Join Meeting
                </button>
                <button
                  onClick={copyInviteLink}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-700 font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  {copied ? (
                    <CheckCircleIcon className="size-4 sm:size-5 text-green-500" />
                  ) : (
                    <CopyIcon className="size-4 sm:size-5" />
                  )}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </motion.section>

            {/* QUICK ACTIONS */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quick Actions
                </h2>
                <span className="text-xs text-gray-400">4 available</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 text-left hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="size-10 sm:size-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 sm:mb-4">
                      <action.icon className="size-5 sm:size-6 text-blue-600" />
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {action.desc}
                    </p>
                  </button>
                ))}
              </div>
            </motion.section>

            {/* TWO COLUMN */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
              <div className="xl:col-span-2 space-y-8 sm:space-y-10">

                {/* ACTIVE MEETINGS */}
                <motion.section variants={itemVariants}>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-green-500" />
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Live Now
                      </h2>
                    </div>
                    <Link to="/meeting/lobby" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                      View all <ArrowRightIcon className="size-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {activeMeetings.length > 0 ? (
                      activeMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-green-500" />
                                <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">Live</span>
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mt-2 truncate">
                                {meeting.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Hosted by {meeting.host}
                              </p>
                            </div>
                            <Link
                              to="/meeting/lobby"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shrink-0"
                            >
                              <LogInIcon className="size-3.5" />
                              Join
                            </Link>
                          </div>

                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].slice(0, Math.min(meeting.participants, 3)).map((i) => (
                                <div key={i} className="size-7 rounded-full bg-blue-100 ring-2 ring-white flex items-center justify-center">
                                  <span className="text-[9px] font-bold text-blue-600">
                                    {String.fromCharCode(64 + i)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {meeting.participants} participant{meeting.participants !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full border border-dashed border-gray-200 rounded-2xl p-10 sm:p-12 text-center">
                        <div className="size-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                          <VideoIcon className="size-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No active meetings</p>
                      </div>
                    )}
                  </div>
                </motion.section>

                {/* CONNECTIONS */}
                <motion.section variants={itemVariants}>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div>
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Connections
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">Your language exchange partners</p>
                    </div>
                    <Link
                      to="/friends"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <UsersIcon className="size-3.5" />
                      View All
                    </Link>
                  </div>

                  {loadingFriends ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 space-y-4 border border-gray-200">
                          <div className="flex items-center gap-4">
                            <Skeleton className="size-16 rounded-xl" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-3/4 rounded" />
                              <Skeleton className="h-3 w-1/2 rounded" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="h-3 w-20 rounded" />
                            <Skeleton className="h-3 w-20 rounded" />
                          </div>
                          <div className="flex gap-3">
                            <Skeleton className="h-10 flex-1 rounded-xl" />
                            <Skeleton className="h-10 flex-1 rounded-xl" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : friends.length === 0 ? (
                    <NoFriendsFound />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {friends.slice(0, 4).map((friend) => (
                        <FriendCard key={friend._id} friend={friend} />
                      ))}
                    </div>
                  )}

                  {friends.length > 4 && (
                    <div className="mt-4 text-center">
                      <Link to="/friends" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-blue-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200">
                        <UsersIcon className="size-3.5" />
                        View all {friends.length} connections
                      </Link>
                    </div>
                  )}
                </motion.section>

                {/* SUGGESTED USERS */}
                <motion.section variants={itemVariants}>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Suggested Partners
                      </h2>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        <SparklesIcon className="size-3" />
                        AI Matched
                      </span>
                    </div>
                  </div>

                  {loadingUsers ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 space-y-4 border border-gray-200">
                          <div className="flex items-center gap-4">
                            <Skeleton className="size-14 rounded-xl" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-3/4 rounded" />
                              <Skeleton className="h-3 w-1/2 rounded" />
                            </div>
                          </div>
                          <Skeleton className="h-12 w-full rounded-xl" />
                          <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                      ))}
                    </div>
                  ) : recommendedUsers.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-2xl p-10 sm:p-12 text-center">
                      <div className="size-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <SparklesIcon className="size-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">No suggestions right now</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recommendedUsers.slice(0, 4).map((user) => {
                        const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                        return (
                          <div
                            key={user._id}
                            className="border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                          >
                            <div className="flex items-start gap-4">
                              <div className="size-14 sm:size-16 rounded-xl overflow-hidden ring-2 ring-gray-100 shrink-0">
                                <img
                                  src={user.profilePic || "/avatar.png"}
                                  alt={user.fullName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                  {user.fullName}
                                </h3>
                                {user.location && (
                                  <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                                    <MapPinIcon className="size-3 shrink-0" />
                                    <span className="truncate">{user.location}</span>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {user.nativeLanguage && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                                      {getLanguageFlag(user.nativeLanguage)}
                                      {capitalize(user.nativeLanguage)}
                                    </span>
                                  )}
                                  {user.learningLanguage && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">
                                      {getLanguageFlag(user.learningLanguage)}
                                      {capitalize(user.learningLanguage)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {user.bio && (
                              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2 mt-4">
                                {user.bio}
                              </p>
                            )}

                            <button
                              className={cn(
                                "mt-4 w-full py-2 text-sm font-medium rounded-xl transition-all duration-200",
                                hasRequestBeenSent
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              )}
                              onClick={() => sendRequestMutation(user._id)}
                              disabled={hasRequestBeenSent || isPending}
                            >
                              {hasRequestBeenSent ? (
                                <span className="inline-flex items-center justify-center gap-1.5">
                                  <CheckCircleIcon className="size-3.5" />
                                  Request Sent
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center gap-1.5">
                                  <UserPlusIcon className="size-3.5" />
                                  Connect
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.section>

                {/* UPCOMING MEETINGS */}
                <motion.section variants={itemVariants}>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div>
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Upcoming Meetings
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">Your scheduled calls</p>
                    </div>
                    <button
                      onClick={() => navigate("/meeting/schedule")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <CalendarIcon className="size-3.5" />
                      Schedule
                    </button>
                  </div>

                  {upcomingMeetings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {upcomingMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <ClockIcon className="size-3.5" />
                            {meeting.time}
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                            {meeting.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-1.5">
                                {meeting.participants.map((name, i) => (
                                  <div
                                    key={i}
                                    className="size-6 rounded-full bg-blue-100 ring-2 ring-white flex items-center justify-center"
                                  >
                                    <span className="text-[8px] font-bold text-blue-600">
                                      {name[0]}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                +{meeting.total - meeting.participants.length} more
                              </span>
                            </div>
                            <button
                              onClick={() => navigate("/meeting/lobby")}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 rounded-2xl p-10 sm:p-12 text-center">
                      <div className="size-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <CalendarIcon className="size-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">No upcoming meetings</p>
                    </div>
                  )}
                </motion.section>

              </div>

              {/* ACTIVITY SIDEBAR */}
              <div className="xl:col-span-1 space-y-6">
                <button
                  onClick={() => setShowActivity(!showActivity)}
                  className="xl:hidden w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <ActivityIcon className="size-4" />
                  {showActivity ? "Hide Activity" : "Show Activity"}
                </button>

                {(showActivity || isDesktop) && (
                  <div className="space-y-6">

                    {/* ACTIVITY FEED */}
                    <section className="border border-gray-200 rounded-2xl p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <span className="size-2 rounded-full bg-blue-600" />
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Recent Activity
                        </h2>
                      </div>

                      <div className="space-y-1">
                        {activities.map((activity, idx) => {
                          const typeIcons = {
                            call: PhoneIcon,
                            join: LogInIcon,
                            message: MessageCircleIcon,
                            friend: UserPlusIcon,
                            schedule: CalendarIcon,
                          };
                          const Icon = typeIcons[activity.type] || ActivityIcon;
                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                            >
                              <div className="size-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                <Icon className="size-4 text-gray-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  <span className="font-semibold text-gray-900">{activity.user}</span>{" "}
                                  {activity.action}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {activity.time}
                                </p>
                              </div>
                              {activity.type === "message" && (
                                <span className="size-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button className="w-full mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors text-center pt-3 border-t border-gray-100">
                        View all activity
                      </button>
                    </section>

                    {/* WEEKLY STATS */}
                    <section className="border border-gray-200 rounded-2xl p-5 sm:p-6">
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        This Week
                      </h2>
                      <div className="space-y-3">
                        {[
                          { label: "Meetings joined", value: "12", change: "+3" },
                          { label: "Messages sent", value: "48", change: "+12" },
                          { label: "New connections", value: "5", change: "+2" },
                        ].map((stat, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500">{stat.label}</p>
                              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                              {stat.change}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
