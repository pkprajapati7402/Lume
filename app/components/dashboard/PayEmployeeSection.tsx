'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface Asset {
  code: string;
  name: string;
  icon: string;
}

export default function PayEmployeeSection() {
  const [fromAsset, setFromAsset] = useState<Asset>({ code: 'USDC', name: 'USD Coin', icon: '💵' });
  const [toAsset, setToAsset] = useState<Asset>({ code: 'NGNT', name: 'Nigerian Naira', icon: '🇳🇬' });
  const [amount, setAmount] = useState('1000');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [memo, setMemo] = useState('');

  const assets: Asset[] = [
    { code: 'USDC', name: 'USD Coin', icon: '💵' },
    { code: 'EURT', name: 'Euro Token', icon: '🇪🇺' },
    { code: 'NGNT', name: 'Nigerian Naira', icon: '🇳🇬' },
    { code: 'BRLT', name: 'Brazilian Real', icon: '🇧🇷' },
    { code: 'ARST', name: 'Argentine Peso', icon: '🇦🇷' },
  ];

  // Mock FX rates
  const getFXRate = () => {
    const rates: Record<string, Record<string, number>> = {
      'USDC': { 'NGNT': 1547.50, 'EURT': 0.92, 'BRLT': 5.45, 'ARST': 985.30 },
      'EURT': { 'USDC': 1.09, 'NGNT': 1683.45, 'BRLT': 5.93, 'ARST': 1073.15 },
      'NGNT': { 'USDC': 0.00065, 'EURT': 0.00059, 'BRLT': 0.0035, 'ARST': 0.64 },
    };
    return rates[fromAsset.code]?.[toAsset.code] || 1;
  };

  const fxRate = getFXRate();
  const convertedAmount = (parseFloat(amount) || 0) * fxRate;

  const handleSwapAssets = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle payment submission
    alert(`Payment of ${amount} ${fromAsset.code} (${convertedAmount.toFixed(2)} ${toAsset.code}) initiated!`);
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
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
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
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
                <select
                  value={fromAsset.code}
                  onChange={(e) => setFromAsset(assets.find(a => a.code === e.target.value) || assets[0])}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
              >
                {assets.filter(a => a.code !== fromAsset.code).map((asset) => (
                  <option key={asset.code} value={asset.code}>
                    {asset.icon} {asset.code} - {asset.name}
                  </option>
                ))}
              </select>
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
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-indigo-500/25"
            >
              <Send className="w-5 h-5" />
              Send Payment
            </button>
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
                <div className="text-slate-400 text-xs mb-1 text-center">Exchange Rate</div>
                <div className="text-indigo-300 font-semibold text-center">
                  1 {fromAsset.code} = {fxRate.toFixed(4)} {toAsset.code}
                </div>
              </div>
            </div>

            {/* To Asset Display */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
              <div className="text-slate-400 text-sm mb-2">Recipient Gets</div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{toAsset.icon}</span>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {convertedAmount.toFixed(2)}
                  </div>
                  <div className="text-slate-400 text-sm">{toAsset.code}</div>
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
