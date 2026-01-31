'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets,
  TrendingUp,
  Percent,
  Info,
  ExternalLink,
  RefreshCw,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  ChevronDown,
  ArrowRight,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuthStore } from '@/app/store/authStore';
import { toast } from 'sonner';
import * as StellarSDK from '@stellar/stellar-sdk';

interface LiquidityPool {
  id: string;
  name: string;
  assets: [string, string];
  assetIcons: [string, string];
  tvl: number;
  apr: number;
  volume24h: number;
  myLiquidity: number;
  shares: number;
  poolType: 'constant_product';
}

interface PoolDetails {
  reserves: [string, string];
  totalShares: string;
  fee: number;
}

export default function InvestSection() {
  const { publicKey, network } = useAuthStore();
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedPool, setExpandedPool] = useState<string | null>(null);

  // Mock liquidity pools data (in production, fetch from Stellar)
  const mockPools: LiquidityPool[] = [
    {
      id: 'pool1',
      name: 'XLM / USDC',
      assets: ['XLM', 'USDC'],
      assetIcons: ['⭐', '💵'],
      tvl: 2450000,
      apr: 12.5,
      volume24h: 485000,
      myLiquidity: 0,
      shares: 0,
      poolType: 'constant_product',
    },
    {
      id: 'pool2',
      name: 'XLM / EURT',
      assets: ['XLM', 'EURT'],
      assetIcons: ['⭐', '🇪🇺'],
      tvl: 890000,
      apr: 8.2,
      volume24h: 125000,
      myLiquidity: 0,
      shares: 0,
      poolType: 'constant_product',
    },
    {
      id: 'pool3',
      name: 'USDC / EURT',
      assets: ['USDC', 'EURT'],
      assetIcons: ['💵', '🇪🇺'],
      tvl: 1200000,
      apr: 5.8,
      volume24h: 320000,
      myLiquidity: 0,
      shares: 0,
      poolType: 'constant_product',
    },
    {
      id: 'pool4',
      name: 'XLM / yXLM',
      assets: ['XLM', 'yXLM'],
      assetIcons: ['⭐', '🌟'],
      tvl: 5600000,
      apr: 15.3,
      volume24h: 890000,
      myLiquidity: 0,
      shares: 0,
      poolType: 'constant_product',
    },
  ];

  useEffect(() => {
    fetchPools();
  }, [publicKey, network]);

  const fetchPools = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, fetch actual pool data from Stellar Horizon
      // const horizonUrl = network === 'testnet' 
      //   ? 'https://horizon-testnet.stellar.org' 
      //   : 'https://horizon.stellar.org';
      // const server = new StellarSDK.Horizon.Server(horizonUrl);
      // const pools = await server.liquidityPools().call();
      
      setPools(mockPools);
    } catch (err) {
      console.error('Failed to fetch pools:', err);
      toast.error('Failed to load liquidity pools');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!publicKey || !selectedPool || !amount) return;

    setIsProcessing(true);
    try {
      // Simulate deposit transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Liquidity Added!', {
        description: `Successfully deposited ${amount} to ${selectedPool.name} pool`,
      });
      
      setAmount('');
      setSelectedPool(null);
      fetchPools();
    } catch (err: any) {
      toast.error('Deposit Failed', {
        description: err.message || 'An error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!publicKey || !selectedPool || !amount) return;

    setIsProcessing(true);
    try {
      // Simulate withdraw transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Liquidity Removed!', {
        description: `Successfully withdrew from ${selectedPool.name} pool`,
      });
      
      setAmount('');
      setSelectedPool(null);
      fetchPools();
    } catch (err: any) {
      toast.error('Withdrawal Failed', {
        description: err.message || 'An error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const totalTVL = pools.reduce((acc, pool) => acc + pool.tvl, 0);
  const avgAPR = pools.reduce((acc, pool) => acc + pool.apr, 0) / pools.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600/20 via-orange-600/10 to-rose-600/20 border border-white/10 p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Liquidity Pools</h2>
              <p className="text-gray-400">Earn passive income by providing liquidity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-gray-400">Total TVL</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalTVL)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-gray-400">Avg APR</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{avgAPR.toFixed(1)}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-gray-400">Active Pools</span>
              </div>
              <p className="text-2xl font-bold text-white">{pools.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-4 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20"
      >
        <Info className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-white font-medium mb-1">How Liquidity Pools Work</p>
          <p className="text-gray-400">
            Provide liquidity to earn a share of trading fees. The more liquidity you provide, 
            the more fees you earn. Note: Impermanent loss may occur during volatile market conditions.
          </p>
        </div>
      </motion.div>

      {/* Pool List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Available Pools</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchPools}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {pools.map((pool, index) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPool(expandedPool === pool.id ? null : pool.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <span className="text-2xl bg-[#1a1a24] rounded-full p-2 border-2 border-[#0d0d14]">
                        {pool.assetIcons[0]}
                      </span>
                      <span className="text-2xl bg-[#1a1a24] rounded-full p-2 border-2 border-[#0d0d14]">
                        {pool.assetIcons[1]}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{pool.name}</p>
                      <p className="text-sm text-gray-500">Constant Product AMM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden sm:block text-right">
                      <p className="text-sm text-gray-400">TVL</p>
                      <p className="font-semibold text-white">{formatCurrency(pool.tvl)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">APR</p>
                      <p className="font-semibold text-emerald-400">{pool.apr}%</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedPool === pool.id ? 'rotate-180' : ''
                    }`} />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedPool === pool.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-white/5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                          <div className="p-3 rounded-xl bg-white/5">
                            <p className="text-xs text-gray-500 mb-1">24h Volume</p>
                            <p className="font-semibold text-white">{formatCurrency(pool.volume24h)}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/5">
                            <p className="text-xs text-gray-500 mb-1">Pool Fee</p>
                            <p className="font-semibold text-white">0.3%</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/5">
                            <p className="text-xs text-gray-500 mb-1">Your Liquidity</p>
                            <p className="font-semibold text-white">{formatCurrency(pool.myLiquidity)}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/5">
                            <p className="text-xs text-gray-500 mb-1">Your Shares</p>
                            <p className="font-semibold text-white">{pool.shares.toFixed(6)}</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedPool(pool);
                              setActiveTab('deposit');
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Add Liquidity
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedPool(pool);
                              setActiveTab('withdraw');
                            }}
                            disabled={pool.myLiquidity === 0}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <Minus className="w-4 h-4" />
                            Remove
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
      >
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-white font-medium mb-1">Risk Disclosure</p>
          <p className="text-gray-400">
            Providing liquidity involves risks including impermanent loss and smart contract risks. 
            Only invest what you can afford to lose. Past returns do not guarantee future performance.
          </p>
        </div>
      </motion.div>

      {/* Deposit/Withdraw Modal */}
      <AnimatePresence>
        {selectedPool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPool(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d0d14] rounded-3xl p-6 border border-white/10 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <span className="text-xl bg-[#1a1a24] rounded-full p-2 border-2 border-[#0d0d14]">
                      {selectedPool.assetIcons[0]}
                    </span>
                    <span className="text-xl bg-[#1a1a24] rounded-full p-2 border-2 border-[#0d0d14]">
                      {selectedPool.assetIcons[1]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{selectedPool.name}</h3>
                    <p className="text-sm text-gray-500">APR: {selectedPool.apr}%</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPool(null)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400"
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'deposit'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Deposit
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'withdraw'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  Withdraw
                </button>
              </div>

              {activeTab === 'deposit' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Amount ({selectedPool.assets[0]})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 rounded-2xl bg-black/30 border border-white/5 text-white placeholder:text-gray-600 outline-none focus:border-amber-500/50 transition-colors text-lg"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Estimated {selectedPool.assets[1]} needed</span>
                      <span className="text-white">
                        {amount ? (parseFloat(amount) * 0.12).toFixed(4) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Pool share</span>
                      <span className="text-white">~0.0001%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Estimated daily earnings</span>
                      <span className="text-emerald-400">
                        ~${amount ? ((parseFloat(amount) * 0.12 * (selectedPool.apr / 100)) / 365).toFixed(4) : '0.00'}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeposit}
                    disabled={isProcessing || !amount}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Add Liquidity
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Shares to withdraw
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      max={selectedPool.shares}
                      className="w-full px-4 py-4 rounded-2xl bg-black/30 border border-white/5 text-white placeholder:text-gray-600 outline-none focus:border-amber-500/50 transition-colors text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Available: {selectedPool.shares.toFixed(6)} shares
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">You will receive</span>
                      <span className="text-white">~{amount || '0'} {selectedPool.assets[0]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">And</span>
                      <span className="text-white">
                        ~{amount ? (parseFloat(amount) * 0.12).toFixed(4) : '0'} {selectedPool.assets[1]}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWithdraw}
                    disabled={isProcessing || !amount || selectedPool.shares === 0}
                    className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Minus className="w-5 h-5" />
                        Remove Liquidity
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Educational Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <h4 className="font-semibold text-white">Instant Settlement</h4>
          </div>
          <p className="text-gray-400 text-sm">
            Stellar DEX transactions settle in 3-5 seconds with minimal fees.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <h4 className="font-semibold text-white">Non-Custodial</h4>
          </div>
          <p className="text-gray-400 text-sm">
            Your funds remain in your wallet. You control your private keys at all times.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-semibold text-white">Earn Passively</h4>
          </div>
          <p className="text-gray-400 text-sm">
            Earn trading fees proportional to your share of the liquidity pool.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
