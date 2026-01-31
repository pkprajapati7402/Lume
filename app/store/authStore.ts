import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type NetworkType = 'testnet' | 'mainnet';
export type UserRole = 'employer' | 'employee' | null;

interface AuthState {
  isAuthorized: boolean;
  publicKey: string | null;
  network: NetworkType;
  userRole: UserRole;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuthorized: (publicKey: string) => void;
  setUserRole: (role: UserRole) => void;
  setGuest: () => void;
  setNetwork: (network: NetworkType) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthorized: false,
      publicKey: null,
      network: 'testnet',
      userRole: null,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setAuthorized: (publicKey: string) => set({ isAuthorized: true, publicKey }),
      setUserRole: (role: UserRole) => set({ userRole: role }),
      setGuest: () => set({ isAuthorized: false, publicKey: null, userRole: null }),
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
