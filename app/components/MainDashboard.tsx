'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Send,
  Download,
  Settings,
  LogOut
} from 'lucide-react';

export default function MainDashboard() {
  const { publicKey, setGuest } = useAuthStore();

  const handleDisconnect = () => {
    setGuest();
  };

  const stats = [
    {
      icon: DollarSign,
      label: 'Total Sent',
      value: '$45,231',
      change: '+12.5%',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      label: 'Team Members',
      value: '24',
      change: '+3',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      label: 'Pending',
      value: '5',
      change: '-2',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: TrendingUp,
      label: 'Savings',
      value: '$4,052',
      change: '90% fees',
      color: 'from-orange-500 to-yellow-500'
    },
  ];

  const recentTransactions = [
    { id: 1, recipient: 'John Doe', amount: '$1,250', status: 'Completed', time: '2 hours ago' },
    { id: 2, recipient: 'Jane Smith', amount: '$890', status: 'Completed', time: '5 hours ago' },
    { id: 3, recipient: 'Mike Johnson', amount: '$2,100', status: 'Pending', time: '1 day ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <Wallet className="w-4 h-4 text-purple-400" />
              <span className="text-slate-300 text-sm font-mono">
                {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Disconnect"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back! 👋
            </h2>
            <p className="text-slate-400">
              Here's what's happening with your global payroll today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-emerald-400 text-sm font-semibold">
                    {stat.change}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <button className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl p-6 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/25">
              <Send className="w-8 h-8 text-white mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Send Payment</h3>
              <p className="text-purple-100 text-sm">Pay a team member instantly</p>
            </button>

            <button className="group bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 rounded-xl p-6 transition-all duration-300 hover:scale-105">
              <Download className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Bulk Upload</h3>
              <p className="text-slate-400 text-sm">Upload CSV for mass payments</p>
            </button>

            <button className="group bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 rounded-xl p-6 transition-all duration-300 hover:scale-105">
              <Settings className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Settings</h3>
              <p className="text-slate-400 text-sm">Manage your preferences</p>
            </button>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {transaction.recipient.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{transaction.recipient}</p>
                      <p className="text-slate-400 text-sm">{transaction.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{transaction.amount}</p>
                    <span
                      className={`text-sm ${
                        transaction.status === 'Completed'
                          ? 'text-emerald-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
