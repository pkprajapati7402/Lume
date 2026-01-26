'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Smartphone, Monitor, Info, ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
  isConnecting: boolean;
  isMobile: boolean;
}

export default function WalletConnectionModal({
  isOpen,
  onClose,
  onConnect,
  isConnecting,
  isMobile,
}: WalletConnectionModalProps) {
  const [showMobileHelp, setShowMobileHelp] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-slate-700 p-6">
              <button
                onClick={onClose}
                disabled={isConnecting}
                className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600/20 rounded-xl">
                  <Wallet className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
                  <p className="text-sm text-slate-400">
                    {isMobile ? 'Connect via mobile app' : 'Connect your Stellar wallet'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Connection Status */}
              {isConnecting ? (
                <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-6 text-center">
                  <Loader2 className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-spin" />
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {isMobile ? 'Opening Wallet App...' : 'Awaiting Connection...'}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {isMobile 
                      ? 'Please approve the connection in your mobile wallet app'
                      : 'Please approve the connection request in your wallet extension'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Device Info */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                    {isMobile ? (
                      <>
                        <Smartphone className="w-5 h-5 text-cyan-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Mobile Device Detected</p>
                          <p className="text-xs text-slate-400">Using WalletConnect protocol</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Monitor className="w-5 h-5 text-purple-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Desktop Browser</p>
                          <p className="text-xs text-slate-400">Using browser extension</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile Help Section */}
                  {isMobile && (
                    <div className="bg-cyan-600/10 border border-cyan-500/30 rounded-xl p-4">
                      <button
                        onClick={() => setShowMobileHelp(!showMobileHelp)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-medium text-cyan-300">Mobile Setup Guide</span>
                        </div>
                        <motion.div
                          animate={{ rotate: showMobileHelp ? 180 : 0 }}
                          className="text-cyan-400"
                        >
                          ▼
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {showMobileHelp && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 space-y-3 text-sm text-slate-300"
                          >
                            <div className="pl-6 space-y-2">
                              <p className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold">1.</span>
                                <span>Download the <strong className="text-white">Freighter Wallet</strong> app from your app store</span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold">2.</span>
                                <span>Create or import your Stellar account</span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold">3.</span>
                                <span>Click "Connect Wallet" below to open the app</span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold">4.</span>
                                <span>Approve the connection in Freighter</span>
                              </p>
                            </div>

                            <a
                              href="https://www.freighter.app/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mt-3"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Download Freighter Wallet</span>
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Desktop Help Section */}
                  {!isMobile && (
                    <div className="text-sm text-slate-400 space-y-2">
                      <p className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>Make sure you have <strong className="text-white">Freighter</strong> or another Stellar wallet installed</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>A connection request will appear in your wallet extension</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>Approve the request to connect to Lume</span>
                      </p>
                    </div>
                  )}

                  {/* Connect Button */}
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 
                             hover:to-purple-700 text-white rounded-xl font-semibold flex items-center justify-center 
                             gap-2 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </button>

                  {/* Footer Note */}
                  <div className="text-center text-xs text-slate-500 space-y-1">
                    <p>Your wallet stays secure. Lume never stores your private keys.</p>
                    {!isMobile && (
                      <a
                        href="https://www.freighter.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                      >
                        Don't have a wallet? Get Freighter
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
