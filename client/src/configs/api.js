import axios from 'axios';

const api = axios.create({
  // In development, use VITE_BASE_URL=http://localhost:3000.
  // In production, leave VITE_BASE_URL empty so requests go to the same Render service.
  baseURL: import.meta.env.VITE_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3000' : ''),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

export default api;
