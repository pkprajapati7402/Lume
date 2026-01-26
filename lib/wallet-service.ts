/**
 * Wallet Service - Multi-wallet support for Lume
 * Supports Freighter (desktop & mobile), Albedo, and WalletConnect
 */

import { 
  StellarWalletsKit, 
  WalletNetwork, 
  allowAllModules,
  FREIGHTER_ID,
  XBULL_ID,
} from '@creit.tech/stellar-wallets-kit';
import type { NetworkType } from '@/app/store/authStore';

// Singleton instance
let kitInstance: StellarWalletsKit | null = null;

/**
 * Initialize the Stellar Wallets Kit
 */
export function initWalletKit(network: NetworkType): StellarWalletsKit {
  if (kitInstance) {
    return kitInstance;
  }

  const walletNetwork = network === 'mainnet' 
    ? WalletNetwork.PUBLIC 
    : WalletNetwork.TESTNET;

  kitInstance = new StellarWalletsKit({
    network: walletNetwork,
    selectedWalletId: FREIGHTER_ID, // Default to Freighter
    modules: allowAllModules(), // Enable all wallet types including WalletConnect
  });

  return kitInstance;
}

/**
 * Get list of available (installed) wallets
 */
export async function getAvailableWallets(network: NetworkType): Promise<any[]> {
  const kit = getWalletKit(network);
  
  // Get the supported wallets from the kit
  const supportedWallets = await kit.getSupportedWallets();
  
  // Filter to only show installed/available wallets
  const availableWallets = supportedWallets.filter((wallet: any) => {
    // Check if wallet is actually installed
    if (wallet.id === FREIGHTER_ID) {
      return !!(window as any).freighter;
    }
    if (wallet.id === XBULL_ID) {
      return !!(window as any).xBullSDK;
    }
    // WalletConnect and Albedo are always available (web-based)
    if (wallet.id === 'walletconnect' || wallet.id === 'albedo') {
      return true;
    }
    return wallet.isAvailable;
  });
  
  return availableWallets;
}

/**
 * Get or initialize the wallet kit instance
 */
export function getWalletKit(network: NetworkType): StellarWalletsKit {
  if (!kitInstance) {
    return initWalletKit(network);
  }
  return kitInstance;
}

/**
 * Detect if user is on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'mobile'];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
}

/**
 * Connect wallet - handles both desktop and mobile flows
 */
export async function connectWallet(network: NetworkType): Promise<{
  success: boolean;
  publicKey?: string;
  error?: string;
}> {
  try {
    const kit = getWalletKit(network);
    const isMobile = isMobileDevice();

    // Get available wallets first
    const availableWallets = await getAvailableWallets(network);
    
    if (availableWallets.length === 0) {
      return {
        success: false,
        error: 'No wallet detected. Please install a Stellar wallet (Freighter recommended).',
      };
    }

    // On mobile, always open the modal to let user choose WalletConnect
    // This enables deep-linking to mobile wallet apps like Freighter
    if (isMobile) {
      // The openModal will show only available wallet options
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
        },
        modalTitle: 'Connect Wallet',
        notAvailableText: 'Not installed',
      });
    } else {
      // On desktop, check if only one wallet is available
      if (availableWallets.length === 1) {
        // Auto-select the only available wallet
        kit.setWallet(availableWallets[0].id);
      } else {
        // Multiple wallets available, let user choose
        await kit.openModal({
          onWalletSelected: async (option) => {
            kit.setWallet(option.id);
          },
          modalTitle: 'Connect Wallet',
          notAvailableText: 'Not installed',
        });
      }
    }

    // Get public key from connected wallet
    const { address } = await kit.getAddress();

    if (!address) {
      return {
        success: false,
        error: 'Failed to retrieve wallet address',
      };
    }

    return {
      success: true,
      publicKey: address,
    };
  } catch (error: any) {
    console.error('Wallet connection error:', error);
    
    // Handle user rejection
    if (error.message?.includes('User rejected') || error.message?.includes('closed') || error.message?.includes('cancelled')) {
      return {
        success: false,
        error: 'Connection cancelled by user',
      };
    }

    // Handle network errors
    if (error.message?.includes('Network Error') || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'Network connection failed. Please check your internet connection and try again.',
      };
    }

    // Handle timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      return {
        success: false,
        error: 'Connection timeout. The network may be slow or unavailable.',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to connect wallet',
    };
  }
}

/**
 * Sign a transaction with the connected wallet
 */
export async function signTransactionWithKit(
  xdr: string,
  network: NetworkType
): Promise<{
  success: boolean;
  signedXdr?: string;
  error?: string;
}> {
  try {
    const kit = getWalletKit(network);
    
    // Sign the transaction
    const { signedTxXdr } = await kit.signTransaction(xdr);

    if (!signedTxXdr) {
      return {
        success: false,
        error: 'Failed to sign transaction',
      };
    }

    return {
      success: true,
      signedXdr: signedTxXdr,
    };
  } catch (error: any) {
    console.error('Transaction signing error:', error);

    // Handle user rejection
    if (error.message?.includes('User rejected') || error.message?.includes('User cancelled') || error.message?.includes('cancelled')) {
      return {
        success: false,
        error: 'Transaction rejected by user',
      };
    }

    // Handle network errors
    if (error.message?.includes('Network Error') || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'Network error during signing. Please check your connection and try again.',
      };
    }

    // Handle timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      return {
        success: false,
        error: 'Transaction signing timeout. Please try again.',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to sign transaction',
    };
  }
}

/**
 * Disconnect the current wallet
 */
export function disconnectWallet(): void {
  if (kitInstance) {
    // Reset the kit instance
    kitInstance = null;
  }
}

/**
 * Check if wallet is installed (for desktop)
 */
export function isWalletInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Freighter extension
  return !!(window as any).freighter;
}

/**
 * Get friendly wallet name
 */
export function getWalletName(walletId: string): string {
  const walletNames: Record<string, string> = {
    [FREIGHTER_ID]: 'Freighter',
    [XBULL_ID]: 'xBull',
    'walletconnect': 'WalletConnect',
    'albedo': 'Albedo',
  };
  
  return walletNames[walletId] || 'Wallet';
}

/**
 * Update network for existing wallet connection
 */
export async function updateNetwork(network: NetworkType): Promise<void> {
  if (kitInstance) {
    // Need to recreate the kit instance with new network
    disconnectWallet();
    initWalletKit(network);
  }
}
