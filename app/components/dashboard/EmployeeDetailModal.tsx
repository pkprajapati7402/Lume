'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Employee } from '@/types/database';
import type { NetworkType } from '@/app/store/authStore';
import { json2csv } from 'json-2-csv';

interface EmployeeTransaction {
  id: string;
  transaction_hash: string;
  amount: number;
  asset_code: string;
  status: string;
  created_at: string;
}

interface EmployeeDetailModalProps {
  employee: Employee;
  network: NetworkType;
  onClose: () => void;
}

export default function EmployeeDetailModal({ employee, network, onClose }: EmployeeDetailModalProps) {
  const [transactions, setTransactions] = useState<EmployeeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchTransactions();
  }, [employee.id]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('payouts')
        .select('id, transaction_hash, amount, asset_code, status, created_at')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to Load Transactions', {
        description: 'Could not fetch transaction history',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(tx => {
      // Status filter
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          tx.transaction_hash.toLowerCase().includes(query) ||
          tx.asset_code.toLowerCase().includes(query) ||
          tx.amount.toString().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate stats
  const totalPaid = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const successfulTxs = transactions.filter(tx => tx.status === 'success').length;
  const averagePayment = transactions.length > 0 ? totalPaid / transactions.length : 0;

  // Export to CSV
  const handleExport = async () => {
    try {
      const exportData = filteredTransactions.map(tx => ({
        Date: new Date(tx.created_at).toLocaleString(),
        'Transaction Hash': tx.transaction_hash,
        Amount: tx.amount,
        Asset: tx.asset_code,
        Status: tx.status,
      }));

      const csv = json2csv(exportData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${employee.full_name.replace(/\s+/g, '_')}_transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Export Successful', {
        description: `${filteredTransactions.length} transactions exported`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export Failed', {
        description: 'Could not export transactions',
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{employee.full_name}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="font-mono">{employee.wallet_address.slice(0, 8)}...{employee.wallet_address.slice(-8)}</span>
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded border border-purple-500/30">
                    {employee.role}
                  </span>
                  <span className="px-2 py-1 bg-cyan-600/20 text-cyan-300 rounded border border-cyan-500/30">
                    {employee.department}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-400">Total Paid</span>
                </div>
                <p className="text-2xl font-bold text-white">${totalPaid.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-pink-400" />
                  <span className="text-xs text-slate-400">Transactions</span>
                </div>
                <p className="text-2xl font-bold text-white">{transactions.length}</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-400">Average</span>
                </div>
                <p className="text-2xl font-bold text-white">${averagePayment.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="p-6 border-b border-slate-700 bg-slate-800/50">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="success">Success Only</option>
                <option value="failed">Failed Only</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white hover:bg-slate-800 transition-colors"
              >
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>

              {/* Export */}
              <button
                onClick={handleExport}
                disabled={filteredTransactions.length === 0}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Results count */}
            <div className="mt-3 text-sm text-slate-400">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          </div>

          {/* Transaction List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Transactions Found</h3>
                <p className="text-slate-400">
                  {transactions.length === 0 
                    ? 'No payment history for this employee yet'
                    : 'No transactions match your filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.status === 'success' 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {tx.status}
                          </span>
                          <span className="text-slate-400 text-sm">
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="font-mono text-xs">
                            {tx.transaction_hash.slice(0, 12)}...{tx.transaction_hash.slice(-12)}
                          </span>
                          <a
                            href={`https://stellar.expert/explorer/${network}/tx/${tx.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          ${tx.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-400">{tx.asset_code}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
