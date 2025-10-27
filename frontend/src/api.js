// src/api/api.js
import axios from "axios";

// Prefer environment-provided API base URL, otherwise fall back to local backend.
export const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optionally: Add an interceptor for debugging or adding auth tokens later
API.interceptors.request.use((config) => {
  console.log(`➡️ [API Request]: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

export default API;

