import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.messages?.[0] ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject({ message, status: error.response?.status });
  }
);

export const createProfile = (data) => api.post('/profiles', data);
export const getProfile = (id) => api.get(`/profiles/${id}`);

export const createApplication = (data) => api.post('/applications', data);
export const getApplication = (id) => api.get(`/applications/${id}`);
export const getDecision = (id) => api.get(`/applications/${id}/decision`);
