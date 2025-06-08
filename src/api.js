// src/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const response = await api.post('token/refresh/', { refresh: refreshToken });
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        api.defaults.headers.Authorization = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export const register = (data) => api.post('register/', data);
export const login = (data) => api.post('token/', data);
export const refreshToken = (refresh) => api.post('token/refresh/', { refresh });
export const getProfile = () => api.get('profile/');
export const createSurveyLink = (data) => api.post('survey-links/', data);
export const listSurveyLinks = () => api.get('survey-links/list/');
export const submitSurveyResponse = (data) => api.post('survey-response/', data);
export const getMetrics = (params) => api.get('metrics/', { params });
export const checkSurveyResponse = (signedToken) => api.get(`survey-response/check/${signedToken}/`);
export const checkMultipleSurveyResponses = (signedTokens) =>
  api.post('survey-response/check-bulk/', { signed_tokens: signedTokens });

export default api;