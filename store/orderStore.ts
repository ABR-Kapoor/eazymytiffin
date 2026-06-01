import { create } from "zustand";
import { Tables } from "@/lib/supabase";

type FoodOrder = Tables["food_orders"];
type DeliveryAssignment = Tables["delivery_assignments"];

interface OrderState {
  orders: FoodOrder[];
  activeDelivery: DeliveryAssignment | null;
  isLoading: boolean;
  // Setters
  setOrders: (orders: FoodOrder[]) => void;
  upsertOrder: (order: FoodOrder) => void;
  setActiveDelivery: (delivery: DeliveryAssignment | null) => void;
  setLoading: (loading: boolean) => void;
  // Computed
  getLatestOrder: () => FoodOrder | null;
  getPendingOrders: () => FoodOrder[];
  getActiveOrder: () => FoodOrder | null;
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

  getLatestOrder: () => get().orders[0] || null,

  getPendingOrders: () =>
    get().orders.filter((o) =>
      ["pending", "preparing", "assigned", "out_for_delivery"].includes(o.status)
    ),

  getActiveOrder: () =>
    get().orders.find((o) =>
      ["preparing", "assigned", "out_for_delivery"].includes(o.status)
    ) || null,
}));
