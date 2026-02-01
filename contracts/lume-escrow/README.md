# Lume Escrow Smart Contract

A 2-of-3 Multisig Escrow Smart Contract built with Soroban for the Stellar blockchain.

## Overview

This contract enables trustless peer-to-peer transactions with the following features:

- **2-of-3 Multisig**: Buyer + Seller + Admin - any 2 parties can release funds
- **Status Tracking**: Created → Funded → Locked → Released/Refunded
- **Event Emissions**: Track all state changes on-chain
- **Admin Controls**: Dispute resolution and refund capabilities

## Contract Flow

```
1. SELLER creates order     → Status: Created
2. BUYER funds order        → Status: Funded (tokens transferred to contract)
3. BUYER/ADMIN locks order  → Status: Locked (ready for delivery)
4. 2-of-3 approve release   → Status: Released (tokens sent to seller)
   OR
   ADMIN refunds            → Status: Refunded (tokens returned to buyer)
```

## Functions

### Initialization
- `initialize(admin)` - Set up contract with admin address

### Order Management
- `create_order(order_id, seller, token, amount)` - Seller creates a new order
- `fund_order(order_id, buyer)` - Buyer funds the escrow
- `lock_order(order_id, caller)` - Lock funds (confirms funding)
- `approve_release(order_id, approver)` - Approve fund release (2-of-3 required)
- `refund_order(order_id, admin)` - Admin-initiated refund

### Queries
- `get_order(order_id)` - Get order details
- `get_seller_orders(seller)` - Get all orders for a seller
- `get_buyer_orders(buyer)` - Get all orders for a buyer
- `get_order_count()` - Total number of orders
- `get_admin()` - Get admin address

### Admin
- `set_admin(current_admin, new_admin)` - Update admin address

## Building

```bash
# Add WASM target
rustup target add wasm32-unknown-unknown

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# The WASM file will be at:
# target/wasm32-unknown-unknown/release/lume_escrow.wasm
```

## Deployment

```bash
# Configure network
stellar network add testnet \
    --rpc-url https://soroban-testnet.stellar.org \
    --network-passphrase "Test SDF Network ; September 2015"

# Generate keys
stellar keys generate admin --network testnet

# Deploy contract
stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/lume_escrow.wasm \
    --source admin \
    --network testnet

# Initialize contract
stellar contract invoke \
    --id <CONTRACT_ID> \
    --source admin \
    --network testnet \
    -- \
    initialize \
    --admin <ADMIN_ADDRESS>
```

## Testing

```bash
cargo test
```

## Security Considerations

1. **Non-custodial**: Contract only holds funds during active escrow
2. **2-of-3 Threshold**: No single party can unilaterally move funds
3. **Admin Safeguards**: Admin can only refund, not release to themselves
4. **Event Transparency**: All actions emit events for off-chain tracking

## License

MIT License
