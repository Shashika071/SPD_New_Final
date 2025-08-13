// src/utils/api.js

import axios from 'axios';

// Function to get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create Axios instance
export const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include token dynamically
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
