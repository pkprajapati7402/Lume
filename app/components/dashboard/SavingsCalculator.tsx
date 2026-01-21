'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, DollarSign, RefreshCw, Zap, PiggyBank } from 'lucide-react';
import * as StellarSDK from '@stellar/stellar-sdk';
import { useAuthStore } from '../../store/authStore';

interface TransactionData {
  totalUSDC: number;
  transactionCount: number;
  savingsVsBank: number;
  lastFetched: Date;
}

export default function SavingsCalculator() {
  const { publicKey, network } = useAuthStore();
  const [transactionData, setTransactionData] = useState<TransactionData>({
    totalUSDC: 0,
    transactionCount: 0,
    savingsVsBank: 0,
    lastFetched: new Date(),
  });
  const [displayedSavings, setDisplayedSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const BANK_WIRE_FEE_PERCENT = 5; // 5% bank wire fee
  const USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

  const animateCounter = (start: number, end: number, duration: number = 2000) => {
    const startTime = Date.now();
    const difference = end - start;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = start + difference * easeOutCubic;

      setDisplayedSavings(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animate();
  };

  const fetchTransactionHistory = async () => {
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

      // Check if account exists first
      try {
        await server.loadAccount(publicKey);
      } catch (accountError: any) {
        if (accountError?.response?.status === 404) {
          // Account not found - not yet funded
          setError('Account not funded yet. Fund your account to start tracking savings.');
          setIsLoading(false);
          return;
        }
        throw accountError;
      }

      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch payments for the account
      const payments = await server
        .payments()
        .forAccount(publicKey)
        .order('desc')
        .limit(200) // Fetch up to 200 recent payments
        .call();

      let totalUSDC = 0;
      let transactionCount = 0;

      // Process payments
      for (const payment of payments.records) {
        // Check if payment is within last 30 days
        const paymentDate = new Date(payment.created_at);
        if (paymentDate < thirtyDaysAgo) {
          break; // Payments are ordered by date, so we can stop here
        }

        // Check if it's a payment operation and is USDC
        if (
          payment.type === 'payment' &&
          payment.asset_type !== 'native'
        ) {
          const paymentRecord = payment as any;
          
          // Check if it's USDC by comparing asset code and issuer
          if (
            paymentRecord.asset_code === 'USDC' &&
            paymentRecord.asset_issuer === USDC_ISSUER &&
            paymentRecord.from === publicKey // Only count outgoing payments
          ) {
            const amount = parseFloat(paymentRecord.amount);
            totalUSDC += amount;
            transactionCount++;
          }
        }
      }

      // Calculate savings (5% of total would have been paid in bank fees)
      const savingsVsBank = totalUSDC * (BANK_WIRE_FEE_PERCENT / 100);

      const newData = {
        totalUSDC,
        transactionCount,
        savingsVsBank,
        lastFetched: new Date(),
      };

      // Animate counter from old value to new value
      animateCounter(transactionData.savingsVsBank, savingsVsBank);

      setTransactionData(newData);
    } catch (err: any) {
      // Handle specific error cases
      if (err?.response?.status === 404) {
        setError('Account not found. Please ensure your wallet is properly set up.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
      }
      console.error('Transaction history fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();

    // Refresh every 60 seconds to check for new transactions
    const interval = setInterval(() => {
      fetchTransactionHistory();
    }, 60000);

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [publicKey, network]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <PiggyBank className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Savings Calculator</h3>
            <p className="text-slate-400 text-sm">vs. {BANK_WIRE_FEE_PERCENT}% Traditional Fees</p>
          </div>
        </div>

        <button
          onClick={fetchTransactionHistory}
          disabled={isLoading}
          className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw
            className={`w-4 h-4 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {error ? (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Total Savings Display */}
          <div className="relative">
            <div className="text-center">
              <div className="text-slate-400 text-sm mb-2">Total Savings (Last 30 Days)</div>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-2"
              >
                <DollarSign className="w-8 h-8 text-emerald-400" />
                <span className="text-5xl font-bold text-emerald-400">
                  {displayedSavings.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </motion.div>
              <p className="text-slate-500 text-xs mt-2">
                Saved by using Stellar network
              </p>
            </div>

            {/* Animated pulse effect */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-emerald-500/5 rounded-lg -z-10"
              />
            )}
          </div>

          {/* Transaction Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30">
              <div className="text-slate-400 text-xs mb-1">Total Sent</div>
              <div className="text-lg font-semibold text-white">
                ${transactionData.totalUSDC.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>

            <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30">
              <div className="text-slate-400 text-xs mb-1">Transactions</div>
              <div className="text-lg font-semibold text-white">
                {transactionData.transactionCount}
              </div>
            </div>

            <div className="bg-slate-900/30 rounded-lg p-3 border border-emerald-700/30">
              <div className="text-slate-400 text-xs mb-1">Fee Rate</div>
              <div className="text-lg font-semibold text-emerald-400 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                ~$0.00001
              </div>
            </div>
          </div>

          {/* Comparison Bar */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs">Traditional Bank Wire</span>
              <span className="text-red-400 text-sm font-semibold">
                ${(transactionData.totalUSDC * (BANK_WIRE_FEE_PERCENT / 100)).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                style={{ width: '100%' }}
              />
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs">Stellar Network</span>
              <span className="text-emerald-400 text-sm font-semibold">~$0.00001</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
                style={{ width: '0.5%', minWidth: '4px' }}
              />
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-slate-500 text-center flex items-center justify-center gap-2">
            <TrendingDown className="w-3.5 h-3.5 rotate-180 text-emerald-400" />
            <span>Updated {transactionData.lastFetched.toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
