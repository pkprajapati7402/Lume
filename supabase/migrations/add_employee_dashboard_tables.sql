-- Migration: Add Employee Dashboard Support
-- This migration adds tables and columns to support the employee dashboard features
-- Run this after the initial schema setup

BEGIN;

-- ============================================
-- 1. USER PROFILES TABLE
-- Stores user role and preferences
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE, -- User's Stellar wallet address
  user_role TEXT NOT NULL CHECK (user_role IN ('employer', 'employee')) DEFAULT 'employee',
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  notification_preferences JSONB DEFAULT '{"email": false, "push": false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast wallet lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet ON public.user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(user_role);

-- ============================================
-- 2. EMPLOYEE TRANSACTIONS TABLE
-- Tracks all transactions initiated by employees (sending money)
-- ============================================
CREATE TABLE IF NOT EXISTS public.employee_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_wallet_address TEXT NOT NULL, -- Employee's wallet who sent the payment
  recipient_wallet_address TEXT NOT NULL, -- Who received the payment
  recipient_name TEXT, -- Optional name for the recipient
  amount NUMERIC(20, 7) NOT NULL, -- Stellar uses 7 decimal places
  asset_code TEXT NOT NULL DEFAULT 'XLM',
  asset_issuer TEXT, -- Null for native XLM
  transaction_hash TEXT, -- Stellar transaction hash
  memo TEXT, -- Optional memo
  category TEXT DEFAULT 'other', -- Spending category
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  network TEXT NOT NULL CHECK (network IN ('testnet', 'mainnet')) DEFAULT 'testnet',
  fee_amount NUMERIC(20, 7), -- Transaction fee paid
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for employee transaction queries
CREATE INDEX IF NOT EXISTS idx_emp_tx_sender ON public.employee_transactions(sender_wallet_address);
CREATE INDEX IF NOT EXISTS idx_emp_tx_recipient ON public.employee_transactions(recipient_wallet_address);
CREATE INDEX IF NOT EXISTS idx_emp_tx_status ON public.employee_transactions(status);
CREATE INDEX IF NOT EXISTS idx_emp_tx_category ON public.employee_transactions(category);
CREATE INDEX IF NOT EXISTS idx_emp_tx_created ON public.employee_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emp_tx_asset ON public.employee_transactions(asset_code);

-- ============================================
-- 3. SPENDING CATEGORIES TABLE
-- Custom spending categories for employees
-- ============================================
CREATE TABLE IF NOT EXISTS public.spending_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL, -- Owner of this category
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁', -- Emoji or icon identifier
  color TEXT DEFAULT '#8b5cf6', -- Hex color for UI
  budget_limit NUMERIC(20, 2), -- Optional monthly budget limit
  is_default BOOLEAN DEFAULT false, -- System default categories
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(wallet_address, name)
);

-- Index for category lookups
CREATE INDEX IF NOT EXISTS idx_spending_categories_wallet ON public.spending_categories(wallet_address);

-- ============================================
-- 4. SAVINGS GOALS TABLE
-- Employee savings goals tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(20, 2) NOT NULL,
  current_amount NUMERIC(20, 2) DEFAULT 0,
  asset_code TEXT DEFAULT 'XLM',
  target_date DATE,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#10b981',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for savings goals
CREATE INDEX IF NOT EXISTS idx_savings_goals_wallet ON public.savings_goals(wallet_address);
CREATE INDEX IF NOT EXISTS idx_savings_goals_completed ON public.savings_goals(is_completed);

-- ============================================
-- 5. LIQUIDITY POOL INVESTMENTS TABLE
-- Track employee investments in Stellar liquidity pools
-- ============================================
CREATE TABLE IF NOT EXISTS public.liquidity_investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  pool_id TEXT NOT NULL, -- Stellar liquidity pool ID
  pool_name TEXT NOT NULL, -- e.g., "XLM/USDC"
  asset_a_code TEXT NOT NULL,
  asset_b_code TEXT NOT NULL,
  shares_amount NUMERIC(20, 7) NOT NULL, -- Pool shares owned
  deposit_amount_a NUMERIC(20, 7), -- Amount of asset A deposited
  deposit_amount_b NUMERIC(20, 7), -- Amount of asset B deposited
  deposit_transaction_hash TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'withdrawn', 'pending')) DEFAULT 'active',
  network TEXT NOT NULL CHECK (network IN ('testnet', 'mainnet')) DEFAULT 'testnet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ
);

-- Indexes for liquidity investments
CREATE INDEX IF NOT EXISTS idx_liquidity_wallet ON public.liquidity_investments(wallet_address);
CREATE INDEX IF NOT EXISTS idx_liquidity_pool ON public.liquidity_investments(pool_id);
CREATE INDEX IF NOT EXISTS idx_liquidity_status ON public.liquidity_investments(status);

-- ============================================
-- 6. CONTACTS/ADDRESS BOOK TABLE
-- Saved recipients for quick payments
-- ============================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_wallet_address TEXT NOT NULL, -- Who owns this contact
  contact_wallet_address TEXT NOT NULL, -- The contact's wallet
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  last_payment_at TIMESTAMPTZ,
  payment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_wallet_address, contact_wallet_address)
);

-- Indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON public.contacts(owner_wallet_address);
CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON public.contacts(is_favorite);

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- In-app notifications for users
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment_received', 'payment_sent', 'goal_reached', 'investment_update', 'system')) DEFAULT 'system',
  is_read BOOLEAN DEFAULT false,
  metadata JSONB, -- Additional data like transaction hash, amounts, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_wallet ON public.notifications(wallet_address);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Open for now, restrict as needed)
-- ============================================

-- User Profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (true);

-- Employee Transactions
CREATE POLICY "Users can view their transactions" ON public.employee_transactions FOR SELECT USING (true);
CREATE POLICY "Users can insert transactions" ON public.employee_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their transactions" ON public.employee_transactions FOR UPDATE USING (true);

-- Spending Categories
CREATE POLICY "Users can view categories" ON public.spending_categories FOR SELECT USING (true);
CREATE POLICY "Users can insert categories" ON public.spending_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update categories" ON public.spending_categories FOR UPDATE USING (true);
CREATE POLICY "Users can delete categories" ON public.spending_categories FOR DELETE USING (true);

-- Savings Goals
CREATE POLICY "Users can view goals" ON public.savings_goals FOR SELECT USING (true);
CREATE POLICY "Users can insert goals" ON public.savings_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update goals" ON public.savings_goals FOR UPDATE USING (true);
CREATE POLICY "Users can delete goals" ON public.savings_goals FOR DELETE USING (true);

-- Liquidity Investments
CREATE POLICY "Users can view investments" ON public.liquidity_investments FOR SELECT USING (true);
CREATE POLICY "Users can insert investments" ON public.liquidity_investments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update investments" ON public.liquidity_investments FOR UPDATE USING (true);

-- Contacts
CREATE POLICY "Users can view contacts" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Users can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update contacts" ON public.contacts FOR UPDATE USING (true);
CREATE POLICY "Users can delete contacts" ON public.contacts FOR DELETE USING (true);

-- Notifications
CREATE POLICY "Users can view notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "Users can delete notifications" ON public.notifications FOR DELETE USING (true);

-- ============================================
-- INSERT DEFAULT SPENDING CATEGORIES
-- ============================================
INSERT INTO public.spending_categories (wallet_address, name, icon, color, is_default) VALUES
  ('_system_', 'Food & Dining', '🍔', '#f59e0b', true),
  ('_system_', 'Shopping', '🛒', '#ec4899', true),
  ('_system_', 'Transportation', '🚗', '#3b82f6', true),
  ('_system_', 'Entertainment', '🎬', '#8b5cf6', true),
  ('_system_', 'Bills & Utilities', '📄', '#64748b', true),
  ('_system_', 'Healthcare', '🏥', '#ef4444', true),
  ('_system_', 'Education', '📚', '#06b6d4', true),
  ('_system_', 'Savings', '💰', '#10b981', true),
  ('_system_', 'Investments', '📈', '#14b8a6', true),
  ('_system_', 'Other', '📁', '#71717a', true)
ON CONFLICT (wallet_address, name) DO NOTHING;

-- ============================================
-- ADD COMMENTS
-- ============================================
COMMENT ON TABLE public.user_profiles IS 'Stores user profiles with role (employer/employee) and preferences';
COMMENT ON TABLE public.employee_transactions IS 'Tracks all transactions initiated by employees';
COMMENT ON TABLE public.spending_categories IS 'Custom and default spending categories for expense tracking';
COMMENT ON TABLE public.savings_goals IS 'Employee savings goals and progress tracking';
COMMENT ON TABLE public.liquidity_investments IS 'Tracks employee investments in Stellar liquidity pools';
COMMENT ON TABLE public.contacts IS 'Address book for frequently used payment recipients';
COMMENT ON TABLE public.notifications IS 'In-app notifications for users';

COMMIT;
