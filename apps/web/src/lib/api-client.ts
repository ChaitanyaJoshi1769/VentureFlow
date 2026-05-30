import axios, { AxiosInstance } from 'axios';
import { getToken, setToken, removeToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests
  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          try {
            const { data } = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });
            setToken(data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return client(originalRequest);
          } catch {
            removeToken();
            window.location.href = '/login';
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();
