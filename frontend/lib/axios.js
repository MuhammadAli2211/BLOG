import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://blog-peach-one-17.vercel.app",
});

API.interceptors.request.use((config) => {
  // ✅ Check window to prevent Server-Side Rendering (SSR) crash
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      // ✅ Correct JWT Authorization format
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default API;