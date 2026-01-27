'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';

interface RecentPayment {
  id: string;
  recipient: string;
  amount: string;
  asset: string;
  date: string;
  txHash: string;
  timeAgo: string;
}

export async function getRecentPayments(ownerWallet: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Fetch last 5 successful payments with employee information
    const { data: payments, error } = await supabase
      .from('payouts')
      .select(`
        id,
        amount,
        asset_code,
        transaction_hash,
        created_at,
        employees!inner (
          full_name,
          wallet_address
        )
      `)
      .eq('owner_wallet_address', ownerWallet)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent payments:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }

    if (!payments || payments.length === 0) {
      return {
        success: true,
        data: [],
        error: null
      };
    }

    // Transform the data for the UI
    const recentPayments: RecentPayment[] = payments.map((payment: any) => {
      const createdAt = new Date(payment.created_at);
      const timeAgo = formatTimeAgo(createdAt);
      
      return {
        id: payment.id,
        recipient: payment.employees.full_name,
        amount: parseFloat(payment.amount).toFixed(2),
        asset: payment.asset_code,
        date: createdAt.toISOString(),
        txHash: payment.transaction_hash || '',
        timeAgo
      };
    });

    return {
      success: true,
      data: recentPayments,
      error: null
    };
  } catch (error: any) {
    console.error('Unexpected error in getRecentPayments:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch recent payments'
    };
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return '1d ago';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
