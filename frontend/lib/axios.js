import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://blog-peach-one-17.vercel.app",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

export default API;