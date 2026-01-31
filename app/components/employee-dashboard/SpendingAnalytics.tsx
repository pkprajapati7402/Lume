'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  RefreshCw,
  Wallet,
  CreditCard,
  Zap,
  Target,
  PiggyBank
} from 'lucide-react';
import { useAuthStore } from '@/app/store/authStore';
import * as StellarSDK from '@stellar/stellar-sdk';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  asset: string;
  date: Date;
  address: string;
}

interface SpendingCategory {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function SpendingAnalytics() {
  const { publicKey, network } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isMounted, setIsMounted] = useState(false);
  
  // Computed stats
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    netFlow: 0,
    avgTransaction: 0,
    transactionCount: 0,
    percentChange: 0,
  });
  
  const [dailySpending, setDailySpending] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<SpendingCategory[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  // Delay chart rendering until component is mounted to prevent dimension issues
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (publicKey) {
      fetchTransactions();
    }
  }, [publicKey, network, timeRange]);

  const fetchTransactions = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const horizonUrl = network === 'testnet' 
        ? 'https://horizon-testnet.stellar.org' 
        : 'https://horizon.stellar.org';
      const server = new StellarSDK.Horizon.Server(horizonUrl);

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const payments = await server.payments()
        .forAccount(publicKey)
        .order('desc')
        .limit(200)
        .call();

      const txs: Transaction[] = payments.records
        .filter((record: any) => {
          const recordDate = new Date(record.created_at);
          return (record.type === 'payment' || record.type === 'create_account') && 
                 recordDate >= startDate;
        })
        .map((record: any) => ({
          id: record.id,
          type: record.to === publicKey ? 'received' : 'sent',
          amount: parseFloat(record.amount || record.starting_balance || '0'),
          asset: record.asset_code || 'XLM',
          date: new Date(record.created_at),
          address: record.to === publicKey ? record.from : record.to,
        }));

      setTransactions(txs);
      calculateStats(txs);
      calculateDailySpending(txs, days);
      calculateCategories(txs);
      calculateMonthlyData(txs);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (txs: Transaction[]) => {
    const sent = txs.filter(t => t.type === 'sent').reduce((acc, t) => acc + t.amount, 0);
    const received = txs.filter(t => t.type === 'received').reduce((acc, t) => acc + t.amount, 0);
    
    // Calculate percentage change (comparing to previous period)
    const halfPoint = Math.floor(txs.length / 2);
    const recentTxs = txs.slice(0, halfPoint);
    const olderTxs = txs.slice(halfPoint);
    
    const recentSpent = recentTxs.filter(t => t.type === 'sent').reduce((acc, t) => acc + t.amount, 0);
    const olderSpent = olderTxs.filter(t => t.type === 'sent').reduce((acc, t) => acc + t.amount, 0);
    
    const percentChange = olderSpent > 0 ? ((recentSpent - olderSpent) / olderSpent) * 100 : 0;

    setStats({
      totalSent: sent,
      totalReceived: received,
      netFlow: received - sent,
      avgTransaction: txs.length > 0 ? (sent + received) / txs.length : 0,
      transactionCount: txs.length,
      percentChange,
    });
  };

  const calculateDailySpending = (txs: Transaction[], days: number) => {
    const dailyMap = new Map<string, { sent: number; received: number }>();
    
    // Initialize all days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dailyMap.set(key, { sent: 0, received: 0 });
    }

    // Aggregate transactions
    txs.forEach(tx => {
      const key = tx.date.toISOString().split('T')[0];
      const existing = dailyMap.get(key) || { sent: 0, received: 0 };
      if (tx.type === 'sent') {
        existing.sent += tx.amount;
      } else {
        existing.received += tx.amount;
      }
      dailyMap.set(key, existing);
    });

    const data = Array.from(dailyMap.entries()).map(([date, values]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sent: parseFloat(values.sent.toFixed(2)),
      received: parseFloat(values.received.toFixed(2)),
    }));

    setDailySpending(data);
  };

  const calculateCategories = (txs: Transaction[]) => {
    // Group by asset type
    const assetMap = new Map<string, number>();
    
    txs.filter(t => t.type === 'sent').forEach(tx => {
      const existing = assetMap.get(tx.asset) || 0;
      assetMap.set(tx.asset, existing + tx.amount);
    });

    const data: SpendingCategory[] = Array.from(assetMap.entries())
      .map(([name, value], index) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    setCategoryData(data);
  };

  const calculateMonthlyData = (txs: Transaction[]) => {
    const monthlyMap = new Map<string, { sent: number; received: number }>();

    txs.forEach(tx => {
      const key = tx.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const existing = monthlyMap.get(key) || { sent: 0, received: 0 };
      if (tx.type === 'sent') {
        existing.sent += tx.amount;
      } else {
        existing.received += tx.amount;
      }
      monthlyMap.set(key, existing);
    });

    const data = Array.from(monthlyMap.entries())
      .map(([month, values]) => ({
        month,
        sent: parseFloat(values.sent.toFixed(2)),
        received: parseFloat(values.received.toFixed(2)),
      }))
      .reverse();

    setMonthlyData(data);
  };

  const statCards = [
    {
      title: 'Total Sent',
      value: stats.totalSent.toFixed(2),
      icon: ArrowUpRight,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-400',
    },
    {
      title: 'Total Received',
      value: stats.totalReceived.toFixed(2),
      icon: ArrowDownLeft,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Net Flow',
      value: stats.netFlow.toFixed(2),
      icon: stats.netFlow >= 0 ? TrendingUp : TrendingDown,
      color: stats.netFlow >= 0 ? 'from-emerald-500 to-teal-600' : 'from-rose-500 to-pink-600',
      bgColor: stats.netFlow >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
      textColor: stats.netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400',
    },
    {
      title: 'Avg Transaction',
      value: stats.avgTransaction.toFixed(2),
      icon: CreditCard,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/10',
      textColor: 'text-violet-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Spending Analytics</h2>
          <p className="text-gray-400">Track your transaction history and spending patterns</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-violet-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchTransactions}
            disabled={loading}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bgColor} rounded-full blur-2xl`} />
              
              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-4`}>
                  <Icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value} XLM</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Transaction Flow</h3>
          
          {loading || !isMounted ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-gray-500 animate-spin" />
            </div>
          ) : dailySpending.length > 0 ? (
            <div style={{ width: '100%', height: 280, minHeight: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySpending}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="received"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorReceived)"
                  strokeWidth={2}
                  name="Received"
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorSent)"
                  strokeWidth={2}
                  name="Sent"
                />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No transaction data available
            </div>
          )}
        </motion.div>

        {/* Spending by Asset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Spending by Asset</h3>
          
          {loading || !isMounted ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-gray-500 animate-spin" />
            </div>
          ) : categoryData.length > 0 ? (
            <div>
              <div style={{ width: '100%', height: 180, minHeight: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a24',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2 mt-4">
                {categoryData.map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm text-gray-400">{cat.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No spending data
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Monthly Comparison</h3>
        
        {loading || !isMounted ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        ) : monthlyData.length > 0 ? (
          <div style={{ width: '100%', height: 280, minHeight: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="month" 
                stroke="rgba(255,255,255,0.3)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a24',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
                <Bar dataKey="received" fill="#10b981" radius={[4, 4, 0, 0]} name="Received" />
                <Bar dataKey="sent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Sent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No monthly data available
          </div>
        )}
      </motion.div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <Target className="w-5 h-5 text-violet-400" />
            </div>
            <h4 className="font-semibold text-white">Spending Goal</h4>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            {stats.percentChange >= 0 
              ? `Your spending increased by ${Math.abs(stats.percentChange).toFixed(1)}% compared to the previous period.`
              : `Great! You spent ${Math.abs(stats.percentChange).toFixed(1)}% less than the previous period.`
            }
          </p>
          <div className="flex items-center gap-2">
            {stats.percentChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-rose-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            )}
            <span className={stats.percentChange >= 0 ? 'text-rose-400' : 'text-emerald-400'}>
              {Math.abs(stats.percentChange).toFixed(1)}%
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <h4 className="font-semibold text-white">Activity</h4>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            You made {stats.transactionCount} transactions in the selected period.
          </p>
          <p className="text-2xl font-bold text-white">{stats.transactionCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <PiggyBank className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-semibold text-white">Net Position</h4>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            {stats.netFlow >= 0 
              ? 'You received more than you sent!'
              : 'You sent more than you received.'
            }
          </p>
          <p className={`text-2xl font-bold ${stats.netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.netFlow >= 0 ? '+' : ''}{stats.netFlow.toFixed(2)} XLM
          </p>
        </motion.div>
      </div>
    </div>
  );
}
