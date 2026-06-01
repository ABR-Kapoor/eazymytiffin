import { create } from "zustand";
import { Tables } from "@/lib/supabase";

type User = Tables["users"];

interface UserState {
  user: User | null;
  isLoading: boolean;
  // Computed
  isAdmin: () => boolean;
  isDeliveryBoy: () => boolean;
  isBlocked: () => boolean;
  canUseTrial: () => boolean;
  // Setters
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,

  isAdmin: () => get().user?.role === "admin",
  isDeliveryBoy: () => get().user?.role === "delivery_boy",
  isBlocked: () => get().user?.status === "blocked",
  canUseTrial: () => !get().user?.has_used_trial,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null }),
}));
