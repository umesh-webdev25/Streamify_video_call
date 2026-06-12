import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import {
  getAllGroups,
  getAllContacts,
  getAllSessions,
  deleteGroup,
  deleteContact,
  getScheduledMeetings,
  getAllActiveGroupMeetings
} from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarIcon } from "lucide-react";
import ProfileImage from "../components/ProfileImage.jsx";
import useAuthUser from "../hooks/useAuthUser";
import { useSocketStore } from "../store/useSocketStore";
import { capitalize, cn } from "../lib/utils";
import Skeleton from "../components/ui/Skeleton";
import { Helmet } from "react-helmet-async";

// Import New Dashboard Components
import DashboardStats from "../components/dashboard/DashboardStats";
import QuickActions from "../components/dashboard/QuickActions";
import ActiveMeetings from "../components/dashboard/ActiveMeetings";
import RecentGroups from "../components/dashboard/RecentGroups";
import ContactsOverview from "../components/dashboard/ContactsOverview";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";
import NotificationsPanel from "../components/dashboard/NotificationsPanel";
import DashboardSummary from "../components/dashboard/DashboardSummary";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};

const groups = [
  { id: 1, name: "Developers", members: 3, status: "active", date: "2 days ago" },
  { id: 2, name: "Design Team", members: 1, status: "active", date: "1 week ago" },
  { id: 3, name: "Marketing", members: 0, status: "inactive", date: "1 month ago" },
  { id: 4, name: "Support", members: 0, status: "inactive", date: "2 months ago" },
];

const contacts = [
  { id: 1, name: "Umesh", email: "umesh@example.com", status: "online", avatar: "/avatar.png" },
  { id: 2, name: "Rahul", email: "rahul@example.com", status: "offline", avatar: "/avatar.png" },
  { id: 3, name: "Aman", email: "aman@example.com", status: "online", avatar: "/avatar.png" },
];



// Dummy data for new sections
const DUMMY_ACTIVITIES = [
  { type: "meeting_start", title: "Meeting Started", desc: "You joined 'Spanish Practice'", time: "10 mins ago" },
  { type: "contact", title: "Contact Added", desc: "You added 'Aman' to contacts", time: "2 hours ago" },
  { type: "group", title: "Group Created", desc: "You created 'Design Team'", time: "Yesterday" },
  { type: "message", title: "Message Sent", desc: "Sent a message in 'Developers'", time: "2 days ago" },
];

const DUMMY_GROWTH_DATA = [
  { name: 'Mon', groups: 2, contacts: 4 }, { name: 'Tue', groups: 3, contacts: 5 },
  { name: 'Wed', groups: 5, contacts: 8 }, { name: 'Thu', groups: 6, contacts: 10 },
  { name: 'Fri', groups: 8, contacts: 12 }, { name: 'Sat', groups: 9, contacts: 15 }, { name: 'Sun', groups: 12, contacts: 18 }
];

const DUMMY_SESSION_DATA = [
  { name: 'Week 1', sessions: 10, messages: 45 }, { name: 'Week 2', sessions: 14, messages: 65 },
  { name: 'Week 3', sessions: 8, messages: 30 }, { name: 'Week 4', sessions: 18, messages: 90 }
];

const DUMMY_NOTIFS = [
  { type: "meeting", title: "Meeting Reminder", desc: "Design Sync starts in 15 mins", time: "15 mins ago", read: false },
  { type: "group", title: "Group Update", desc: "Developers group name changed", time: "2 hours ago", read: false },
  { type: "system", title: "System Update", desc: "New dashboard features added", time: "1 day ago", read: true },
];

const HomePage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) return;
    
    const handleActiveMeetingsUpdate = () => {
      queryClient.invalidateQueries(["activeMeetings"]);
    };

    socket.on("active_meetings_updated", handleActiveMeetingsUpdate);
    return () => socket.off("active_meetings_updated", handleActiveMeetingsUpdate);
  }, [socket, queryClient]);

  const deleteGroupMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(["groups"]);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries(["contacts"]);
    },
  });

  const handleDeleteGroup = (groupId) => {
    if(window.confirm("Are you sure you want to delete this group?")) {
      deleteGroupMutation.mutate(groupId);
    }
  };

  const handleDeleteContact = (contactId) => {
    if(window.confirm("Are you sure you want to delete this contact?")) {
      deleteContactMutation.mutate(contactId);
    }
  };

  const { data: groupsData = [], isLoading: isGroupsLoading } = useQuery({
    queryKey: ["groups", { includeDeleted: true }],
    queryFn: () => getAllGroups({ includeDeleted: true })
  });

  const { data: contactsData = [], isLoading: isContactsLoading } = useQuery({
    queryKey: ["contacts", { includeDeleted: true }],
    queryFn: () => getAllContacts({ includeDeleted: true })
  });

  const { data: sessionsData = [], isLoading: isSessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: getAllSessions
  });

  const { data: scheduledMeetingsData = [], isLoading: isScheduledLoading } = useQuery({
    queryKey: ["scheduledMeetings"],
    queryFn: getScheduledMeetings
  });

  const { data: activeMeetingsData = [], isLoading: isActiveMeetingsLoading } = useQuery({
    queryKey: ["activeMeetings"],
    queryFn: getAllActiveGroupMeetings,
    refetchInterval: 10000, // Poll every 10 seconds to keep UI synced with meeting status
  });

  console.log("activeMeetingsData",activeMeetingsData);


  const upcomingMeetings = scheduledMeetingsData.filter(m => new Date(m.scheduledAt) > new Date() && m.status !== "completed");
  const todayMeetings = upcomingMeetings.filter(m => new Date(m.scheduledAt).toDateString() === new Date().toDateString());

  const stats = {
    totalGroups: groupsData.filter?.(group => !group.isDeleted).length || 0,
    totalContacts: contactsData.filter?.(contact => !contact.isDeleted).length || 0,
    activeGroups: groupsData.filter?.(group => !group.isDeleted && (group.status === "active" || group.isActive === true)).length || 0,
    inactiveGroups: groupsData.filter?.(group => !group.isDeleted && (group.status === "inactive" || group.isActive === false)).length || 0,
    totalSessions: sessionsData.length || 0,
    deletedGroups: groupsData.filter?.(group => group.isDeleted === true || group.deleted === true).length || 0,
    deletedContacts: contactsData.filter?.(contact => contact.isDeleted === true || contact.deleted === true).length || 0,
    upcomingMeetings: upcomingMeetings.length,
    todayMeetings: todayMeetings.length,
    totalMessages: 0, // TODO: Connect messages API
  };

  const summary = {
    groups: groupsData.filter?.(group => !group.isDeleted).length || 0,
    contacts: contactsData.filter?.(contact => !contact.isDeleted).length || 0,
    sessions: sessionsData.length || 0,
    messages: 0 // TODO: Connect messages API
  };

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <Helmet>
        <title>Dashboard | MeetFlow</title>
      </Helmet>

      <div className="flex">
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10 max-w-8xl mx-auto w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 sm:space-y-10"
          >
            {/* EXACT PRESERVED HERO SECTION FROM USER CODE (MINUS THE STATS CARDS WHICH ARE NOW DashboardStats) */}
            <motion.section
              variants={itemVariants}
              className="rounded-2xl border border-base-300 bg-base-100 p-2 sm:p-8 lg:p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-base-content">
                    Welcome back,{" "}
                    <span className="text-primary">
                      {authUser?.fullName?.split(" ")[0] || "User"}
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-base-content/60 mt-1">
                    Start or join meetings instantly
                  </p>
                </div>

                <button
                  onClick={() => navigate("/meeting/schedule")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-base-content/70 bg-base-100 border border-base-300 rounded-xl hover:bg-base-200 transition-all duration-200"
                >
                  <CalendarIcon className="size-4" />
                  Schedule
                </button>
              </div>
            </motion.section>

            {/* NEW DASHBOARD SECTIONS */}
            <motion.div variants={itemVariants}>
              <DashboardStats stats={stats} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <QuickActions navigate={navigate} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <ActiveMeetings meetings={activeMeetingsData} />
                </motion.div>
              <motion.div variants={itemVariants} className="lg:col-span-1">
                <ActivityTimeline activities={DUMMY_ACTIVITIES} />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <RecentGroups groups={groupsData.filter(g => !g.isDeleted)} onDelete={handleDeleteGroup} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <ContactsOverview contacts={contactsData.filter(c => !c.isDeleted)} onDelete={handleDeleteContact} />
              </motion.div>
            </div>

            {/* <motion.div variants={itemVariants}>
              <AnalyticsCharts growthData={DUMMY_GROWTH_DATA} sessionData={DUMMY_SESSION_DATA} />
            </motion.div> */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div variants={itemVariants} className="lg:col-span-1">
                <NotificationsPanel notifications={DUMMY_NOTIFS} />
              </motion.div>
              {/* <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col justify-end">
                <DashboardSummary summary={summary} />
              </motion.div> */}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
