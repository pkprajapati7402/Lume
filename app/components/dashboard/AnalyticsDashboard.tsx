'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  RefreshCw,
  Award,
  Building2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { NetworkType } from '@/app/store/authStore';

interface AnalyticsProps {
  publicKey: string;
  network: NetworkType;
}

interface PayoutRecord {
  id: string;
  sender_wallet: string;
  recipient_wallet: string;
  recipient_name: string | null;
  amount: string;
  asset_code: string;
  status: string;
  transaction_hash: string;
  created_at: string;
  department?: string;
}

interface SpendingByAsset {
  asset: string;
  total: number;
  count: number;
}

interface SpendingTrend {
  date: string;
  amount: number;
  count: number;
}

interface TopEmployee {
  name: string;
  wallet: string;
  total: number;
  payments: number;
  department?: string;
}

interface DepartmentSpending {
  department: string;
  total: number;
  count: number;
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsDashboard({ publicKey, network }: AnalyticsProps) {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [spendingByAsset, setSpendingByAsset] = useState<SpendingByAsset[]>([]);
  const [spendingTrend, setSpendingTrend] = useState<SpendingTrend[]>([]);
  const [topEmployees, setTopEmployees] = useState<TopEmployee[]>([]);
  const [departmentSpending, setDepartmentSpending] = useState<DepartmentSpending[]>([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalPayments: 0,
    avgPayment: 0,
    uniqueEmployees: 0,
    thisMonthSpent: 0,
    lastMonthSpent: 0,
    percentageChange: 0,
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch payouts from last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: payoutData, error: payoutError } = await supabase
        .from('payouts')
        .select('*')
        .eq('sender_wallet', publicKey)
        .eq('status', 'success')
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (payoutError) {
        console.error('Error fetching payouts:', payoutError);
        throw payoutError;
      }

      // Fetch employees to get department info
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('wallet_address, department')
        .eq('owner_wallet_address', publicKey);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
      }

      // Create a map of wallet addresses to departments
      const employeeDepartments = new Map(
        (employeesData || []).map((emp: any) => [emp.wallet_address, emp.department])
      );

      // Merge payout data with department info
      const payoutsWithDept = (payoutData || []).map((p: any) => ({
        ...p,
        department: employeeDepartments.get(p.recipient_wallet) || 'Unknown',
      }));

      setPayouts(payoutsWithDept);
      calculateAnalytics(payoutsWithDept);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty state on error
      setPayouts([]);
      calculateAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (data: PayoutRecord[]) => {
    if (data.length === 0) {
      setStats({
        totalSpent: 0,
        totalPayments: 0,
        avgPayment: 0,
        uniqueEmployees: 0,
        thisMonthSpent: 0,
        lastMonthSpent: 0,
        percentageChange: 0,
      });
      return;
    }

    // Calculate total spent
    const totalSpent = data.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalPayments = data.length;
    const avgPayment = totalSpent / totalPayments;

    // Calculate unique employees
    const uniqueEmployees = new Set(data.map((p) => p.recipient_wallet)).size;

    // Calculate this month vs last month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthSpent = data
      .filter((p) => new Date(p.created_at) >= thisMonthStart)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const lastMonthSpent = data
      .filter(
        (p) =>
          new Date(p.created_at) >= lastMonthStart &&
          new Date(p.created_at) < thisMonthStart
      )
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const percentageChange =
      lastMonthSpent > 0 ? ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100 : 0;

    setStats({
      totalSpent,
      totalPayments,
      avgPayment,
      uniqueEmployees,
      thisMonthSpent,
      lastMonthSpent,
      percentageChange,
    });

    // Calculate spending by asset
    const assetMap = new Map<string, { total: number; count: number }>();
    data.forEach((p) => {
      const current = assetMap.get(p.asset_code) || { total: 0, count: 0 };
      assetMap.set(p.asset_code, {
        total: current.total + parseFloat(p.amount),
        count: current.count + 1,
      });
    });
    const assetData = Array.from(assetMap.entries()).map(([asset, { total, count }]) => ({
      asset,
      total: parseFloat(total.toFixed(2)),
      count,
    }));
    setSpendingByAsset(assetData);

    // Calculate spending trend (daily for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPayouts = data.filter((p) => new Date(p.created_at) >= thirtyDaysAgo);

    const trendMap = new Map<string, { amount: number; count: number }>();
    recentPayouts.forEach((p) => {
      const date = new Date(p.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const current = trendMap.get(date) || { amount: 0, count: 0 };
      trendMap.set(date, {
        amount: current.amount + parseFloat(p.amount),
        count: current.count + 1,
      });
    });

    const trendData = Array.from(trendMap.entries())
      .map(([date, { amount, count }]) => ({
        date,
        amount: parseFloat(amount.toFixed(2)),
        count,
      }))
      .slice(-14); // Last 14 days
    setSpendingTrend(trendData);

    // Calculate top employees
    const employeeMap = new Map<
      string,
      { name: string; total: number; payments: number; department: string }
    >();
    data.forEach((p) => {
      const key = p.recipient_wallet;
      const current = employeeMap.get(key) || {
        name: p.recipient_name || 'Unknown',
        total: 0,
        payments: 0,
        department: p.department || 'Unknown',
      };
      employeeMap.set(key, {
        name: p.recipient_name || 'Unknown',
        total: current.total + parseFloat(p.amount),
        payments: current.payments + 1,
        department: p.department || 'Unknown',
      });
    });

    const topEmp = Array.from(employeeMap.entries())
      .map(([wallet, { name, total, payments, department }]) => ({
        wallet,
        name,
        total: parseFloat(total.toFixed(2)),
        payments,
        department,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    setTopEmployees(topEmp);

    // Calculate department spending
    const deptMap = new Map<string, { total: number; count: number }>();
    data.forEach((p) => {
      const dept = p.department || 'Unknown';
      const current = deptMap.get(dept) || { total: 0, count: 0 };
      deptMap.set(dept, {
        total: current.total + parseFloat(p.amount),
        count: current.count + 1,
      });
    });

    const deptData = Array.from(deptMap.entries())
      .map(([department, { total, count }]) => ({
        department,
        total: parseFloat(total.toFixed(2)),
        count,
      }))
      .sort((a, b) => b.total - a.total);
    setDepartmentSpending(deptData);
  };

  useEffect(() => {
    if (publicKey) {
      fetchAnalytics();
    }
  }, [publicKey, network]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
          <p className="text-gray-400">
            Make some payments to see detailed analytics and spending trends
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h2>
          <p className="text-gray-400">Comprehensive spending insights and trends</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
                   flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm 
                   border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-purple-400" />
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Spent (90d)</p>
              <p className="text-2xl font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Avg:</span>
            <span className="text-purple-300 font-medium">${stats.avgPayment.toFixed(2)}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-sm 
                   border border-pink-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-pink-400" />
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Payments</p>
              <p className="text-2xl font-bold text-white">{stats.totalPayments}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Employees:</span>
            <span className="text-pink-300 font-medium">{stats.uniqueEmployees}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 backdrop-blur-sm 
                   border border-cyan-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            <div className="text-right">
              <p className="text-sm text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-white">${stats.thisMonthSpent.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {stats.percentageChange >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">
                  +{stats.percentageChange.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium">
                  {stats.percentageChange.toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-gray-400">vs last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm 
                   border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-green-400" />
            <div className="text-right">
              <p className="text-sm text-gray-400">Last Month</p>
              <p className="text-2xl font-bold text-white">${stats.lastMonthSpent.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Active Employees:</span>
            <span className="text-green-300 font-medium">{stats.uniqueEmployees}</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Spending Trend (Last 14 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Spending by Asset (Pie Chart) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-pink-400" />
            Spending by Asset
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingByAsset}
                dataKey="total"
                nameKey="asset"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: $${value}`}
              >
                {spendingByAsset.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Department Spending Chart */}
      {departmentSpending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Department Spending
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentSpending}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="department" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Bar dataKey="total" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Top Employees Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Top 10 Employees by Total Payments
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/10">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Employee</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium text-right">Total Paid</th>
                <th className="pb-3 font-medium text-right">Payments</th>
                <th className="pb-3 font-medium text-right">Avg</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {topEmployees.map((emp, index) => (
                <tr
                  key={emp.wallet}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3">
                    {index === 0 ? (
                      <span className="text-yellow-400 font-bold">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-gray-300 font-bold">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-orange-400 font-bold">🥉</span>
                    ) : (
                      <span className="text-gray-500">{index + 1}</span>
                    )}
                  </td>
                  <td className="py-3 font-medium text-white">{emp.name}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-sm">
                      {emp.department}
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold text-green-400">
                    ${emp.total.toFixed(2)}
                  </td>
                  <td className="py-3 text-right">{emp.payments}</td>
                  <td className="py-3 text-right text-gray-400">
                    ${(emp.total / emp.payments).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
