import axios from "axios";

const BASE_URL =
  // Prefer explicit Vite env var when provided (useful for custom ports)
  import.meta.env.VITE_API_BASE_URL ??
  // Backend default port is 5001 (see backend/.env)
  (import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api");

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});