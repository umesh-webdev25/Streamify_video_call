import { create } from "zustand";
import { io } from "socket.io-client";

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    if (get().socket) return;
    const socketURL = import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:5001";
    
    const socket = io(socketURL, {
      withCredentials: true, // Important for sending cookies/jwt
    });

    socket.on("connect", () => {
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
}));
