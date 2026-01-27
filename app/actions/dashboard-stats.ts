'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';

interface Transaction {
  amount: string;
  created_at: string;
  status: string;
}

interface DashboardStats {
  totalPaid: number;
  totalSaved: number;
  activeEmployees: number;
  totalPaidTrend: number;
  totalSavedTrend: number;
  lastMonthTotal: number;
  thisMonthTotal: number;
}

/**
 * Get comprehensive dashboard statistics
 * Calculates total paid, savings vs wire transfers, employee count, and trends
 */
export async function getDashboardStats(
  ownerWallet: string
): Promise<{ data: DashboardStats | null; error: string | null }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Fetch all successful transactions for the last 60 days
    const { data: allTransactions, error: txError } = await supabase
      .from('payouts')
      .select('amount, created_at, status')
      .eq('owner_wallet', ownerWallet)
      .eq('status', 'success')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });
    
    if (txError) {
      console.error('Error fetching transactions:', txError);
      return { data: null, error: txError.message };
    }
    
    // Fetch active employees count
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id')
      .eq('owner_wallet', ownerWallet);
    
    if (empError) {
      console.error('Error fetching employees:', empError);
      return { data: null, error: empError.message };
    }
    
    // Calculate stats
    const transactions: Transaction[] = (allTransactions as Transaction[]) || [];
    const activeEmployees = employees?.length || 0;
    
    // Calculate total paid in last 30 days
    const last30DaysTransactions = transactions.filter((tx: Transaction) => 
      new Date(tx.created_at) >= thirtyDaysAgo
    );
    const totalPaid = last30DaysTransactions.reduce((sum: number, tx: Transaction) => sum + parseFloat(tx.amount), 0);
    
    // Calculate total paid in previous 30 days (30-60 days ago)
    const previous30DaysTransactions = transactions.filter((tx: Transaction) => {
      const txDate = new Date(tx.created_at);
      return txDate >= sixtyDaysAgo && txDate < thirtyDaysAgo;
    });
    const previousPeriodTotal = previous30DaysTransactions.reduce((sum: number, tx: Transaction) => sum + parseFloat(tx.amount), 0);
    
    // Calculate savings vs traditional wire transfer (assuming 5% fee + $40 per transaction)
    const stellarFeePerTx = 0.00001; // ~$0.00001 in XLM
    const wireFeePercentage = 0.05; // 5%
    const wireFeeFlat = 40; // $40 flat fee
    
    const stellarTotalFees = last30DaysTransactions.length * stellarFeePerTx;
    const wireTotalFees = last30DaysTransactions.reduce((sum: number, tx: Transaction) => {
      const amount = parseFloat(tx.amount);
      return sum + (amount * wireFeePercentage) + wireFeeFlat;
    }, 0);
    
    const totalSaved = wireTotalFees - stellarTotalFees;
    
    // Calculate previous period savings for trend
    const previousStellarFees = previous30DaysTransactions.length * stellarFeePerTx;
    const previousWireFees = previous30DaysTransactions.reduce((sum: number, tx: Transaction) => {
      const amount = parseFloat(tx.amount);
      return sum + (amount * wireFeePercentage) + wireFeeFlat;
    }, 0);
    const previousSaved = previousWireFees - previousStellarFees;
    
    // Calculate trends (percentage change)
    const totalPaidTrend = previousPeriodTotal > 0
      ? ((totalPaid - previousPeriodTotal) / previousPeriodTotal) * 100
      : totalPaid > 0 ? 100 : 0;
    
    const totalSavedTrend = previousSaved > 0
      ? ((totalSaved - previousSaved) / previousSaved) * 100
      : totalSaved > 0 ? 100 : 0;
    
    // Calculate this month and last month totals
    const thisMonthTransactions = transactions.filter((tx: Transaction) => 
      new Date(tx.created_at) >= startOfThisMonth
    );
    const thisMonthTotal = thisMonthTransactions.reduce((sum: number, tx: Transaction) => sum + parseFloat(tx.amount), 0);
    
    const lastMonthTransactions = transactions.filter((tx: Transaction) => {
      const txDate = new Date(tx.created_at);
      return txDate >= startOfLastMonth && txDate <= endOfLastMonth;
    });
    const lastMonthTotal = lastMonthTransactions.reduce((sum: number, tx: Transaction) => sum + parseFloat(tx.amount), 0);
    
    return {
      data: {
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalSaved: Math.round(totalSaved * 100) / 100,
        activeEmployees,
        totalPaidTrend: Math.round(totalPaidTrend * 10) / 10,
        totalSavedTrend: Math.round(totalSavedTrend * 10) / 10,
        thisMonthTotal: Math.round(thisMonthTotal * 100) / 100,
        lastMonthTotal: Math.round(lastMonthTotal * 100) / 100,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error calculating dashboard stats:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to calculate stats',
    };
  }
}
