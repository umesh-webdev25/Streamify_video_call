import axios from "axios";

const BASE_URL =
  // Prefer explicit Vite env var when provided (useful for custom ports)
  import.meta.env.VITE_API_BASE_URL ??
  // Backend default port is 5001 (see backend/.env)
  (import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api");

// Export base URL for use in image URLs
export const API_BASE_URL = BASE_URL;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const message = error.response.data?.message || "";
      // Avoid redirecting for verification errors, onboarding, or similar checks
      if (!message.includes("Email not verified") && !message.includes("Please verify your email")) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);