import { create } from 'zustand';
import { authApi, usersApi, User } from '../api';
import { tokenStorage } from '../lib/storage';

interface AuthState {
  user: User | null;
  status: 'loading' | 'authed' | 'guest';
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  bootstrap: async () => {
    const token = await tokenStorage.getAccess();
    if (!token) {
      set({ status: 'guest' });
      return;
    }
    try {
      const user = await usersApi.me();
      set({ user, status: 'authed' });
    } catch {
      await tokenStorage.clear();
      set({ status: 'guest', user: null });
    }
  },

  login: async (email, password) => {
    const res = await authApi.login(email, password);
    await tokenStorage.save(res.accessToken, res.refreshToken);
    set({ user: res.user, status: 'authed' });
  },

  register: async (email, name, password) => {
    const res = await authApi.register(email, name, password);
    await tokenStorage.save(res.accessToken, res.refreshToken);
    set({ user: res.user, status: 'authed' });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    await tokenStorage.clear();
    set({ user: null, status: 'guest' });
  },

  setUser: (u) => set({ user: u }),
}));
