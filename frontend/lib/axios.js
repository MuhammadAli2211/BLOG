import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://blog-eight-mauve-61.vercel.app/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = token;
    // Agar backend Bearer expect karta hai to:
    // config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;