import { create } from "zustand";

export interface CartItem {
  menu_id: string;
  title: string;
  price: number;
  quantity: number;
  category: "veg" | "non_veg";
  image_url: string | null;
  badge: string | null;
}

interface CartState {
  items: CartItem[];
  timeSlot: "lunch" | "dinner" | null;
  addressId: string | null;
  paymentMethod: "phonepe" | "cod" | null;
  // Setters
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (menu_id: string) => void;
  updateQty: (menu_id: string, quantity: number) => void;
  clearCart: () => void;
  setTimeSlot: (slot: "lunch" | "dinner") => void;
  setAddressId: (id: string) => void;
  setPaymentMethod: (method: "phonepe" | "cod") => void;
  // Computed
  total: () => number;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  timeSlot: null,
  addressId: null,
  paymentMethod: null,

  addItem: (newItem) =>
    set((state) => {
      const existing = state.items.find((i) => i.menu_id === newItem.menu_id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menu_id === newItem.menu_id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...newItem, quantity: 1 }] };
    }),

  removeItem: (menu_id) =>
    set((state) => ({ items: state.items.filter((i) => i.menu_id !== menu_id) })),

  updateQty: (menu_id, quantity) =>
    set((state) => {
      if (quantity <= 0) return { items: state.items.filter((i) => i.menu_id !== menu_id) };
      return {
        items: state.items.map((i) => (i.menu_id === menu_id ? { ...i, quantity } : i)),
      };
    }),

  clearCart: () => set({ items: [], timeSlot: null, addressId: null, paymentMethod: null }),
  setTimeSlot: (timeSlot) => set({ timeSlot }),
  setAddressId: (addressId) => set({ addressId }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
