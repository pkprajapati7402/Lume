-- Lume Database Schema
-- Creates tables for employee management and payroll tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  wallet_address TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Employee',
  preferred_asset TEXT NOT NULL DEFAULT 'USDC',
  department TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  total_usd NUMERIC(20, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payouts Table
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  amount NUMERIC(20, 2) NOT NULL,
  asset_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  transaction_hash TEXT,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_wallet ON public.employees(wallet_address);
CREATE INDEX IF NOT EXISTS idx_payouts_employee ON public.payouts(employee_id);
CREATE INDEX IF NOT EXISTS idx_payouts_batch ON public.payouts(batch_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON public.payouts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth requirements)
-- For development: Allow all operations
CREATE POLICY "Enable all operations for employees" ON public.employees
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for batches" ON public.batches
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for payouts" ON public.payouts
  FOR ALL USING (true) WITH CHECK (true);

-- Optional: Add comments to tables
COMMENT ON TABLE public.employees IS 'Stores employee information and payment preferences';
COMMENT ON TABLE public.batches IS 'Tracks bulk payment batches';
COMMENT ON TABLE public.payouts IS 'Records all payment transactions to employees';
