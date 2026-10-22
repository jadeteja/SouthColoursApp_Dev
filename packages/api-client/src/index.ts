import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

let authToken: string | null = null;
let onTokenExpiredCallback: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setOnTokenExpired = (callback: () => void) => {
  onTokenExpiredCallback = callback;
};

export const createApiClient = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (authToken && config.headers) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        if (onTokenExpiredCallback) {
          onTokenExpiredCallback();
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default createApiClient;
