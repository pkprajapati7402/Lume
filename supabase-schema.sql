-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.batches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_wallet_address text NOT NULL,
  name text NOT NULL,
  total_usd numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT batches_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_wallet_address text NOT NULL,
  contact_wallet_address text NOT NULL,
  contact_name text NOT NULL,
  contact_email text,
  notes text,
  is_favorite boolean DEFAULT false,
  last_payment_at timestamp with time zone,
  payment_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT contacts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.employee_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sender_wallet_address text NOT NULL,
  recipient_wallet_address text NOT NULL,
  recipient_name text,
  amount numeric NOT NULL,
  asset_code text NOT NULL DEFAULT 'XLM'::text,
  asset_issuer text,
  transaction_hash text,
  memo text,
  category text DEFAULT 'other'::text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text])),
  network text NOT NULL DEFAULT 'testnet'::text CHECK (network = ANY (ARRAY['testnet'::text, 'mainnet'::text])),
  fee_amount numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT employee_transactions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_wallet_address text NOT NULL,
  full_name text NOT NULL,
  wallet_address text NOT NULL,
  role text NOT NULL DEFAULT 'Employee'::text,
  preferred_asset text NOT NULL DEFAULT 'USDC'::text,
  department text NOT NULL DEFAULT 'General'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  employee_type text NOT NULL DEFAULT 'contractor'::text CHECK (employee_type = ANY (ARRAY['employee'::text, 'contractor'::text])),
  tax_rate numeric DEFAULT 20.00,
  CONSTRAINT employees_pkey PRIMARY KEY (id)
);
CREATE TABLE public.escrow_orders (
  id text NOT NULL,
  seller_wallet text NOT NULL,
  buyer_wallet text,
  escrow_public_key text NOT NULL,
  escrow_secret_key text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  asset_code text NOT NULL DEFAULT 'USDC'::text,
  status USER-DEFINED NOT NULL DEFAULT 'CREATED'::escrow_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  funded_at timestamp with time zone,
  locked_at timestamp with time zone,
  released_at timestamp with time zone,
  refunded_at timestamp with time zone,
  release_tx_hash text,
  fund_tx_hash text,
  CONSTRAINT escrow_orders_pkey PRIMARY KEY (id)
);
CREATE TABLE public.liquidity_investments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  wallet_address text NOT NULL,
  pool_id text NOT NULL,
  pool_name text NOT NULL,
  asset_a_code text NOT NULL,
  asset_b_code text NOT NULL,
  shares_amount numeric NOT NULL,
  deposit_amount_a numeric,
  deposit_amount_b numeric,
  deposit_transaction_hash text,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'withdrawn'::text, 'pending'::text])),
  network text NOT NULL DEFAULT 'testnet'::text CHECK (network = ANY (ARRAY['testnet'::text, 'mainnet'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  withdrawn_at timestamp with time zone,
  CONSTRAINT liquidity_investments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  wallet_address text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'system'::text CHECK (type = ANY (ARRAY['payment_received'::text, 'payment_sent'::text, 'goal_reached'::text, 'investment_update'::text, 'system'::text])),
  is_read boolean DEFAULT false,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payouts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_wallet_address text NOT NULL,
  employee_id uuid NOT NULL,
  amount numeric NOT NULL,
  asset_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text])),
  transaction_hash text,
  batch_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tax_withheld numeric DEFAULT 0,
  net_amount numeric,
  CONSTRAINT payouts_pkey PRIMARY KEY (id),
  CONSTRAINT payouts_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
  CONSTRAINT payouts_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id)
);
CREATE TABLE public.savings_goals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  wallet_address text NOT NULL,
  name text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  asset_code text DEFAULT 'XLM'::text,
  target_date date,
  icon text DEFAULT '🎯'::text,
  color text DEFAULT '#10b981'::text,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT savings_goals_pkey PRIMARY KEY (id)
);
CREATE TABLE public.spending_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  wallet_address text NOT NULL,
  name text NOT NULL,
  icon text DEFAULT '📁'::text,
  color text DEFAULT '#8b5cf6'::text,
  budget_limit numeric,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT spending_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  wallet_address text NOT NULL UNIQUE,
  user_role text NOT NULL DEFAULT 'employee'::text CHECK (user_role = ANY (ARRAY['employer'::text, 'employee'::text])),
  display_name text,
  email text,
  avatar_url text,
  preferred_currency text DEFAULT 'USD'::text,
  notification_preferences jsonb DEFAULT '{"push": false, "email": false}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);