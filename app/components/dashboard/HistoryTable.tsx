'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  ExternalLink, 
  RefreshCw,
  Search,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/app/store/authStore';
import { getPayoutHistory } from '@/app/actions/employees';
import * as StellarSdk from '@stellar/stellar-sdk';
import { json2csv } from 'json-2-csv';
import { toast } from 'sonner';

interface StellarTransaction {
  id: string;
  hash: string;
  created_at: string;
  source_account: string;
  fee_charged: string;
  operation_count: number;
  memo?: string;
  successful: boolean;
}

interface PayoutRecord {
  id: string;
  transactionHash: string | null;
  amount: number;
  assetCode: string;
  status: string;
  createdAt: string;
  employeeName: string;
  walletAddress: string;
}

interface EnrichedTransaction extends StellarTransaction {
  employeeName?: string;
  amount?: number;
  assetCode?: string;
  payoutStatus?: string;
}

export default function HistoryTable() {
  const { publicKey, network } = useAuthStore();
  const [transactions, setTransactions] = useState<EnrichedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    if (publicKey) {
      fetchTransactionHistory();
    }
  }, [publicKey, network]);

  const fetchTransactionHistory = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch from Stellar Horizon API
      const horizonUrl = network === 'mainnet'
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org';
      
      const server = new StellarSdk.Horizon.Server(horizonUrl);
      
      // Get transactions for the account
      const txResponse = await server
        .transactions()
        .forAccount(publicKey)
        .order('desc')
        .limit(50)
        .call();

      const stellarTxs: StellarTransaction[] = txResponse.records.map((tx: any) => ({
        id: tx.id,
        hash: tx.hash,
        created_at: tx.created_at,
        source_account: tx.source_account,
        fee_charged: tx.fee_charged,
        operation_count: tx.operation_count,
        memo: tx.memo,
        successful: tx.successful,
      }));

      // Fetch payout records from Supabase
      const { data: payouts, error: payoutsError } = await getPayoutHistory(publicKey);
      
      if (payoutsError) {
        console.warn('Could not fetch payout records:', payoutsError);
      }

      // Create a map of transaction hash to payout data
      const payoutMap = new Map<string, PayoutRecord>();
      payouts?.forEach(payout => {
        if (payout.transactionHash) {
          payoutMap.set(payout.transactionHash, payout);
        }
      });

      // Enrich Stellar transactions with payout data
      const enriched: EnrichedTransaction[] = stellarTxs.map(tx => {
        const payout = payoutMap.get(tx.hash);
        return {
          ...tx,
          employeeName: payout?.employeeName,
          amount: payout?.amount,
          assetCode: payout?.assetCode,
          payoutStatus: payout?.status,
        };
      });

      setTransactions(enriched);
    } catch (err: any) {
      console.error('Failed to fetch transaction history:', err);
      setError(err.message || 'Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No Transactions', {
        description: 'There are no transactions to export',
      });
      return;
    }

    const csvData = filteredTransactions.map(tx => ({
      'Transaction Hash': tx.hash,
      'Date': new Date(tx.created_at).toLocaleString(),
      'Employee Name': tx.employeeName || 'N/A',
      'Amount': tx.amount || 'N/A',
      'Asset': tx.assetCode || 'N/A',
      'Status': tx.successful ? 'Success' : 'Failed',
      'Fee (Stroops)': tx.fee_charged,
      'Operations': tx.operation_count,
      'Memo': tx.memo || '',
    }));

    try {
      const csv = json2csv(csvData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lume_transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV Exported', {
        description: `${filteredTransactions.length} transactions exported successfully`,
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Export Failed', {
        description: 'Failed to export CSV file. Please try again.',
      });
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.assetCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'success' && tx.successful) ||
      (filterStatus === 'failed' && !tx.successful);

    return matchesSearch && matchesFilter;
  });

  const StatusIcon = ({ successful }: { successful: boolean }) => {
    if (successful) {
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  // Calculate statistics
  const stats = {
    total: transactions.length,
    successful: transactions.filter(tx => tx.successful).length,
    failed: transactions.filter(tx => !tx.successful).length,
    totalAmount: transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Transaction History</h2>
        <p className="text-slate-400">View and export your payment transaction records</p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Successful</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.successful}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-white">${stats.totalAmount.toFixed(2)}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
      >
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hash, employee, or asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex gap-3 flex-wrap">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'success' | 'failed')}
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="success">Success Only</option>
              <option value="failed">Failed Only</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchTransactionHistory}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Transaction Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-slate-400">Loading transaction history...</p>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium mb-1">No transactions found</p>
              <p className="text-slate-500 text-sm">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Start making payments to see your transaction history'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredTransactions.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusIcon successful={tx.successful} />
                        <span className={`text-sm font-medium ${
                          tx.successful ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {tx.successful ? 'Success' : 'Failed'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">
                        {tx.employeeName || 'Unknown'}
                      </div>
                      {tx.employeeName && (
                        <div className="text-xs text-slate-500 font-mono">
                          {tx.source_account.substring(0, 8)}...{tx.source_account.substring(tx.source_account.length - 8)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.amount && tx.assetCode ? (
                        <div className="text-sm">
                          <span className="text-white font-medium">{tx.amount.toFixed(2)}</span>
                          <span className="text-slate-400 ml-1">{tx.assetCode}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">
                          {tx.operation_count} op{tx.operation_count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-400">
                        {(parseInt(tx.fee_charged) / 10000000).toFixed(5)} XLM
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`https://stellar.expert/explorer/${network}/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                      >
                        <span className="font-mono">
                          {tx.hash.substring(0, 8)}...
                        </span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Results Count */}
      {!isLoading && filteredTransactions.length > 0 && (
        <p className="text-center text-sm text-slate-400">
          Showing {filteredTransactions.length} of {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
