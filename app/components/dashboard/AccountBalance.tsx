'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import * as StellarSDK from '@stellar/stellar-sdk';
import { useAuthStore } from '../../store/authStore';

interface Balance {
  assetCode: string;
  assetIssuer?: string;
  balance: string;
  assetType: string;
}

export default function AccountBalance() {
  const { publicKey, network } = useAuthStore();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBalances = async () => {
    if (!publicKey) {
      setError('No wallet connected');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const horizonUrl = network === 'testnet' 
        ? 'https://horizon-testnet.stellar.org' 
        : 'https://horizon.stellar.org';
      const server = new StellarSDK.Horizon.Server(horizonUrl);

      // Load account data
      const account = await server.loadAccount(publicKey);

      // Process balances
      const accountBalances: Balance[] = account.balances.map((balance: any) => {
        if (balance.asset_type === 'native') {
          return {
            assetCode: 'XLM',
            balance: parseFloat(balance.balance).toFixed(7),
            assetType: 'native',
          };
        } else {
          return {
            assetCode: balance.asset_code,
            assetIssuer: balance.asset_issuer,
            balance: parseFloat(balance.balance).toFixed(4),
            assetType: balance.asset_type,
          };
        }
      });

      setBalances(accountBalances);
      setLastUpdated(new Date());
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('Account not funded yet. Fund your testnet account to see balances.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch balances');
      }
      console.error('Balance fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBalances();
    }, 30000);

    return () => clearInterval(interval);
  }, [publicKey, network]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Account Balance</h3>
            <p className="text-slate-400 text-sm capitalize">{network} Assets</p>
          </div>
        </div>

        <button
          onClick={fetchBalances}
          disabled={isLoading}
          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw
            className={`w-4 h-4 text-slate-300 ${isLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      ) : balances.length > 0 ? (
        <div className="space-y-3">
          {balances.map((balance, index) => (
            <motion.div
              key={`${balance.assetCode}-${balance.assetIssuer || 'native'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    balance.assetType === 'native' 
                      ? 'bg-gradient-to-br from-blue-400 to-cyan-500' 
                      : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                  }`}>
                    <span className="text-white font-bold text-sm">
                      {balance.assetCode.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {balance.assetCode}
                    </div>
                    {balance.assetIssuer && (
                      <div className="text-xs text-slate-500 font-mono">
                        {balance.assetIssuer.substring(0, 8)}...{balance.assetIssuer.substring(balance.assetIssuer.length - 4)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {parseFloat(balance.balance).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: balance.assetType === 'native' ? 7 : 4,
                    })}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3" />
                    Available
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-xs text-slate-500 text-center pt-2">
              Updated {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-slate-500">Loading balances...</div>
        </div>
      )}
    </motion.div>
  );
}
