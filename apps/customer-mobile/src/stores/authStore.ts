import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '@southcolours/types';
import { setAuthToken } from '@southcolours/api-client';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: true,

  setAuth: async (user, token, refreshToken) => {
    setAuthToken(token);
    await SecureStore.setItemAsync('sc_token', token);
    await SecureStore.setItemAsync('sc_refresh_token', refreshToken);
    await SecureStore.setItemAsync('sc_user', JSON.stringify(user));
    set({ user, token, refreshToken, isLoading: false });
  },

  logout: async () => {
    setAuthToken(null);
    await SecureStore.deleteItemAsync('sc_token');
    await SecureStore.deleteItemAsync('sc_refresh_token');
    await SecureStore.deleteItemAsync('sc_user');
    set({ user: null, token: null, refreshToken: null, isLoading: false });
  },

  loadStoredSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('sc_token');
      const refreshToken = await SecureStore.getItemAsync('sc_refresh_token');
      const userStr = await SecureStore.getItemAsync('sc_user');

      if (token && userStr) {
        setAuthToken(token);
        set({ user: JSON.parse(userStr), token, refreshToken, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
