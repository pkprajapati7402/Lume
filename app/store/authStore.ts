import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NetworkType = 'testnet' | 'mainnet';

interface AuthState {
  isAuthorized: boolean;
  publicKey: string | null;
  network: NetworkType;
  setAuthorized: (publicKey: string) => void;
  setGuest: () => void;
  setNetwork: (network: NetworkType) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthorized: false,
      publicKey: null,
      network: 'testnet',
      setAuthorized: (publicKey: string) => set({ isAuthorized: true, publicKey }),
      setGuest: () => set({ isAuthorized: false, publicKey: null }),
      setNetwork: (network: NetworkType) => set({ network }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
