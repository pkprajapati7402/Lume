-- Migration: Add tax compliance columns to payouts table
-- Date: 2026-01-26
-- Purpose: Support advanced compliance reporting and tax form generation

-- Add tax_withheld column (amount withheld for taxes)
ALTER TABLE public.payouts 
ADD COLUMN IF NOT EXISTS tax_withheld NUMERIC(20, 2) DEFAULT 0;

-- Add net_amount column (amount after tax withholding)
ALTER TABLE public.payouts 
ADD COLUMN IF NOT EXISTS net_amount NUMERIC(20, 2);

-- Add employee_type column for W-2 vs 1099 classification
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS employee_type TEXT NOT NULL DEFAULT 'contractor' CHECK (employee_type IN ('employee', 'contractor'));

-- Add tax rate setting column for custom tax withholding
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) DEFAULT 20.00;

-- Update existing payouts to have net_amount equal to amount (no retroactive tax withholding)
UPDATE public.payouts 
SET net_amount = amount 
WHERE net_amount IS NULL;

-- Create index for tax queries
CREATE INDEX IF NOT EXISTS idx_payouts_tax_withheld ON public.payouts(tax_withheld);
CREATE INDEX IF NOT EXISTS idx_employees_type ON public.employees(employee_type);

-- Add comments for documentation
COMMENT ON COLUMN public.payouts.tax_withheld IS 'Amount withheld for tax purposes (USD equivalent)';
COMMENT ON COLUMN public.payouts.net_amount IS 'Net amount disbursed after tax withholding';
COMMENT ON COLUMN public.employees.employee_type IS 'Classification: employee (W-2) or contractor (1099-NEC)';
COMMENT ON COLUMN public.employees.tax_rate IS 'Custom tax withholding rate as percentage (e.g., 20.00 for 20%)';
