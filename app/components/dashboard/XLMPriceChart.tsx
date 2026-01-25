'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine, CartesianGrid } from 'recharts';

interface PriceData {
  timestamp: number;
  price: number;
  date: string;
  color?: string;
  isIncreasing?: boolean;
}

interface PriceChange {
  value: number;
  percentage: number;
  isPositive: boolean;
}

export default function XLMPriceChart() {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | '365'>('365');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<PriceChange | null>(null);

  useEffect(() => {
    fetchXLMPriceData();
  }, [timeRange]);

  const fetchXLMPriceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Using CoinGecko public API for XLM price data
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/stellar/market_chart?vs_currency=usd&days=${timeRange}&interval=daily`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }

      const data = await response.json();
      
      // Transform the data and add color coding based on price movement
      const transformedData: PriceData[] = data.prices.map(([timestamp, price]: [number, number], index: number) => {
        const prevPrice = index > 0 ? data.prices[index - 1][1] : price;
        const isIncreasing = price >= prevPrice;
        
        return {
          timestamp,
          price: parseFloat(price.toFixed(6)),
          date: new Date(timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: timeRange === '365' ? 'numeric' : undefined
          }),
          color: isIncreasing ? '#10b981' : '#ef4444',
          isIncreasing
        };
      });

      setPriceData(transformedData);

      // Calculate current price and price change
      if (transformedData.length > 0) {
        const latest = transformedData[transformedData.length - 1];
        const first = transformedData[0];
        setCurrentPrice(latest.price);

        const change = latest.price - first.price;
        const changePercentage = (change / first.price) * 100;

        setPriceChange({
          value: change,
          percentage: changePercentage,
          isPositive: change >= 0
        });
      }
    } catch (err) {
      console.error('Error fetching XLM price:', err);
      setError('Unable to load price data');
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isIncreasing = data.isIncreasing;
      
      return (
        <div className="bg-slate-900/95 border-2 rounded-lg px-4 py-3 shadow-2xl" 
             style={{ borderColor: isIncreasing ? '#10b981' : '#ef4444' }}>
          <div className="flex items-center gap-2 mb-2">
            {isIncreasing ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <p className="text-slate-300 text-xs font-medium">{data.date}</p>
          </div>
          <p className={`text-lg font-bold ${isIncreasing ? 'text-emerald-400' : 'text-red-400'}`}>
            ${payload[0].value.toFixed(6)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isIncreasing ? '↑ Increasing' : '↓ Decreasing'}
          </p>
        </div>
      );
    }
    return null;
  };

  const timeRangeOptions = [
    { value: '7', label: '7D' },
    { value: '30', label: '1M' },
    { value: '90', label: '3M' },
    { value: '365', label: '1Y' }
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">✨</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Stellar (XLM) Price
                <Activity className="w-4 h-4 text-indigo-400" />
              </h3>
              <p className="text-slate-400 text-sm">Live market data</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  timeRange === option.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              onClick={fetchXLMPriceData}
              className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Price & Change */}
        {!isLoading && currentPrice && priceChange && (
          <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-end gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Current Price</p>
                <p className="text-4xl font-bold text-white">
                  ${currentPrice.toFixed(6)}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                priceChange.isPositive 
                  ? 'bg-emerald-500/10 border border-emerald-500/30' 
                  : 'bg-red-500/10 border border-red-500/30'
              }`}>
                {priceChange.isPositive ? (
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
                <div>
                  <p className={`text-lg font-bold ${priceChange.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {priceChange.isPositive ? '+' : ''}{priceChange.value.toFixed(6)}
                  </p>
                  <p className={`text-sm font-semibold ${priceChange.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {priceChange.isPositive ? '+' : ''}{priceChange.percentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider">High</p>
                <p className="text-sm font-bold text-emerald-400">
                  ${Math.max(...priceData.map(d => d.price)).toFixed(6)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Low</p>
                <p className="text-sm font-bold text-red-400">
                  ${Math.min(...priceData.map(d => d.price)).toFixed(6)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Range</p>
                <p className="text-sm font-bold text-slate-300">
                  {((Math.max(...priceData.map(d => d.price)) - Math.min(...priceData.map(d => d.price))) / Math.min(...priceData.map(d => d.price)) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-slate-400">Loading price data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium">{error}</p>
              <button
                onClick={fetchXLMPriceData}
                className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  {/* Neutral gradient for the area */}
                  <linearGradient id="colorPriceNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                {/* Grid lines for better readability */}
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#334155" 
                  opacity={0.3}
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#475569', strokeWidth: 2 }}
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#475569', strokeWidth: 2 }}
                  tickFormatter={(value) => `$${value.toFixed(4)}`}
                  domain={['dataMin * 0.95', 'dataMax * 1.05']}
                  dx={-5}
                />
                
                {/* Reference line at starting price */}
                {priceData.length > 0 && (
                  <ReferenceLine 
                    y={priceData[0].price} 
                    stroke="#64748b" 
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    opacity={0.5}
                    label={{ 
                      value: `Start: $${priceData[0].price.toFixed(6)}`, 
                      position: 'left',
                      fill: '#94a3b8',
                      fontSize: 10,
                      fontWeight: 600
                    }}
                  />
                )}
                
                {/* Reference line at current price with neutral color */}
                {currentPrice && (
                  <ReferenceLine 
                    y={currentPrice} 
                    stroke="#6366f1" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ 
                      value: `Now: $${currentPrice.toFixed(6)}`, 
                      position: 'right',
                      fill: '#6366f1',
                      fontSize: 11,
                      fontWeight: 700
                    }}
                  />
                )}
                
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                
                {/* Main price line with neutral indigo color */}
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (!payload.isIncreasing && payload.isIncreasing !== undefined) {
                      // Red dot for price decrease
                      return (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={3} 
                          fill="#ef4444" 
                          stroke="#1e293b"
                          strokeWidth={1.5}
                        />
                      );
                    } else if (payload.isIncreasing) {
                      // Green dot for price increase
                      return (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={3} 
                          fill="#10b981" 
                          stroke="#1e293b"
                          strokeWidth={1.5}
                        />
                      );
                    }
                    return null;
                  }}
                  activeDot={{ 
                    r: 7, 
                    fill: '#6366f1',
                    stroke: '#fff',
                    strokeWidth: 2
                  }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
                
                {/* Area fill with neutral gradient */}
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="none"
                  fill="url(#colorPriceNeutral)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data Source Attribution */}
        {!isLoading && !error && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center">
              Data provided by{' '}
              <a
                href="https://www.coingecko.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                CoinGecko
              </a>
              {' '}• Updated in real-time
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
