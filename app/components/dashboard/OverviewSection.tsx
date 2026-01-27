'use client';

import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Send, 
  Upload, 
  Users as UsersIcon,
  DollarSign,
  TrendingDown,
  UserCheck,
  ExternalLink,
  ChevronRight,
  Activity,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useStellarNetworkStats } from '../../hooks/useStellarNetworkStats';
import LiquidityMonitor from './LiquidityMonitor';
import SavingsCalculator from './SavingsCalculator';
import AccountBalance from './AccountBalance';
import XLMPriceChart from './XLMPriceChart';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/app/actions/dashboard-stats';
import { getRecentPayments } from '@/app/actions/recent-payments';

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle: string;
  trend?: string;
  color: string;
  isLoading?: boolean;
}

interface OverviewSectionProps {
  onNavigate?: (section: string) => void;
}

const StatsCard = ({ icon: Icon, label, value, subtitle, trend, color, isLoading }: StatsCardProps) => {
  const isPositive = trend && parseFloat(trend) >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && !isLoading && (
          <span className={`${isPositive ? 'text-emerald-400' : 'text-red-400'} text-sm font-semibold flex items-center gap-1`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm mb-1">{label}</h3>
      {isLoading ? (
        <div className="h-10 bg-slate-700/50 animate-pulse rounded"></div>
      ) : (
        <>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <p className="text-slate-500 text-xs">{subtitle}</p>
        </>
      )}
    </motion.div>
  );
};

interface RecentPayment {
  id: string;
  recipient: string;
  amount: string;
  asset: string;
  date: string;
  txHash: string;
  timeAgo: string;
}

export default function OverviewSection({ onNavigate }: OverviewSectionProps = {}) {
  const { publicKey, network } = useAuthStore();
  const { networkSpeed, baseFee, isLoading, error, lastUpdated } = useStellarNetworkStats(30000);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalSaved: 0,
    activeEmployees: 0,
    totalPaidTrend: 0,
    totalSavedTrend: 0,
    thisMonthTotal: 0,
    lastMonthTotal: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!publicKey) {
        setIsLoadingStats(false);
        return;
      }
      
      setIsLoadingStats(true);
      const result = await getDashboardStats(publicKey);
      
      if (result.data) {
        setStats(result.data);
      }
      setIsLoadingStats(false);
    };

    fetchStats();
    
    // Refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [publicKey]);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!publicKey) {
        setIsLoadingPayments(false);
        setRecentPayments([]);
        return;
      }
      
      setIsLoadingPayments(true);
      const result = await getRecentPayments(publicKey);
      
      if (result.success && result.data) {
        setRecentPayments(result.data);
      }
      setIsLoadingPayments(false);
    };

    fetchPayments();
    
    // Refresh payments every 60 seconds
    const interval = setInterval(fetchPayments, 60000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTrend = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const statsCards = [
    {
      icon: DollarSign,
      label: 'Total Paid',
      value: formatCurrency(stats.totalPaid),
      subtitle: 'Last 30 days',
      trend: formatTrend(stats.totalPaidTrend),
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: TrendingDown,
      label: 'Total Saved (vs SWIFT)',
      value: formatCurrency(stats.totalSaved),
      subtitle: stats.totalSaved > 0 ? '~90% lower fees' : 'No savings yet',
      trend: formatTrend(stats.totalSavedTrend),
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: UserCheck,
      label: 'Active Employees',
      value: stats.activeEmployees.toString(),
      subtitle: stats.activeEmployees === 1 ? '1 team member' : `${stats.activeEmployees} team members`,
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  const handleViewOnLedger = (txHash: string) => {
    const explorerNetwork = network === 'testnet' ? 'testnet' : 'public';
    window.open(`https://stellar.expert/explorer/${explorerNetwork}/tx/${txHash}`, '_blank');
  };

  const handleViewAllTransactions = () => {
    if (onNavigate) {
      onNavigate('history');
    }
  };

  return (
    <div className="space-y-8">
      {/* Network Status (Small) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-4 py-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-slate-400">Network Status</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Network Speed */}
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <span className="text-xs text-slate-500">Speed: </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {isLoading ? '...' : error ? 'Error' : `${networkSpeed}s`}
                </span>
              </div>
            </div>

            {lastUpdated && (
              <span className="text-xs text-slate-500">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Cards - Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Balance Display */}
        <AccountBalance />

        {/* Savings Calculator */}
        <SavingsCalculator />

        {/* Live FX Rate & Liquidity Badge */}
        <LiquidityMonitor />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} isLoading={isLoadingStats} />
        ))}
      </div>

      {/* XLM Price Chart */}
      <XLMPriceChart />

      {/* Recent Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-xl font-bold text-white">Recent Payments</h3>
          <p className="text-slate-400 text-sm mt-1">Your latest transactions on Stellar</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoadingPayments ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <p className="text-slate-400 mt-3">Loading recent payments...</p>
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Send className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No payments yet</p>
              <p className="text-slate-500 text-sm mt-1">Your recent transactions will appear here</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {payment.recipient.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white font-medium">{payment.recipient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-semibold">${payment.amount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {payment.asset}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                      {payment.timeAgo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleViewOnLedger(payment.txHash)}
                        className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors group"
                      >
                        View on Ledger
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* View All Link */}
        {recentPayments.length > 0 && (
          <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/50">
            <button 
              onClick={handleViewAllTransactions}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-2 transition-colors group"
            >
              View all transactions
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Sidebar/Bottom: Base Fee (Small) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-400">Current Base Fee</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-indigo-400">
              {isLoading ? (
                <span className="text-slate-500">Loading...</span>
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : (
                `${baseFee} stroops`
              )}
            </span>
            <span className="text-xs text-slate-500 ml-2">(~$0.00001)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
