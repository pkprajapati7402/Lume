'use client';

import { createClient } from './supabase';
import type {
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  EmployeeTransaction,
  EmployeeTransactionInsert,
  SpendingCategory,
  SpendingCategoryInsert,
  SavingsGoal,
  SavingsGoalInsert,
  SavingsGoalUpdate,
  LiquidityInvestment,
  LiquidityInvestmentInsert,
  Contact,
  ContactInsert,
  ContactUpdate,
  Notification,
  UserRoleType,
} from '@/types/database';

// Create supabase client instance
const supabase = createClient();

// ============================================
// USER PROFILES
// ============================================

/**
 * Get or create a user profile for a wallet address
 */
export async function getOrCreateUserProfile(
  walletAddress: string,
  defaultRole: UserRoleType = 'employee'
): Promise<UserProfile | null> {
  // First try to get existing profile
  const { data: existing, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (existing) return existing;

  // Create new profile if doesn't exist
  if (fetchError?.code === 'PGRST116') {
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        wallet_address: walletAddress,
        user_role: defaultRole,
      } as UserProfileInsert)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return null;
    }
    return newProfile;
  }

  console.error('Error fetching user profile:', fetchError);
  return null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  walletAddress: string,
  updates: UserProfileUpdate
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('wallet_address', walletAddress)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
  return data;
}

/**
 * Update user role
 */
export async function updateUserRole(
  walletAddress: string,
  role: UserRoleType
): Promise<boolean> {
  const result = await updateUserProfile(walletAddress, { user_role: role });
  return result !== null;
}

// ============================================
// EMPLOYEE TRANSACTIONS
// ============================================

/**
 * Record a new employee transaction
 */
export async function recordEmployeeTransaction(
  transaction: EmployeeTransactionInsert
): Promise<EmployeeTransaction | null> {
  const { data, error } = await supabase
    .from('employee_transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error('Error recording transaction:', error);
    return null;
  }
  return data;
}

/**
 * Get employee transactions for a wallet
 */
export async function getEmployeeTransactions(
  walletAddress: string,
  options?: {
    limit?: number;
    offset?: number;
    category?: string;
    status?: 'pending' | 'success' | 'failed';
  }
): Promise<EmployeeTransaction[]> {
  let query = supabase
    .from('employee_transactions')
    .select('*')
    .eq('sender_wallet_address', walletAddress)
    .order('created_at', { ascending: false });

  if (options?.category) {
    query = query.eq('category', options.category);
  }
  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data || [];
}

/**
 * Get incoming payments (where user is recipient)
 */
export async function getIncomingPayments(
  walletAddress: string,
  limit = 20
): Promise<EmployeeTransaction[]> {
  const { data, error } = await supabase
    .from('employee_transactions')
    .select('*')
    .eq('recipient_wallet_address', walletAddress)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching incoming payments:', error);
    return [];
  }
  return data || [];
}

/**
 * Get transaction statistics for a wallet
 */
export async function getTransactionStats(walletAddress: string): Promise<{
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
  categoryBreakdown: Record<string, number>;
}> {
  // Get sent transactions
  const { data: sentTx, error: sentError } = await supabase
    .from('employee_transactions')
    .select('amount, category')
    .eq('sender_wallet_address', walletAddress)
    .eq('status', 'success');

  // Get received transactions
  const { data: receivedTx, error: receivedError } = await supabase
    .from('employee_transactions')
    .select('amount')
    .eq('recipient_wallet_address', walletAddress)
    .eq('status', 'success');

  if (sentError || receivedError) {
    console.error('Error fetching transaction stats:', sentError || receivedError);
    return { totalSent: 0, totalReceived: 0, transactionCount: 0, categoryBreakdown: {} };
  }

  const totalSent = sentTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const totalReceived = receivedTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const transactionCount = (sentTx?.length || 0) + (receivedTx?.length || 0);

  const categoryBreakdown: Record<string, number> = {};
  sentTx?.forEach((tx) => {
    categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
  });

  return { totalSent, totalReceived, transactionCount, categoryBreakdown };
}

// ============================================
// SPENDING CATEGORIES
// ============================================

/**
 * Get spending categories (including defaults)
 */
export async function getSpendingCategories(
  walletAddress: string
): Promise<SpendingCategory[]> {
  const { data, error } = await supabase
    .from('spending_categories')
    .select('*')
    .or(`wallet_address.eq.${walletAddress},wallet_address.eq._system_`)
    .order('is_default', { ascending: false })
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

/**
 * Create a custom spending category
 */
export async function createSpendingCategory(
  category: SpendingCategoryInsert
): Promise<SpendingCategory | null> {
  const { data, error } = await supabase
    .from('spending_categories')
    .insert(category)
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return null;
  }
  return data;
}

// ============================================
// SAVINGS GOALS
// ============================================

/**
 * Get all savings goals for a wallet
 */
export async function getSavingsGoals(walletAddress: string): Promise<SavingsGoal[]> {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('wallet_address', walletAddress)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching savings goals:', error);
    return [];
  }
  return data || [];
}

/**
 * Create a new savings goal
 */
export async function createSavingsGoal(
  goal: SavingsGoalInsert
): Promise<SavingsGoal | null> {
  const { data, error } = await supabase
    .from('savings_goals')
    .insert(goal)
    .select()
    .single();

  if (error) {
    console.error('Error creating savings goal:', error);
    return null;
  }
  return data;
}

/**
 * Update savings goal progress
 */
export async function updateSavingsGoal(
  goalId: string,
  updates: SavingsGoalUpdate
): Promise<SavingsGoal | null> {
  const { data, error } = await supabase
    .from('savings_goals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    console.error('Error updating savings goal:', error);
    return null;
  }
  return data;
}

/**
 * Delete a savings goal
 */
export async function deleteSavingsGoal(goalId: string): Promise<boolean> {
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    console.error('Error deleting savings goal:', error);
    return false;
  }
  return true;
}

// ============================================
// LIQUIDITY INVESTMENTS
// ============================================

/**
 * Get all liquidity investments for a wallet
 */
export async function getLiquidityInvestments(
  walletAddress: string
): Promise<LiquidityInvestment[]> {
  const { data, error } = await supabase
    .from('liquidity_investments')
    .select('*')
    .eq('wallet_address', walletAddress)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching liquidity investments:', error);
    return [];
  }
  return data || [];
}

/**
 * Record a new liquidity investment
 */
export async function recordLiquidityInvestment(
  investment: LiquidityInvestmentInsert
): Promise<LiquidityInvestment | null> {
  const { data, error } = await supabase
    .from('liquidity_investments')
    .insert(investment)
    .select()
    .single();

  if (error) {
    console.error('Error recording investment:', error);
    return null;
  }
  return data;
}

/**
 * Mark investment as withdrawn
 */
export async function withdrawLiquidityInvestment(
  investmentId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('liquidity_investments')
    .update({
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString(),
    })
    .eq('id', investmentId);

  if (error) {
    console.error('Error withdrawing investment:', error);
    return false;
  }
  return true;
}

// ============================================
// CONTACTS
// ============================================

/**
 * Get all contacts for a wallet
 */
export async function getContacts(
  walletAddress: string,
  favoritesOnly = false
): Promise<Contact[]> {
  let query = supabase
    .from('contacts')
    .select('*')
    .eq('owner_wallet_address', walletAddress)
    .order('is_favorite', { ascending: false })
    .order('payment_count', { ascending: false });

  if (favoritesOnly) {
    query = query.eq('is_favorite', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
  return data || [];
}

/**
 * Add a new contact
 */
export async function addContact(contact: ContactInsert): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact)
    .select()
    .single();

  if (error) {
    console.error('Error adding contact:', error);
    return null;
  }
  return data;
}

/**
 * Update a contact
 */
export async function updateContact(
  contactId: string,
  updates: ContactUpdate
): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', contactId)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact:', error);
    return null;
  }
  return data;
}

/**
 * Delete a contact
 */
export async function deleteContact(contactId: string): Promise<boolean> {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId);

  if (error) {
    console.error('Error deleting contact:', error);
    return false;
  }
  return true;
}

/**
 * Increment payment count for a contact
 */
export async function incrementContactPaymentCount(
  ownerWallet: string,
  contactWallet: string
): Promise<void> {
  const { data: existing } = await supabase
    .from('contacts')
    .select('id, payment_count')
    .eq('owner_wallet_address', ownerWallet)
    .eq('contact_wallet_address', contactWallet)
    .single();

  if (existing) {
    await supabase
      .from('contacts')
      .update({
        payment_count: (existing.payment_count || 0) + 1,
        last_payment_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Get notifications for a wallet
 */
export async function getNotifications(
  walletAddress: string,
  unreadOnly = false,
  limit = 50
): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('wallet_address', walletAddress)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data || [];
}

/**
 * Create a notification
 */
export async function createNotification(
  walletAddress: string,
  title: string,
  message: string,
  type: 'payment_received' | 'payment_sent' | 'goal_reached' | 'investment_update' | 'system' = 'system',
  metadata?: Record<string, unknown>
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      wallet_address: walletAddress,
      title,
      message,
      type,
      metadata: metadata || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }
  return data;
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification read:', error);
    return false;
  }
  return true;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(walletAddress: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('wallet_address', walletAddress);

  if (error) {
    console.error('Error marking all notifications read:', error);
    return false;
  }
  return true;
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(walletAddress: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('wallet_address', walletAddress)
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching notification count:', error);
    return 0;
  }
  return count || 0;
}
