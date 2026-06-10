import { create } from "zustand";
import { Tables } from "@/lib/supabase";

type Notification = Tables["notifications"];

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  isLoading: false,

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));

export const selectNotifications = (s: NotificationState) => s.notifications;
export const selectUnreadCount = (s: NotificationState) =>
  s.notifications.filter((n) => !n.is_read).length;
