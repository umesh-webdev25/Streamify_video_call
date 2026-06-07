import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import ResetPasswordPage from "./pages/ResetPassword.jsx";
import VerifyResetOtpPage from "./pages/VerifyResetOtp.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import MeetingLobbyPage from "./pages/MeetingLobbyPage.jsx";
import MeetingRoomPage from "./pages/MeetingRoomPage.jsx";
import MeetingSchedulePage from "./pages/MeetingSchedulePage.jsx";
import History from "./pages/History.jsx";
import Group from "./pages/Group.jsx";
import MyGroupsPage from "./pages/MyGroupsPage.jsx";
import GroupContacts from "./pages/GroupContacts.jsx";
import VerifyOTPPage from "./pages/VerifyOTPPage.jsx";
import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import ScheduleMeetingPage from "./pages/scheduleMeeting.jsx";
import { useSocketStore } from "./store/useSocketStore.js";
import { useNotificationStore } from "./store/useNotificationStore.js";
import { useEffect } from "react";
import toast from "react-hot-toast";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const { connect, disconnect, socket } = useSocketStore();
  const { fetchUnreadCount, addNotification } = useNotificationStore();
  const location = useLocation();

  const isAuthenticated = Boolean(authUser);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
      fetchUnreadCount();
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect, fetchUnreadCount]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (notification) => {
      addNotification(notification);
      toast.success(notification.title || "New Notification");
    };

    socket.on("new_notification", handleNewNotification);
    return () => socket.off("new_notification", handleNewNotification);
  }, [socket, addNotification]);

  if (isLoading) return <PageLoader />;

  const displayTheme = isAuthenticated ? theme : "MeetFlow-pro";

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      data-theme={displayTheme}
    >
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ONBOARDING ROUTE */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              {authUser?.isOnboarded ? (
                <Navigate to="/" replace />
              ) : (
                <OnboardingPage />
              )}
            </ProtectedRoute>
          }
        />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/notifications"
            element={
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            }
          />
          <Route
            path="/friends"
            element={
              <Layout showSidebar={true}>
                <FriendsPage />
              </Layout>
            }
          />

          <Route
            path="/groups/:groupId"
            element={
              <Layout showSidebar={true}>
                <GroupContacts />
              </Layout>
            }
          />
          <Route
            path="/my-groups"
            element={
              <Layout showSidebar={true}>
                <MyGroupsPage />
              </Layout>
            }
          />
          <Route
            path="/group"
            element={
              <Layout showSidebar={true}>
                <Group />
              </Layout>
            }
          />

          <Route
            path="/schedule-meeting"
            element={
              <Layout showSidebar={true}>
                <ScheduleMeetingPage />
              </Layout>
            }
          />

          <Route
            path="/history"
            element={
              <Layout showSidebar={true}>
                <History />
              </Layout>
            }
          />

          <Route
            path="/settings"
            element={
              <Layout showSidebar={true}>
                <SettingsPage />
              </Layout>
            }
          />

          <Route
            path="/chat/:id"
            element={
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            }
          />
          <Route path="/call/:id" element={<CallPage />} />
          <Route path="/meeting/lobby" element={<MeetingLobbyPage />} />
          <Route path="/meeting/room/:roomId" element={<MeetingRoomPage />} />
          <Route path="/meeting/schedule" element={<MeetingSchedulePage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-center" />
    </div>
  );
};

export default App;
