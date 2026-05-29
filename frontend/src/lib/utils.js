import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  
  const baseUrl = import.meta.env.MODE === "development" ? "http://localhost:5001" : "";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};
