import axios from 'axios';

const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

const api = axios.create({
  baseURL: apiOrigin ? `${apiOrigin}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('learnova_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized and not already on login/register/landing
      const currentPath = window.location.pathname;
      if (!['/', '/login', '/register'].includes(currentPath)) {
        localStorage.removeItem('learnova_token');
        localStorage.removeItem('learnova_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
