import { create } from 'zustand';
import { User } from '../types';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isSignedIn: false,

  setUser: (user) => set({ user, isSignedIn: true }),

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, isSignedIn: false });
  },

  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        set({ isSignedIn: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },
}));
