import axios from "axios";

const API = axios.create({
  // ✅ LIVE BACKEND URL (Agar Vite env variable na mile toh fallback live backend use hoga)
  baseURL: import.meta.env.VITE_API_URL || "https://blog-1j3t-git-main-muhammad-ali2211.vercel.app/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

export default API;