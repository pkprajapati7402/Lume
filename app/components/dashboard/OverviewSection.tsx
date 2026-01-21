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
  Zap
} from 'lucide-react';
import { useStellarNetworkStats } from '../../hooks/useStellarNetworkStats';

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle: string;
  trend?: string;
  color: string;
}

const StatsCard = ({ icon: Icon, label, value, subtitle, trend, color }: StatsCardProps) => (
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
      {trend && (
        <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
          <TrendingDown className="w-4 h-4 rotate-180" />
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm mb-1">{label}</h3>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-slate-500 text-xs">{subtitle}</p>
  </motion.div>
);

interface RecentPayment {
  id: string;
  recipient: string;
  amount: string;
  asset: string;
  date: string;
  txHash: string;
}

export default function OverviewSection() {
  const { networkSpeed, baseFee, isLoading, error, lastUpdated } = useStellarNetworkStats(30000);

  const stats = [
    {
      icon: DollarSign,
      label: 'Total Paid',
      value: '$128,450',
      subtitle: 'Last 30 days',
      trend: '+12.5%',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: TrendingDown,
      label: 'Total Saved (vs SWIFT)',
      value: '$11,560',
      subtitle: '90% lower fees',
      trend: '+15.2%',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: UserCheck,
      label: 'Active Employees',
      value: '48',
      subtitle: 'Across 12 countries',
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  const recentPayments: RecentPayment[] = [
    {
      id: '1',
      recipient: 'John Doe',
      amount: '1,250.00',
      asset: 'USDC',
      date: '2h ago',
      txHash: 'abc123def456'
    },
    {
      id: '2',
      recipient: 'Jane Smith',
      amount: '890.50',
      asset: 'EURT',
      date: '5h ago',
      txHash: 'def789ghi012'
    },
    {
      id: '3',
      recipient: 'Mike Johnson',
      amount: '2,100.00',
      asset: 'USDC',
      date: '1d ago',
      txHash: 'ghi345jkl678'
    },
    {
      id: '4',
      recipient: 'Sarah Williams',
      amount: '750.25',
      asset: 'NGNT',
      date: '1d ago',
      txHash: 'jkl901mno234'
    },
    {
      id: '5',
      recipient: 'David Brown',
      amount: '1,500.00',
      asset: 'USDC',
      date: '2d ago',
      txHash: 'mno567pqr890'
    }
  ];

  const handleViewOnLedger = (txHash: string) => {
    window.open(`https://stellar.expert/explorer/public/tx/${txHash}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Network Stats Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-medium text-slate-300">Stellar Network Status</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            {/* Network Speed */}
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <div className="text-right">
                <div className="text-xs text-slate-500">Ledger Close Time</div>
                <div className="text-sm font-semibold text-white">
                  {isLoading ? (
                    <span className="text-slate-500">Loading...</span>
                  ) : error ? (
                    <span className="text-red-400">Error</span>
                  ) : (
                    <span className="text-emerald-400">{networkSpeed}s</span>
                  )}
                </div>
              </div>
            </div>

            {/* Base Fee */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              <div className="text-right">
                <div className="text-xs text-slate-500">Base Fee</div>
                <div className="text-sm font-semibold text-white">
                  {isLoading ? (
                    <span className="text-slate-500">Loading...</span>
                  ) : error ? (
                    <span className="text-red-400">Error</span>
                  ) : (
                    <span className="text-indigo-400">{baseFee} stroops</span>
                  )}
                </div>
              </div>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-right">
                <div className="text-xs text-slate-500">Updated</div>
                <div className="text-sm font-semibold text-slate-400">
                  {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 text-xs text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>Unable to fetch live network data: {error}</span>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

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
                          {payment.recipient.charAt(0)}
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
                    {payment.date}
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
        </div>

        {/* View All Link */}
        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/50">
          <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-2 transition-colors group">
            View all transactions
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
