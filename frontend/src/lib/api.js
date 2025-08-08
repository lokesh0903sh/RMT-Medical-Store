// api.js - A central utility for making API calls with axios

import axios from 'axios';

// Create a base axios instance with common configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Add both authorization formats for compatibility
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    
    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally here
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;
