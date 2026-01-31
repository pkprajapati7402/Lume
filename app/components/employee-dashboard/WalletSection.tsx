'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Copy, 
  Check, 
  QrCode, 
  RefreshCw, 
  ExternalLink,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  X,
  Download
} from 'lucide-react';
import { useAuthStore } from '@/app/store/authStore';
import * as StellarSDK from '@stellar/stellar-sdk';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface Balance {
  assetCode: string;
  assetIssuer?: string;
  balance: string;
  assetType: string;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  asset: string;
  date: Date;
  address: string;
  hash: string;
}

export default function WalletSection() {
  const { publicKey, network } = useAuthStore();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (publicKey) {
      fetchBalances();
      fetchTransactions();
    }
  }, [publicKey, network]);

  const fetchBalances = async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      const horizonUrl = network === 'testnet' 
        ? 'https://horizon-testnet.stellar.org' 
        : 'https://horizon.stellar.org';
      const server = new StellarSDK.Horizon.Server(horizonUrl);

      const account = await server.loadAccount(publicKey);

      const accountBalances: Balance[] = account.balances.map((balance: any) => {
        if (balance.asset_type === 'native') {
          return {
            assetCode: 'XLM',
            balance: parseFloat(balance.balance).toFixed(4),
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
    } catch (err: any) {
      if (err?.response?.status === 404) {
        toast.error('Account not found on this network');
      } else {
        console.error('Balance fetch error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!publicKey) return;

    try {
      const horizonUrl = network === 'testnet' 
        ? 'https://horizon-testnet.stellar.org' 
        : 'https://horizon.stellar.org';
      const server = new StellarSDK.Horizon.Server(horizonUrl);

      const payments = await server.payments()
        .forAccount(publicKey)
        .order('desc')
        .limit(10)
        .call();

      const txs: Transaction[] = payments.records
        .filter((record: any) => record.type === 'payment' || record.type === 'create_account')
        .map((record: any) => ({
          id: record.id,
          type: record.to === publicKey ? 'received' : 'sent',
          amount: record.amount || record.starting_balance || '0',
          asset: record.asset_code || 'XLM',
          date: new Date(record.created_at),
          address: record.to === publicKey ? record.from : record.to,
          hash: record.transaction_hash,
        }));

      setTransactions(txs);
    } catch (err: any) {
      // Silently handle 404 errors (account not found on network)
      if (err?.response?.status === 404) {
        setTransactions([]);
      } else {
        console.error('Failed to fetch transactions:', err);
      }
    }
  };

  const copyToClipboard = async () => {
    if (!publicKey) return;
    
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const generateQRCode = async () => {
    if (!publicKey || !qrCanvasRef.current) return;

    try {
      // Generate a real QR code using the qrcode library
      await QRCode.toCanvas(qrCanvasRef.current, publicKey, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      toast.error('Failed to generate QR code');
    }
  };

  useEffect(() => {
    if (showQRModal && publicKey) {
      // Small delay to ensure canvas is mounted
      const timer = setTimeout(() => {
        generateQRCode();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showQRModal, publicKey]);

  const downloadQR = () => {
    if (!qrCanvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `stellar-wallet-${publicKey?.slice(0, 8)}.png`;
    link.href = qrCanvasRef.current.toDataURL();
    link.click();
    toast.success('QR code downloaded!');
  };

  const truncateAddress = (address: string | undefined | null, start = 8, end = 8) => {
    if (!address) return '...';
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  const getAssetIcon = (code: string) => {
    const icons: Record<string, string> = {
      'XLM': '⭐',
      'USDC': '💵',
      'EURT': '🇪🇺',
      'NGNT': '🇳🇬',
      'BRLT': '🇧🇷',
      'ARST': '🇦🇷',
    };
    return icons[code] || '🪙';
  };

  const totalUSDValue = balances.reduce((acc, bal) => {
    // Simplified USD conversion (in production, fetch real rates)
    const rates: Record<string, number> = { 'XLM': 0.12, 'USDC': 1, 'EURT': 1.08 };
    return acc + (parseFloat(bal.balance) * (rates[bal.assetCode] || 0));
  }, 0);

  return (
    <div className="space-y-6">
      {/* Main Wallet Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600/10 via-neutral-900/50 to-orange-600/10 border border-neutral-800/50"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="relative p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">My Wallet</h3>
                <p className="text-neutral-400 text-sm">Stellar {network === 'testnet' ? 'Testnet' : 'Mainnet'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHideBalances(!hideBalances)}
                className="p-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 transition-all"
              >
                {hideBalances ? <EyeOff className="w-5 h-5 text-neutral-400" /> : <Eye className="w-5 h-5 text-neutral-400" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchBalances}
                disabled={isLoading}
                className="p-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 transition-all"
              >
                <RefreshCw className={`w-5 h-5 text-neutral-400 ${isLoading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>

          {/* Total Balance */}
          <div className="mb-8">
            <p className="text-neutral-400 text-sm mb-2">Total Balance</p>
            <div className="flex items-baseline gap-3">
              <motion.span 
                className="text-5xl font-bold bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {hideBalances ? '••••••' : `$${totalUSDValue.toFixed(2)}`}
              </motion.span>
              <span className="text-neutral-500 text-lg">USD</span>
            </div>
          </div>

          {/* Wallet Address Card */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-neutral-800/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-neutral-400 text-sm">Wallet Address</span>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFullAddress(!showFullAddress)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 text-xs text-neutral-400 transition-all"
                >
                  {showFullAddress ? 'Hide' : 'Show Full'}
                </motion.button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <code className="flex-1 text-white font-mono text-sm sm:text-base break-all bg-neutral-800/50 px-4 py-3 rounded-xl">
                {showFullAddress ? publicKey : truncateAddress(publicKey || '', 12, 12)}
              </code>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Address'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQRModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 text-white font-medium transition-all"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </motion.button>
              
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={`https://stellar.expert/explorer/${network === 'testnet' ? 'testnet' : 'public'}/account/${publicKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 transition-all"
              >
                <ExternalLink className="w-5 h-5 text-neutral-400" />
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-neutral-800/50 animate-pulse" />
          ))
        ) : balances.length > 0 ? (
          balances.map((balance, index) => (
            <motion.div
              key={balance.assetCode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 border border-neutral-800/50 p-5 hover:border-amber-500/30 transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getAssetIcon(balance.assetCode)}</span>
                  <div>
                    <p className="font-semibold text-white">{balance.assetCode}</p>
                    <p className="text-xs text-neutral-500">
                      {balance.assetType === 'native' ? 'Native' : 'Token'}
                    </p>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <p className="text-2xl font-bold text-white">
                {hideBalances ? '••••' : balance.balance}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-neutral-500">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No assets found in this wallet</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-neutral-900/50 border border-neutral-800/50 overflow-hidden"
      >
        <div className="p-6 border-b border-neutral-800/50">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        
        <div className="divide-y divide-neutral-800/50">
          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 hover:bg-neutral-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${
                    tx.type === 'received' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {tx.type === 'received' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {tx.type === 'received' ? 'Received' : 'Sent'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {tx.type === 'received' ? 'From: ' : 'To: '}
                      {truncateAddress(tx.address, 6, 6)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === 'received' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tx.type === 'received' ? '+' : '-'}{tx.amount} {tx.asset}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {tx.date.toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center text-neutral-500">
              <p>No recent transactions</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black rounded-3xl p-8 border border-neutral-800/50 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Wallet QR Code</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-neutral-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl mb-6">
                  <canvas ref={qrCanvasRef} className="w-48 h-48" />
                </div>
                
                <p className="text-center text-neutral-400 text-sm mb-4 break-all px-4">
                  {publicKey}
                </p>
                
                <div className="flex gap-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 text-white font-medium transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadQR}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
