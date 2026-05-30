import { create } from "zustand";
import { Tables } from "@/lib/supabase";

type Subscription = Tables["subscriptions"];
type Plan = Tables["subscription_plans"];
type SubDay = Tables["subscription_days"];

interface SubscriptionState {
  activeSubscription: Subscription | null;
  plans: Plan[];
  subscriptionDays: SubDay[];
  isLoading: boolean;
  // Setters
  setActiveSubscription: (sub: Subscription | null) => void;
  setPlans: (plans: Plan[]) => void;
  setSubscriptionDays: (days: SubDay[]) => void;
  setLoading: (loading: boolean) => void;
  // Computed
  getRemainingProgress: () => number;
  isActive: () => boolean;
  isPaused: () => boolean;
  canPauseLunch: () => boolean;
  canPauseDinner: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  activeSubscription: null,
  plans: [],
  subscriptionDays: [],
  isLoading: true,

  setActiveSubscription: (activeSubscription) => set({ activeSubscription }),
  setPlans: (plans) => set({ plans }),
  setSubscriptionDays: (subscriptionDays) => set({ subscriptionDays }),
  setLoading: (isLoading) => set({ isLoading }),

  getRemainingProgress: () => {
    const sub = get().activeSubscription;
    if (!sub) return 0;
    return Math.round((sub.remaining_days / sub.total_days) * 100);
  },

  isActive: () => get().activeSubscription?.status === "active",
  isPaused: () => get().activeSubscription?.status === "paused",

  // Lunch cutoff: 11 AM
  canPauseLunch: () => {
    const now = new Date();
    return now.getHours() < 11;
  },

  // Dinner cutoff: 6 PM
  canPauseDinner: () => {
    const now = new Date();
    return now.getHours() < 18;
  },
}));
