import { create } from "zustand";
import { Tables } from "@/lib/supabase";

type FoodOrder = Tables["food_orders"];
type DeliveryAssignment = Tables["delivery_assignments"];

const ACTIVE_STATUSES = new Set(["preparing", "assigned", "out_for_delivery"]);
const PENDING_STATUSES = new Set(["pending", "preparing", "assigned", "out_for_delivery"]);

interface OrderState {
  orders: FoodOrder[];
  activeDelivery: DeliveryAssignment | null;
  isLoading: boolean;
  setOrders: (orders: FoodOrder[]) => void;
  upsertOrder: (order: FoodOrder) => void;
  setActiveDelivery: (delivery: DeliveryAssignment | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeDelivery: null,
  isLoading: true,

  setOrders: (orders) => set({ orders }),
  setLoading: (isLoading) => set({ isLoading }),
  setActiveDelivery: (activeDelivery) => set({ activeDelivery }),

  upsertOrder: (updated) =>
    set((state) => {
      const exists = state.orders.find((o) => o.id === updated.id);
      if (exists) {
        return {
          orders: state.orders.map((o) => (o.id === updated.id ? updated : o)),
        };
      }
      return { orders: [updated, ...state.orders] };
    }),
}));

export const selectOrders = (s: OrderState) => s.orders;
export const selectActiveDelivery = (s: OrderState) => s.activeDelivery;
export const selectOrderLoading = (s: OrderState) => s.isLoading;
export const selectLatestOrder = (s: OrderState) => s.orders[0] || null;
export const selectActiveOrder = (s: OrderState) =>
  s.orders.find((o) => ACTIVE_STATUSES.has(o.status)) || null;
export const selectPendingOrders = (s: OrderState) =>
  s.orders.filter((o) => PENDING_STATUSES.has(o.status));
