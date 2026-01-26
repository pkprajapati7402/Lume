'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Send, ArrowRight, RefreshCw, AlertCircle, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/app/store/authStore';
import { 
  handlePayment, 
  isValidStellarAddress, 
  isValidAmount,
  checkDestinationAccount,
  getPathPaymentEstimate 
} from '@/lib/stellar-payment';
import { recordPayoutAction } from '@/app/actions/employees';

interface Asset {
  code: string;
  name: string;
  icon: string;
}

export default function PayEmployeeSection() {
  const { publicKey, network } = useAuthStore();
  
  const [fromAsset, setFromAsset] = useState<Asset>({ code: 'USDC', name: 'USD Coin', icon: '💵' });
  const [toAsset, setToAsset] = useState<Asset>({ code: 'NGNT', name: 'Nigerian Naira', icon: '🇳🇬' });
  const [amount, setAmount] = useState('1000');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedReceiveAmount, setEstimatedReceiveAmount] = useState<string>('');
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const assets: Asset[] = [
    { code: 'USDC', name: 'USD Coin', icon: '💵' },
    { code: 'EURT', name: 'Euro Token', icon: '🇪🇺' },
    { code: 'NGNT', name: 'Nigerian Naira', icon: '🇳🇬' },
    { code: 'BRLT', name: 'Brazilian Real', icon: '🇧🇷' },
    { code: 'ARST', name: 'Argentine Peso', icon: '🇦🇷' },
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

  // Validate recipient address in real-time
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

  // Mock FX rates (kept for UI display, real rate comes from Stellar DEX)
  const getFXRate = () => {
    const rates: Record<string, Record<string, number>> = {
      'USDC': { 'NGNT': 1547.50, 'EURT': 0.92, 'BRLT': 5.45, 'ARST': 985.30 },
      'EURT': { 'USDC': 1.09, 'NGNT': 1683.45, 'BRLT': 5.93, 'ARST': 1073.15 },
      'NGNT': { 'USDC': 0.00065, 'EURT': 0.00059, 'BRLT': 0.0035, 'ARST': 0.64 },
    };
    return rates[fromAsset.code]?.[toAsset.code] || 1;
  };

  const fxRate = getFXRate();
  const convertedAmount = estimatedReceiveAmount 
    ? parseFloat(estimatedReceiveAmount) 
    : (parseFloat(amount) || 0) * fxRate;

  const handleSwapAssets = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!publicKey) {
      toast.error('Wallet Not Connected', {
        description: 'Please connect your Freighter wallet first',
      });
      return;
    }

    if (!isValidStellarAddress(recipientAddress)) {
      toast.error('Invalid Address', {
        description: 'Invalid recipient Stellar address',
      });
      return;
    }

    if (!isValidAmount(amount)) {
      toast.error('Invalid Amount', {
        description: 'Please enter a valid amount',
      });
      return;
    }

    // Check if trying to send to self
    if (recipientAddress === publicKey) {
      toast.error('Invalid Recipient', {
        description: 'Cannot send payment to yourself',
      });
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Sending payment...', {
      description: 'Preparing transaction on Stellar network',
    });

    try {
      // Optional: Check destination account exists and has trustline
      const accountCheck = await checkDestinationAccount(
        recipientAddress,
        toAsset.code,
        network
      );

      if (!accountCheck.exists) {
        toast.error('Account Not Found', {
          description: 'Recipient account does not exist on the Stellar network',
          id: toastId,
        });
        setIsSubmitting(false);
        return;
      }

      if (!accountCheck.hasTrustline && toAsset.code !== 'XLM') {
        toast.error('Missing Trustline', {
          description: `Recipient account has no trustline for ${toAsset.code}. They need to add a trustline first.`,
          id: toastId,
        });
        setIsSubmitting(false);
        return;
      }

      // Execute payment
      const result = await handlePayment({
        sourcePublicKey: publicKey,
        destinationAddress: recipientAddress,
        sendAssetCode: fromAsset.code,
        receiveAssetCode: toAsset.code,
        sendAmount: amount,
        memo: memo,
        network: network,
      });

      if (result.success && result.transactionHash) {
        // Success! Show success toast with Stellar Expert link
        const explorerUrl = `https://stellar.expert/explorer/${network}/tx/${result.transactionHash}`;
        
        toast.success('Payment Sent Successfully! 🎉', {
          description: (
            <div className="flex flex-col gap-2">
              <span>Transaction confirmed on Stellar network</span>
              <a 
                href={explorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                View on Stellar Expert <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ),
          id: toastId,
          duration: 8000,
        });

        // Record payout in Supabase using server action (non-blocking)
        recordPayoutAction({
          transactionHash: result.transactionHash,
          amount: result.amount,
          assetCode: result.assetCode,
          recipientWalletAddress: recipientAddress,
          ownerWalletAddress: publicKey,
        }).then((recordResult) => {
          if (recordResult.success) {
            console.log('✅ Payment recorded in database');
          } else {
            console.warn('⚠️ Payment succeeded but database recording failed:', recordResult.error);
          }
        }).catch((err) => {
          console.warn('⚠️ Database recording error:', err);
        });

        // Clear form after success
        setTimeout(() => {
          setRecipientAddress('');
          setAmount('1000');
          setMemo('');
        }, 2000);

      } else {
        // Payment failed
        toast.error('Payment Failed', {
          description: result.error || 'Transaction could not be completed',
          id: toastId,
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Unexpected Error', {
        description: error.message || 'An unexpected error occurred',
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Pay Employee</h2>
        <p className="text-slate-400">Send payments instantly with automatic currency conversion</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Payment Details</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Recipient Address */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                  validationError ? 'border-red-500' : 'border-slate-700'
                }`}
                required
                disabled={isSubmitting}
              />
              {validationError && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationError}
                </p>
              )}
            </div>

            {/* Amount & From Asset */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Send Amount
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  step="0.01"
                  min="0"
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                  disabled={isSubmitting}
                />
                <select
                  value={fromAsset.code}
                  onChange={(e) => setFromAsset(assets.find(a => a.code === e.target.value) || assets[0])}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  disabled={isSubmitting}
                >
                  {assets.map((asset) => (
                    <option key={asset.code} value={asset.code}>
                      {asset.icon} {asset.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* To Asset */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recipient Receives
              </label>
              <select
                value={toAsset.code}
                onChange={(e) => setToAsset(assets.find(a => a.code === e.target.value) || assets[0])}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={isSubmitting}
              >
                {assets.map((asset) => (
                  <option key={asset.code} value={asset.code}>
                    {asset.icon} {asset.code} - {asset.name}
                  </option>
                ))}
              </select>
              {fromAsset.code === toAsset.code && (
                <p className="mt-1 text-xs text-slate-500">
                  Direct payment - no conversion needed
                </p>
              )}
            </div>

            {/* Memo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Memo (Optional)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Salary - January 2026"
                maxLength={28}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-slate-500">Max 28 characters</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !!validationError || !publicKey}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
            </button>
            
            {!publicKey && (
              <p className="text-sm text-amber-400 text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Please connect your wallet to send payments
              </p>
            )}
          </form>
        </motion.div>

        {/* Asset Swap Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Exchange Preview</h3>

          <div className="space-y-6">
            {/* From Asset Display */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">You Send</span>
                <button
                  type="button"
                  onClick={handleSwapAssets}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Swap assets"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-400 hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{fromAsset.icon}</span>
                <div>
                  <div className="text-3xl font-bold text-white">{amount || '0'}</div>
                  <div className="text-slate-400 text-sm">{fromAsset.code}</div>
                </div>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="flex items-center justify-center">
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-4 py-2">
                <div className="text-slate-400 text-xs mb-1 text-center">
                  {fromAsset.code === toAsset.code ? 'Same Asset' : 'Exchange Rate'}
                </div>
                {fromAsset.code === toAsset.code ? (
                  <div className="text-indigo-300 font-semibold text-center">
                    No conversion needed
                  </div>
                ) : estimateLoading ? (
                  <div className="text-indigo-300 font-semibold text-center flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading...
                  </div>
                ) : estimatedReceiveAmount && parseFloat(amount) > 0 ? (
                  <div className="text-indigo-300 font-semibold text-center">
                    1 {fromAsset.code} ≈ {(parseFloat(estimatedReceiveAmount) / parseFloat(amount)).toFixed(4)} {toAsset.code}
                  </div>
                ) : (
                  <div className="text-indigo-300 font-semibold text-center">
                    1 {fromAsset.code} = {fxRate.toFixed(4)} {toAsset.code}
                  </div>
                )}
              </div>
            </div>

            {/* To Asset Display */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
              <div className="text-slate-400 text-sm mb-2">Recipient Gets</div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{toAsset.icon}</span>
                <div className="flex-1">
                  {estimateLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                      <span className="text-slate-400">Calculating...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-white">
                        {convertedAmount.toFixed(2)}
                      </div>
                      <div className="text-slate-400 text-sm">{toAsset.code}</div>
                      {fromAsset.code !== toAsset.code && estimatedReceiveAmount && (
                        <div className="text-xs text-indigo-400 mt-1">
                          Live rate from Stellar DEX
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Fee Information */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-indigo-300 font-medium text-sm mb-1">
                    Network Fee: ~0.00001 XLM
                  </div>
                  <div className="text-slate-400 text-xs">
                    Stellar's ultra-low fees save you 90% compared to traditional wire transfers
                  </div>
                </div>
              </div>
            </div>

            {/* Path Payment Info */}
            <div className="border-t border-slate-700 pt-4">
              <div className="text-slate-400 text-xs mb-2">Payment Route</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white font-medium">{fromAsset.code}</span>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <span className="text-slate-500">Stellar DEX</span>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <span className="text-white font-medium">{toAsset.code}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
