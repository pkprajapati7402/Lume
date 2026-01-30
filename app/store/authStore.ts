import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type NetworkType = 'testnet' | 'mainnet';

interface AuthState {
  isAuthorized: boolean;
  publicKey: string | null;
  network: NetworkType;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
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
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setAuthorized: (publicKey: string) => set({ isAuthorized: true, publicKey }),
      setGuest: () => set({ isAuthorized: false, publicKey: null }),
      setNetwork: (network: NetworkType) => set({ network }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
