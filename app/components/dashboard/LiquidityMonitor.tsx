'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import * as StellarSDK from '@stellar/stellar-sdk';
import { useAuthStore } from '../../store/authStore';

interface LiquidityMonitorProps {
  sourceAssetCode?: string;
  sourceAssetIssuer?: string;
  destAssetCode?: string;
  destAssetIssuer?: string;
}

interface OrderbookData {
  spread: number;
  topBidPrice: string;
  topAskPrice: string;
  fxRate: number;
  isStableLiquidity: boolean;
}

export default function LiquidityMonitor({
  sourceAssetCode = 'USDC',
  sourceAssetIssuer = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  destAssetCode = 'NGNT',
  destAssetIssuer = 'GAWODAROMJ33V5YDFY3NPYTHVYQG7MJXVJ2ND3AOGIHYRWINES6ACCPD',
}: LiquidityMonitorProps) {
  const { network } = useAuthStore();
  const [orderbookData, setOrderbookData] = useState<OrderbookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOrderbook = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const horizonUrl = network === 'testnet' 
        ? 'https://horizon-testnet.stellar.org' 
        : 'https://horizon.stellar.org';
      const server = new StellarSDK.Horizon.Server(horizonUrl);

      // Create asset objects
      const sourceAsset = new StellarSDK.Asset(sourceAssetCode, sourceAssetIssuer);
      const destAsset = new StellarSDK.Asset(destAssetCode, destAssetIssuer);

      // Fetch orderbook
      const orderbook = await server
        .orderbook(sourceAsset, destAsset)
        .call();

      // Calculate spread and rates
      if (orderbook.bids.length > 0 && orderbook.asks.length > 0) {
        const topBid = orderbook.bids[0];
        const topAsk = orderbook.asks[0];

        const bidPrice = parseFloat(topBid.price);
        const askPrice = parseFloat(topAsk.price);

        // Calculate spread as a percentage
        const spread = ((askPrice - bidPrice) / bidPrice) * 100;

        // Use mid-price for FX rate
        const fxRate = (bidPrice + askPrice) / 2;

        const isStableLiquidity = spread < 1;

        setOrderbookData({
          spread,
          topBidPrice: bidPrice.toFixed(6),
          topAskPrice: askPrice.toFixed(6),
          fxRate,
          isStableLiquidity,
        });
      } else {
        setError('No orderbook data available');
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      // Handle specific error cases
      if (err?.response?.status === 404) {
        setError(`Orderbook not found. The ${sourceAssetCode}/${destAssetCode} pair may not exist on ${network}.`);
      } else if (err?.response?.status === 400) {
        setError('Invalid asset configuration. Please check asset codes and issuers.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch orderbook');
      }
      console.error('Orderbook fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderbook();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrderbook();
    }, 30000);

    return () => clearInterval(interval);
  }, [sourceAssetCode, sourceAssetIssuer, destAssetCode, destAssetIssuer, network]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Live FX Rate</h3>
            <p className="text-slate-400 text-sm">
              {sourceAssetCode} → {destAssetCode}
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrderbook}
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
        <div className="flex flex-col items-center gap-3 text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Try switching networks or the orderbook may not have active trades yet.
          </p>
        </div>
      ) : orderbookData ? (
        <div className="space-y-4">
          {/* FX Rate Display */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
            <div className="text-slate-400 text-sm mb-2">Exchange Rate</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {orderbookData.fxRate.toFixed(4)}
              </span>
              <span className="text-slate-400 text-sm">
                {destAssetCode}/{sourceAssetCode}
              </span>
            </div>
          </div>

          {/* Spread and Liquidity Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/30 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Spread</div>
              <div className="text-xl font-semibold text-white">
                {orderbookData.spread.toFixed(3)}%
              </div>
            </div>

            <div className="bg-slate-900/30 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Status</div>
              {orderbookData.isStableLiquidity ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold">
                    Stable Liquidity
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-semibold">
                    High Spread
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bid/Ask Prices */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/30">
            <div>
              <div className="text-slate-500 text-xs mb-1">Top Bid</div>
              <div className="text-sm font-medium text-emerald-400">
                {orderbookData.topBidPrice}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Top Ask</div>
              <div className="text-sm font-medium text-red-400">
                {orderbookData.topAskPrice}
              </div>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-xs text-slate-500 text-center pt-2">
              Updated {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-slate-500">Loading orderbook...</div>
        </div>
      )}
    </motion.div>
  );
}
