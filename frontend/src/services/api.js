import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-handle 401 unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking initial auth /login/register
      const isAuthUrl = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
