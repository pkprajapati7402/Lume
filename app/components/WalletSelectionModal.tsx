'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Loader2, ExternalLink, Smartphone, Monitor, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAvailableWallets, isMobileDevice } from '@/lib/wallet-service';
import { useAuthStore } from '../store/authStore';

// Wallet info for display
const WALLET_INFO: Record<string, { 
  name: string; 
  description: string; 
  icon: string;
  color: string;
  downloadUrl?: string;
}> = {
  freighter: {
    name: 'Freighter',
    description: 'The most popular Stellar wallet extension',
    icon: '🚀',
    color: 'from-purple-500 to-indigo-600',
    downloadUrl: 'https://www.freighter.app/',
  },
  xbull: {
    name: 'xBull',
    description: 'Feature-rich Stellar wallet',
    icon: '🐂',
    color: 'from-blue-500 to-cyan-600',
    downloadUrl: 'https://xbull.app/',
  },
  albedo: {
    name: 'Albedo',
    description: 'Web-based secure wallet',
    icon: '🌟',
    color: 'from-amber-500 to-orange-600',
  },
  walletconnect: {
    name: 'WalletConnect',
    description: 'Connect via mobile wallet',
    icon: '📱',
    color: 'from-emerald-500 to-teal-600',
  },
};

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletId: string) => Promise<void>;
  selectedRole: 'employer' | 'employee';
}

export default function WalletSelectionModal({
  isOpen,
  onClose,
  onSelectWallet,
  selectedRole,
}: WalletSelectionModalProps) {
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { network } = useAuthStore();
  const isMobile = isMobileDevice();

  useEffect(() => {
    if (isOpen) {
      loadAvailableWallets();
    }
  }, [isOpen, network]);

  const loadAvailableWallets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const wallets = await getAvailableWallets(network);
      setAvailableWallets(wallets);
    } catch (err) {
      console.error('Failed to load wallets:', err);
      setError('Failed to detect available wallets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWallet = async (walletId: string) => {
    setConnectingWalletId(walletId);
    setError(null);
    try {
      await onSelectWallet(walletId);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnectingWalletId(null);
    }
  };

  const getWalletInfo = (walletId: string) => {
    return WALLET_INFO[walletId] || {
      name: walletId,
      description: 'Stellar wallet',
      icon: '💳',
      color: 'from-gray-500 to-gray-600',
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-black border border-neutral-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden my-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-cyan-600/10 border-b border-neutral-800 p-6">
              {/* Background Effects */}
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="absolute top-0 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              
              <button
                onClick={onClose}
                disabled={connectingWalletId !== null}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
              
              <div className="relative flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
                  <Wallet className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
                  <p className="text-sm text-neutral-400">
                    Choose your preferred Stellar wallet
                  </p>
                </div>
              </div>

              {/* Role Badge */}
              <div className="relative mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900/50 rounded-full border border-neutral-800">
                <div className={`w-2 h-2 rounded-full ${selectedRole === 'employer' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="text-sm text-neutral-400">
                  Connecting as <span className="text-white font-medium capitalize">{selectedRole}</span>
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Device Info */}
              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                {isMobile ? (
                  <>
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Mobile Device</p>
                      <p className="text-xs text-neutral-400">WalletConnect recommended</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Monitor className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Desktop Browser</p>
                      <p className="text-xs text-neutral-400">Browser extensions available</p>
                    </div>
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-spin" />
                  <p className="text-sm text-neutral-400">Detecting available wallets...</p>
                </div>
              ) : availableWallets.length === 0 ? (
                /* No Wallets Found */
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-neutral-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">No Wallets Found</h4>
                  <p className="text-sm text-neutral-400 mb-4">
                    Please install a Stellar wallet to continue
                  </p>
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Get Freighter Wallet
                  </a>
                </div>
              ) : (
                /* Wallet Options */
                <div className="space-y-3">
                  {availableWallets.map((wallet, index) => {
                    const info = getWalletInfo(wallet.id);
                    const isConnecting = connectingWalletId === wallet.id;
                    const isDisabled = connectingWalletId !== null;
                    
                    return (
                      <motion.button
                        key={wallet.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectWallet(wallet.id)}
                        disabled={isDisabled}
                        className={`w-full group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 
                          ${isConnecting 
                            ? 'bg-indigo-500/10 border-indigo-500/50' 
                            : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900'
                          }
                          ${isDisabled && !isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className="flex items-center gap-4">
                          {/* Wallet Icon */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-2xl`}>
                            {isConnecting ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                              info.icon
                            )}
                          </div>
                          
                          {/* Wallet Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-white">
                              {info.name}
                            </h4>
                            <p className="text-sm text-neutral-400 truncate">
                              {isConnecting ? 'Connecting...' : info.description}
                            </p>
                          </div>

                          {/* Arrow */}
                          {!isConnecting && (
                            <div className="flex-shrink-0 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                              →
                            </div>
                          )}
                        </div>

                        {/* Hover gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Help Text */}
              {!isLoading && availableWallets.length > 0 && (
                <div className="pt-2 text-center space-y-2">
                  <p className="text-xs text-neutral-500">
                    Your wallet stays secure. Lume never stores your private keys.
                  </p>
                  {!isMobile && (
                    <a
                      href="https://www.freighter.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Need a wallet? Get Freighter
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
