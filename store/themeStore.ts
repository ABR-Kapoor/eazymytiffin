import { create } from "zustand";

interface ThemeState {
  isVegTheme: boolean;
  setVegTheme: (isVeg: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isVegTheme: false,
  setVegTheme: (isVegTheme) => set({ isVegTheme }),
}));
