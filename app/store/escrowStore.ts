import { create } from 'zustand';
import type { EscrowOrder } from '@/app/actions/escrow';

interface EscrowState {
    // Seller's orders
    sellerOrders: EscrowOrder[];
    setSellerOrders: (orders: EscrowOrder[]) => void;
    
    // Buyer's orders
    buyerOrders: EscrowOrder[];
    setBuyerOrders: (orders: EscrowOrder[]) => void;
    
    // Current order being viewed/processed
    currentOrder: EscrowOrder | null;
    setCurrentOrder: (order: EscrowOrder | null) => void;
    
    // Loading states
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    
    // Search state for marketplace
    searchOrderId: string;
    setSearchOrderId: (id: string) => void;
    
    // Clear all state
    clearState: () => void;
}

export const useEscrowStore = create<EscrowState>((set) => ({
    sellerOrders: [],
    setSellerOrders: (orders) => set({ sellerOrders: orders }),
    
    buyerOrders: [],
    setBuyerOrders: (orders) => set({ buyerOrders: orders }),
    
    currentOrder: null,
    setCurrentOrder: (order) => set({ currentOrder: order }),
    
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
    
    searchOrderId: '',
    setSearchOrderId: (id) => set({ searchOrderId: id }),
    
    clearState: () => set({
        sellerOrders: [],
        buyerOrders: [],
        currentOrder: null,
        isLoading: false,
        searchOrderId: '',
    }),
}));
