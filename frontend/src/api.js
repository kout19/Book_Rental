// src/api/api.js
import axios from "axios";
import Cookies from 'js-cookie';

// Prefer environment-provided API base URL, otherwise fall back to local backend.
export const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token from cookie on each request, if present
API.interceptors.request.use((config) => {
  try {
    const token = Cookies.get('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  console.log(`➡️ [API Request]: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

export default API;

