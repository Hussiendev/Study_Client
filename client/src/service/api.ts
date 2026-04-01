import axios from 'axios';

// Use port 4000 instead of 3000
const API_URL = process.env.REACT_APP_API_URL; // Your backend URL on port 4000
console.log('API URL:', API_URL); // Debugging: Check the API URL being used
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CRITICAL: This sends cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Remove the token interceptor - we're using cookies now!
// Request interceptor for debugging only
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Authentication failed - cookie expired');
      // Clear user data from localStorage
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;