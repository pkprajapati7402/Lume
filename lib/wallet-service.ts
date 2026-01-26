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

    // On mobile, prefer WalletConnect flow which deep-links to mobile apps
    if (isMobile) {
      // Open wallet selection modal
      // This will show WalletConnect option which opens Freighter mobile app
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
        }
      });
    } else {
      // On desktop, try to auto-select Freighter extension
      kit.setWallet(FREIGHTER_ID);
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
    if (error.message?.includes('User rejected') || error.message?.includes('closed')) {
      return {
        success: false,
        error: 'Connection cancelled by user',
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
    if (error.message?.includes('User rejected') || error.message?.includes('User cancelled')) {
      return {
        success: false,
        error: 'Transaction rejected by user',
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
