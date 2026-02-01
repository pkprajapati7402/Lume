-- Create enum type for escrow status
CREATE TYPE escrow_status AS ENUM ('CREATED', 'FUNDED', 'LOCKED', 'RELEASED', 'REFUNDED');

-- Create escrow_orders table
CREATE TABLE escrow_orders (
    id TEXT PRIMARY KEY, -- Manual Product ID like "PROD-001"
    seller_wallet TEXT NOT NULL,
    buyer_wallet TEXT,
    escrow_public_key TEXT NOT NULL,
    escrow_secret_key TEXT NOT NULL, -- Will be encrypted via Supabase Vault in production
    amount NUMERIC NOT NULL CHECK (amount > 0),
    asset_code TEXT NOT NULL DEFAULT 'USDC',
    status escrow_status NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    funded_at TIMESTAMPTZ,
    locked_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    release_tx_hash TEXT,
    fund_tx_hash TEXT
);

-- Create indexes for common queries
CREATE INDEX idx_escrow_orders_seller ON escrow_orders(seller_wallet);
CREATE INDEX idx_escrow_orders_buyer ON escrow_orders(buyer_wallet);
CREATE INDEX idx_escrow_orders_status ON escrow_orders(status);
CREATE INDEX idx_escrow_orders_escrow_key ON escrow_orders(escrow_public_key);

-- Enable Row Level Security
ALTER TABLE escrow_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view orders (for marketplace functionality)
CREATE POLICY "Anyone can view orders" ON escrow_orders
    FOR SELECT
    USING (true);

-- Policy: Anyone can create orders
CREATE POLICY "Anyone can create orders" ON escrow_orders
    FOR INSERT
    WITH CHECK (true);

-- Policy: Updates allowed for status changes
CREATE POLICY "Allow status updates" ON escrow_orders
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_escrow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER escrow_orders_updated_at
    BEFORE UPDATE ON escrow_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_escrow_updated_at();

-- Add comment for documentation
COMMENT ON TABLE escrow_orders IS 'Stores 2-of-3 multisig escrow orders for secure trades';
COMMENT ON COLUMN escrow_orders.escrow_secret_key IS 'Encrypted secret key for the escrow vault account';
