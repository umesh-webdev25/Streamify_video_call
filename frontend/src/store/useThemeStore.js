import { create } from "zustand";

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("streamify-theme") || "MeetFlow-pro",
  setTheme: (theme) => {
    localStorage.setItem("streamify-theme", theme);
    set({ theme });
  },
  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === "MeetFlow-pro" ? "MeetFlow-dark" : "MeetFlow-pro";
    localStorage.setItem("streamify-theme", nextTheme);
    set({ theme: nextTheme });
  },
}));
