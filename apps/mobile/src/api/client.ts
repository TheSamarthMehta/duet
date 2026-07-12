import axios from 'axios';
import { API_BASE } from '../config/env';
import { tokenStorage } from '../lib/storage';

export const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

let onAuthFail: (() => void) | null = null;
export const setAuthFailHandler = (fn: () => void) => {
  onAuthFail = fn;
};

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !refreshing) {
      original._retry = true;
      refreshing = true;
      try {
        const refreshToken = await tokenStorage.getRefresh();
        if (!refreshToken) throw new Error('no refresh token');
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        await tokenStorage.save(data.accessToken, data.refreshToken);
        refreshing = false;
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (e) {
        refreshing = false;
        await tokenStorage.clear();
        onAuthFail?.();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);
