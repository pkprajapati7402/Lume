/**
 * Escrow Types for 2-of-3 Multisig Escrow System
 */

// Escrow order status enum
export type EscrowStatus = 'CREATED' | 'FUNDED' | 'LOCKED' | 'RELEASED' | 'REFUNDED';

// Main escrow order interface
export interface EscrowOrder {
    id: string;                     // Order/Product ID (e.g., PROD-001)
    seller_wallet: string;          // Seller's Stellar public key
    buyer_wallet: string | null;    // Buyer's Stellar public key (null until funded)
    escrow_public_key: string;      // Escrow vault Stellar public key
    amount: number;                 // Amount in asset units
    asset_code: string;             // Asset code (e.g., USDC, XLM)
    status: EscrowStatus;           // Current order status
    fund_tx_hash: string | null;    // Transaction hash when buyer funded
    release_tx_hash: string | null; // Transaction hash when funds released
    created_at: string;             // ISO timestamp
    updated_at: string;             // ISO timestamp
}

// Database row with secret key (server-side only)
export interface EscrowOrderWithSecret extends EscrowOrder {
    escrow_secret_key: string;      // Escrow vault secret key (NEVER send to client)
}

// Create order request
export interface CreateEscrowOrderRequest {
    sellerWallet: string;
    amount: number;
    orderId: string;
    assetCode?: string;  // Defaults to USDC
}

// Create order response
export interface CreateEscrowOrderResponse {
    success: boolean;
    orderId?: string;
    escrowPublicKey?: string;
    error?: string;
}

// Lock escrow request
export interface LockEscrowRequest {
    orderId: string;
    buyerWallet: string;
    fundTxHash: string;
}

// Lock escrow response
export interface LockEscrowResponse {
    success: boolean;
    error?: string;
}

// Build release transaction response
export interface BuildReleaseTransactionResponse {
    success: boolean;
    xdr?: string;           // Unsigned transaction XDR
    error?: string;
}

// Finalize escrow request
export interface FinalizeEscrowRequest {
    orderId: string;
    signedXdrFromBuyer: string;
}

// Finalize escrow response
export interface FinalizeEscrowResponse {
    success: boolean;
    txHash?: string;
    error?: string;
}

// Get order response
export interface GetEscrowOrderResponse {
    success: boolean;
    order?: EscrowOrder;
    error?: string;
}

// Get orders list response
export interface GetEscrowOrdersResponse {
    success: boolean;
    orders?: EscrowOrder[];
    error?: string;
}

// Escrow store state
export interface EscrowStoreState {
    sellerOrders: EscrowOrder[];
    buyerOrders: EscrowOrder[];
    currentOrder: EscrowOrder | null;
    isLoading: boolean;
    searchOrderId: string;
}

// Escrow store actions
export interface EscrowStoreActions {
    setSellerOrders: (orders: EscrowOrder[]) => void;
    setBuyerOrders: (orders: EscrowOrder[]) => void;
    setCurrentOrder: (order: EscrowOrder | null) => void;
    setIsLoading: (loading: boolean) => void;
    setSearchOrderId: (orderId: string) => void;
    clearState: () => void;
}

// Combined store type
export type EscrowStore = EscrowStoreState & EscrowStoreActions;

// Status configuration for UI
export interface StatusConfig {
    icon: React.ReactNode;
    color: string;
    bg: string;
    text?: string;
}

// Multisig signer weights
export const ESCROW_SIGNER_WEIGHTS = {
    BUYER: 1,
    SELLER: 1,
    ADMIN: 1,
    THRESHOLD: 2,  // 2-of-3 required
} as const;

// Admin public key (should be from env in production)
export const ADMIN_PUBLIC_KEY = process.env.NEXT_PUBLIC_ESCROW_ADMIN_PUBLIC_KEY || '';
