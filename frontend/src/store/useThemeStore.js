import { create } from "zustand";

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("streamify-theme") || "streamify-pro",
  setTheme: (theme) => {
    localStorage.setItem("streamify-theme", theme);
    set({ theme });
  },
  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === "streamify-pro" ? "streamify-dark" : "streamify-pro";
    localStorage.setItem("streamify-theme", nextTheme);
    set({ theme: nextTheme });
  },
}));
