import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthorized: boolean;
  publicKey: string | null;
  setAuthorized: (publicKey: string) => void;
  setGuest: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthorized: false,
      publicKey: null,
      setAuthorized: (publicKey: string) => set({ isAuthorized: true, publicKey }),
      setGuest: () => set({ isAuthorized: false, publicKey: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
