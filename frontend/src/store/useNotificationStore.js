import { create } from "zustand";
import {
  fetchNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../lib/api";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchMyNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await fetchNotifications();
      set({ notifications: res.data || [], error: null });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch notifications" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await getUnreadNotificationCount();
      set({ unreadCount: res.data.count });
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  },

  markAsRead: async (id) => {
    try {
      await markNotificationAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllNotificationsAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
