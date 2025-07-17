import axios from 'axios';
import API_URL from './config';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authorization token and handle API paths
api.interceptors.request.use(
  config => {
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ensure URLs have the /api prefix
    if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
      config.url = `/api${config.url.startsWith('/') ? config.url : `/${config.url}`}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle global errors here, such as 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Handle unauthorized - could redirect to login
      console.error('Unauthorized request');
      // Optional: localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
export default api;
