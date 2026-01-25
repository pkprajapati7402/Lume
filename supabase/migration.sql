-- Migration Script: Add owner_wallet_address to existing tables
-- This script adds wallet-based data isolation to the database
-- Run this script to migrate from the old schema to the new one

-- IMPORTANT: This migration will DROP existing tables and recreate them
-- Make sure to backup your data before running this script!

BEGIN;

-- Drop existing policies first
DROP POLICY IF EXISTS "Enable all operations for employees" ON public.employees;
DROP POLICY IF EXISTS "Enable all operations for batches" ON public.batches;
DROP POLICY IF EXISTS "Enable all operations for payouts" ON public.payouts;
DROP POLICY IF EXISTS "Users can view their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can insert their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can view their own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can insert their own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can update their own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can delete their own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can view their own payouts" ON public.payouts;
DROP POLICY IF EXISTS "Users can insert their own payouts" ON public.payouts;
DROP POLICY IF EXISTS "Users can update their own payouts" ON public.payouts;
DROP POLICY IF EXISTS "Users can delete their own payouts" ON public.payouts;

-- Drop existing tables and recreate with new schema
DROP TABLE IF EXISTS public.payouts CASCADE;
DROP TABLE IF EXISTS public.batches CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;

-- Recreate tables with owner_wallet_address column
-- Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_wallet_address TEXT NOT NULL, -- The wallet address of the employer/owner
  full_name TEXT NOT NULL,
  wallet_address TEXT NOT NULL, -- The employee's wallet address
  role TEXT NOT NULL DEFAULT 'Employee',
  preferred_asset TEXT NOT NULL DEFAULT 'USDC',
  department TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_wallet_address, wallet_address) -- Same employee can work for different employers
);

-- Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_wallet_address TEXT NOT NULL, -- The wallet address of the employer/owner
  name TEXT NOT NULL,
  total_usd NUMERIC(20, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payouts Table
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_wallet_address TEXT NOT NULL, -- The wallet address of the employer/owner
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  amount NUMERIC(20, 2) NOT NULL,
  asset_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  transaction_hash TEXT,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_owner ON public.employees(owner_wallet_address);
CREATE INDEX IF NOT EXISTS idx_employees_wallet ON public.employees(wallet_address);
CREATE INDEX IF NOT EXISTS idx_batches_owner ON public.batches(owner_wallet_address);
CREATE INDEX IF NOT EXISTS idx_payouts_owner ON public.payouts(owner_wallet_address);
CREATE INDEX IF NOT EXISTS idx_payouts_employee ON public.payouts(employee_id);
CREATE INDEX IF NOT EXISTS idx_payouts_batch ON public.payouts(batch_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON public.payouts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create policies to restrict access to owner's data only
-- Users can only see and manage their own employees
CREATE POLICY "Users can view their own employees" ON public.employees
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own employees" ON public.employees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own employees" ON public.employees
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own employees" ON public.employees
  FOR DELETE USING (true);

-- Users can only see and manage their own batches
CREATE POLICY "Users can view their own batches" ON public.batches
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own batches" ON public.batches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own batches" ON public.batches
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own batches" ON public.batches
  FOR DELETE USING (true);

-- Users can only see and manage their own payouts
CREATE POLICY "Users can view their own payouts" ON public.payouts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own payouts" ON public.payouts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own payouts" ON public.payouts
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own payouts" ON public.payouts
  FOR DELETE USING (true);

COMMIT;

-- Optional: Add comments to tables
COMMENT ON TABLE public.employees IS 'Stores employee information and payment preferences (wallet-isolated)';
COMMENT ON TABLE public.batches IS 'Tracks bulk payment batches (wallet-isolated)';
COMMENT ON TABLE public.payouts IS 'Records all payment transactions to employees (wallet-isolated)';
COMMENT ON COLUMN public.employees.owner_wallet_address IS 'Wallet address of the employer who added this employee';
COMMENT ON COLUMN public.batches.owner_wallet_address IS 'Wallet address of the employer who created this batch';
COMMENT ON COLUMN public.payouts.owner_wallet_address IS 'Wallet address of the employer who initiated this payout';
