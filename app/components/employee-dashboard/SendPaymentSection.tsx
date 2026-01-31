'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Send, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ExternalLink,
  Wallet,
  ArrowDownUp,
  Sparkles,
  Clock,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/app/store/authStore';
import { 
  handlePayment, 
  isValidStellarAddress, 
  isValidAmount,
  getPathPaymentEstimate 
} from '@/lib/stellar-payment';

interface Asset {
  code: string;
  name: string;
  icon: string;
  color: string;
}

export default function SendPaymentSection() {
  const { publicKey, network } = useAuthStore();
  
  const [fromAsset, setFromAsset] = useState<Asset>({ code: 'XLM', name: 'Stellar Lumens', icon: '⭐', color: 'from-amber-500 to-orange-600' });
  const [toAsset, setToAsset] = useState<Asset>({ code: 'XLM', name: 'Stellar Lumens', icon: '⭐', color: 'from-amber-500 to-orange-600' });
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedReceiveAmount, setEstimatedReceiveAmount] = useState<string>('');
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [showAssetSelector, setShowAssetSelector] = useState<'from' | 'to' | null>(null);
  const [txSuccess, setTxSuccess] = useState<{ hash: string } | null>(null);

  const assets: Asset[] = [
    { code: 'XLM', name: 'Stellar Lumens', icon: '⭐', color: 'from-amber-500 to-orange-600' },
    { code: 'USDC', name: 'USD Coin', icon: '💵', color: 'from-emerald-500 to-teal-600' },
    { code: 'EURT', name: 'Euro Token', icon: '🇪🇺', color: 'from-blue-500 to-indigo-600' },
    { code: 'NGNT', name: 'Nigerian Naira', icon: '🇳🇬', color: 'from-green-500 to-emerald-600' },
    { code: 'BRLT', name: 'Brazilian Real', icon: '🇧🇷', color: 'from-yellow-500 to-amber-600' },
    { code: 'ARST', name: 'Argentine Peso', icon: '🇦🇷', color: 'from-sky-500 to-blue-600' },
  ];

  // Update estimated receive amount when parameters change
  useEffect(() => {
    const fetchEstimate = async () => {
      if (!amount || !isValidAmount(amount) || fromAsset.code === toAsset.code) {
        setEstimatedReceiveAmount(amount || '0');
        return;
      }

      setEstimateLoading(true);
      try {
        const { estimatedAmount, error } = await getPathPaymentEstimate(
          fromAsset.code,
          toAsset.code,
          amount,
          network
        );

        if (error) {
          setEstimatedReceiveAmount('Unable to estimate');
        } else {
          setEstimatedReceiveAmount(estimatedAmount);
        }
      } catch (error) {
        console.error('Error fetching estimate:', error);
        setEstimatedReceiveAmount('Error');
      } finally {
        setEstimateLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchEstimate, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, fromAsset.code, toAsset.code, network]);

  // Validate recipient address
  useEffect(() => {
    if (!recipientAddress) {
      setValidationError('');
      return;
    }

    if (!isValidStellarAddress(recipientAddress)) {
      setValidationError('Invalid Stellar address format');
    } else {
      setValidationError('');
    }
  }, [recipientAddress]);

  const handleSwapAssets = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      toast.error('Wallet Not Connected', {
        description: 'Please connect your wallet first',
      });
      return;
    }

    if (!isValidStellarAddress(recipientAddress)) {
      toast.error('Invalid Address', {
        description: 'Please enter a valid Stellar address',
      });
      return;
    }

    if (!isValidAmount(amount)) {
      toast.error('Invalid Amount', {
        description: 'Please enter a valid amount greater than 0',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await handlePayment({
        sourcePublicKey: publicKey,
        destinationAddress: recipientAddress,
        sendAmount: amount,
        sendAssetCode: fromAsset.code,
        receiveAssetCode: toAsset.code,
        memo: memo || undefined,
        network,
      });

      if (result.success) {
        setTxSuccess({ hash: result.transactionHash || '' });
        toast.success('Payment Sent!', {
          description: `Successfully sent ${amount} ${fromAsset.code}`,
        });
        
        // Reset form
        setAmount('');
        setRecipientAddress('');
        setMemo('');
      } else {
        toast.error('Payment Failed', {
          description: result.error || 'Unknown error occurred',
        });
      }
    } catch (error: any) {
      toast.error('Payment Failed', {
        description: error.message || 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = ['10', '50', '100', '500'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success State */}
      <AnimatePresence>
        {txSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
            <p className="text-neutral-400 mb-6">Your payment has been sent successfully</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href={`https://stellar.expert/explorer/${network === 'testnet' ? 'testnet' : 'public'}/tx/${txSuccess.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800/50 hover:bg-neutral-700/50 text-white transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View Transaction
              </a>
              <button
                onClick={() => setTxSuccess(null)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-all"
              >
                Send Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!txSuccess && (
        <>
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600/10 via-neutral-900/50 to-teal-600/10 border border-neutral-800/50 p-8"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
            
            <div className="relative flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <Send className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Send Payment</h2>
                <p className="text-neutral-400">Transfer funds instantly on Stellar network</p>
              </div>
            </div>

            <div className="relative mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/50">
                <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">~3-5 seconds</p>
                <p className="text-xs text-neutral-500">Settlement time</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/50">
                <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">~0.00001 XLM</p>
                <p className="text-xs text-neutral-500">Network fee</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/50">
                <Shield className="w-5 h-5 text-sky-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">Secure</p>
                <p className="text-xs text-neutral-500">End-to-end</p>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="rounded-3xl bg-neutral-900/50 border border-neutral-800/50 p-6"
          >
            {/* From Asset */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-400 mb-2">You Send</label>
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-neutral-800/50 focus-within:border-amber-500/50 transition-colors">
                  <button
                    type="button"
                    onClick={() => setShowAssetSelector('from')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${fromAsset.color} hover:opacity-90 transition-opacity`}
                  >
                    <span className="text-lg">{fromAsset.icon}</span>
                    <span className="font-medium text-white">{fromAsset.code}</span>
                  </button>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-2xl font-semibold text-white outline-none text-right placeholder:text-gray-600"
                    step="any"
                    min="0"
                  />
                </div>
                
                {/* Quick Amounts */}
                <div className="flex gap-2 mt-3">
                  {quickAmounts.map((qa) => (
                    <button
                      key={qa}
                      type="button"
                      onClick={() => setAmount(qa)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        amount === qa
                          ? 'bg-amber-500 text-white'
                          : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50 hover:text-white'
                      }`}
                    >
                      {qa}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSwapAssets}
                className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25 transition-all"
              >
                <ArrowDownUp className="w-5 h-5" />
              </motion.button>
            </div>

            {/* To Asset */}
            <div className="mb-6 mt-4">
              <label className="block text-sm text-neutral-400 mb-2">They Receive</label>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-neutral-800/50">
                <button
                  type="button"
                  onClick={() => setShowAssetSelector('to')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${toAsset.color} hover:opacity-90 transition-opacity`}
                >
                  <span className="text-lg">{toAsset.icon}</span>
                  <span className="font-medium text-white">{toAsset.code}</span>
                </button>
                <div className="flex-1 text-right">
                  {estimateLoading ? (
                    <Loader2 className="w-5 h-5 text-neutral-400 animate-spin ml-auto" />
                  ) : (
                    <span className="text-2xl font-semibold text-white">
                      {estimatedReceiveAmount || '0.00'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Recipient Address */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-400 mb-2">Recipient Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Wallet className="w-5 h-5 text-neutral-500" />
                </div>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="G..."
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border text-white placeholder:text-neutral-600 outline-none transition-colors ${
                    validationError 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-neutral-800/50 focus:border-amber-500/50'
                  }`}
                />
                {recipientAddress && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {validationError ? (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                )}
              </div>
              {validationError && (
                <p className="text-red-400 text-sm mt-2">{validationError}</p>
              )}
            </div>

            {/* Memo */}
            <div className="mb-6">
              <label className="block text-sm text-neutral-400 mb-2">Memo (Optional)</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Add a note..."
                maxLength={28}
                className="w-full px-4 py-4 rounded-2xl bg-black/40 border border-neutral-800/50 text-white placeholder:text-neutral-600 outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || !amount || !recipientAddress || !!validationError}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-400 text-white font-semibold text-lg shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Payment
                </>
              )}
            </motion.button>
          </motion.form>
        </>
      )}

      {/* Asset Selector Modal */}
      <AnimatePresence>
        {showAssetSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAssetSelector(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black rounded-3xl p-6 border border-neutral-800/50 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-6">Select Asset</h3>
              
              <div className="space-y-2">
                {assets.map((asset) => (
                  <button
                    key={asset.code}
                    onClick={() => {
                      if (showAssetSelector === 'from') {
                        setFromAsset(asset);
                      } else {
                        setToAsset(asset);
                      }
                      setShowAssetSelector(null);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/50 hover:bg-neutral-800/50 border border-neutral-800/50 hover:border-neutral-700/50 transition-all"
                  >
                    <span className="text-2xl">{asset.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">{asset.code}</p>
                      <p className="text-sm text-neutral-500">{asset.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
