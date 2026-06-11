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
  setActiveSubscription: (sub: Subscription | null) => void;
  setPlans: (plans: Plan[]) => void;
  setSubscriptionDays: (days: SubDay[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  activeSubscription: null,
  plans: [],
  subscriptionDays: [],
  isLoading: true,

  setActiveSubscription: (activeSubscription) => set({ activeSubscription }),
  setPlans: (plans) => set({ plans }),
  setSubscriptionDays: (subscriptionDays) => set({ subscriptionDays }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const selectActiveSub = (s: SubscriptionState) => s.activeSubscription;
export const selectPlans = (s: SubscriptionState) => s.plans;
export const selectSubDays = (s: SubscriptionState) => s.subscriptionDays;
export const selectSubLoading = (s: SubscriptionState) => s.isLoading;
export const selectIsSubActive = (s: SubscriptionState) => s.activeSubscription?.status === "active";
export const selectIsPaused = (s: SubscriptionState) => s.activeSubscription?.status === "paused";
export const selectRemainingProgress = (s: SubscriptionState) => {
  const sub = s.activeSubscription;
  if (!sub) return 0;
  return Math.round((sub.remaining_days / sub.total_days) * 100);
};
