import { create } from "zustand";
import { Tables } from "@/lib/supabase";

type User = Tables["users"];

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null }),
}));

export const selectUser = (s: UserState) => s.user;
export const selectIsAdmin = (s: UserState) => s.user?.role === "admin";
export const selectIsDeliveryBoy = (s: UserState) => s.user?.role === "delivery_boy";
export const selectIsBlocked = (s: UserState) => s.user?.status === "blocked";
export const selectCanUseTrial = (s: UserState) => !s.user?.has_used_trial;
export const selectIsLoading = (s: UserState) => s.isLoading;
