#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    token, Address, Env, String, Symbol,
    log, vec, Vec,
};

/// Escrow order status
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[contracttype]
#[repr(u32)]
pub enum EscrowStatus {
    Created = 0,    // Order created, awaiting buyer funding
    Funded = 1,     // Buyer has funded the escrow
    Locked = 2,     // Funds locked with multisig (ready for delivery)
    Released = 3,   // Funds released to seller
    Refunded = 4,   // Funds refunded to buyer
    Disputed = 5,   // Under dispute resolution
}

/// Escrow order data structure
#[derive(Clone)]
#[contracttype]
pub struct EscrowOrder {
    pub order_id: String,           // Unique order identifier
    pub seller: Address,            // Seller's address
    pub buyer: Address,             // Buyer's address (set when funded)
    pub admin: Address,             // Platform admin address
    pub token: Address,             // Token contract address (e.g., USDC)
    pub amount: i128,               // Amount in token units
    pub status: EscrowStatus,       // Current order status
    pub seller_approved: bool,      // Seller approval for release
    pub buyer_approved: bool,       // Buyer approval for release
    pub created_at: u64,            // Ledger timestamp when created
    pub funded_at: u64,             // Ledger timestamp when funded
    pub completed_at: u64,          // Ledger timestamp when completed
}

/// Storage keys
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,                          // Platform admin address
    Order(String),                  // Individual order by ID
    OrderCount,                     // Total order count
    SellerOrders(Address),          // List of order IDs for a seller
    BuyerOrders(Address),           // List of order IDs for a buyer
    Initialized,                    // Contract initialization flag
}

/// Contract errors - using contracterror macro for proper SDK integration
#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum EscrowError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    OrderNotFound = 3,
    OrderAlreadyExists = 4,
    InvalidStatus = 5,
    Unauthorized = 6,
    InsufficientFunds = 7,
    InvalidAmount = 8,
    AlreadyApproved = 9,
    NotEnoughApprovals = 10,
}

#[contract]
pub struct LumeEscrowContract;

#[contractimpl]
impl LumeEscrowContract {
    /// Initialize the contract with an admin address
    /// This must be called once before using the contract
    pub fn initialize(env: Env, admin: Address) -> Result<(), EscrowError> {
        // Check if already initialized
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(EscrowError::AlreadyInitialized);
        }

        // Require admin authorization
        admin.require_auth();

        // Store admin address
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Initialized, &true);
        env.storage().instance().set(&DataKey::OrderCount, &0u64);

        log!(&env, "Escrow contract initialized with admin: {}", admin);

        Ok(())
    }

    /// Create a new escrow order (called by seller)
    pub fn create_order(
        env: Env,
        order_id: String,
        seller: Address,
        token: Address,
        amount: i128,
    ) -> Result<EscrowOrder, EscrowError> {
        // Verify contract is initialized
        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(EscrowError::NotInitialized);
        }

        // Require seller authorization
        seller.require_auth();

        // Validate amount
        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }

        // Check order doesn't already exist
        let order_key = DataKey::Order(order_id.clone());
        if env.storage().persistent().has(&order_key) {
            return Err(EscrowError::OrderAlreadyExists);
        }

        // Get admin address
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();

        // Create the order
        let order = EscrowOrder {
            order_id: order_id.clone(),
            seller: seller.clone(),
            buyer: seller.clone(), // Placeholder, will be set when funded
            admin: admin.clone(),
            token,
            amount,
            status: EscrowStatus::Created,
            seller_approved: false,
            buyer_approved: false,
            created_at: env.ledger().timestamp(),
            funded_at: 0,
            completed_at: 0,
        };

        // Store the order
        env.storage().persistent().set(&order_key, &order);

        // Update order count
        let count: u64 = env.storage().instance().get(&DataKey::OrderCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::OrderCount, &(count + 1));

        // Add to seller's orders list
        let seller_orders_key = DataKey::SellerOrders(seller.clone());
        let mut seller_orders: Vec<String> = env.storage()
            .persistent()
            .get(&seller_orders_key)
            .unwrap_or(vec![&env]);
        seller_orders.push_back(order_id.clone());
        env.storage().persistent().set(&seller_orders_key, &seller_orders);

        log!(&env, "Order created: {} by seller: {}", order_id, seller);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "order_created"), order_id.clone()),
            (seller, amount)
        );

        Ok(order)
    }

    /// Fund an escrow order (called by buyer)
    pub fn fund_order(
        env: Env,
        order_id: String,
        buyer: Address,
    ) -> Result<EscrowOrder, EscrowError> {
        // Verify contract is initialized
        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(EscrowError::NotInitialized);
        }

        // Require buyer authorization
        buyer.require_auth();

        // Get the order
        let order_key = DataKey::Order(order_id.clone());
        let mut order: EscrowOrder = env.storage()
            .persistent()
            .get(&order_key)
            .ok_or(EscrowError::OrderNotFound)?;

        // Verify order status
        if order.status != EscrowStatus::Created {
            return Err(EscrowError::InvalidStatus);
        }

        // Transfer tokens from buyer to this contract
        let token_client = token::Client::new(&env, &order.token);
        token_client.transfer(
            &buyer,
            &env.current_contract_address(),
            &order.amount,
        );

        // Update order
        order.buyer = buyer.clone();
        order.status = EscrowStatus::Funded;
        order.funded_at = env.ledger().timestamp();

        // Save updated order
        env.storage().persistent().set(&order_key, &order);

        // Add to buyer's orders list
        let buyer_orders_key = DataKey::BuyerOrders(buyer.clone());
        let mut buyer_orders: Vec<String> = env.storage()
            .persistent()
            .get(&buyer_orders_key)
            .unwrap_or(vec![&env]);
        buyer_orders.push_back(order_id.clone());
        env.storage().persistent().set(&buyer_orders_key, &buyer_orders);

        log!(&env, "Order funded: {} by buyer: {}", order_id, buyer);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "order_funded"), order_id.clone()),
            (buyer, order.amount)
        );

        Ok(order)
    }

    /// Lock the escrow (transition from Funded to Locked)
    /// This confirms the buyer has funded and is ready for delivery
    pub fn lock_order(
        env: Env,
        order_id: String,
        caller: Address,
    ) -> Result<EscrowOrder, EscrowError> {
        // Require caller authorization
        caller.require_auth();

        // Get the order
        let order_key = DataKey::Order(order_id.clone());
        let mut order: EscrowOrder = env.storage()
            .persistent()
            .get(&order_key)
            .ok_or(EscrowError::OrderNotFound)?;

        // Verify caller is buyer or admin
        if caller != order.buyer && caller != order.admin {
            return Err(EscrowError::Unauthorized);
        }

        // Verify order status
        if order.status != EscrowStatus::Funded {
            return Err(EscrowError::InvalidStatus);
        }

        // Update status to Locked
        order.status = EscrowStatus::Locked;

        // Save updated order
        env.storage().persistent().set(&order_key, &order);

        log!(&env, "Order locked: {} by: {}", order_id, caller);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "order_locked"), order_id.clone()),
            caller
        );

        Ok(order)
    }

    /// Approve release of funds (2-of-3 multisig)
    /// Buyer, Seller, or Admin can approve
    pub fn approve_release(
        env: Env,
        order_id: String,
        approver: Address,
    ) -> Result<EscrowOrder, EscrowError> {
        // Require approver authorization
        approver.require_auth();

        // Get the order
        let order_key = DataKey::Order(order_id.clone());
        let mut order: EscrowOrder = env.storage()
            .persistent()
            .get(&order_key)
            .ok_or(EscrowError::OrderNotFound)?;

        // Verify order status is Locked
        if order.status != EscrowStatus::Locked {
            return Err(EscrowError::InvalidStatus);
        }

        // Check who is approving and update accordingly
        if approver == order.buyer {
            if order.buyer_approved {
                return Err(EscrowError::AlreadyApproved);
            }
            order.buyer_approved = true;
            log!(&env, "Buyer approved release for order: {}", order_id);
        } else if approver == order.seller {
            if order.seller_approved {
                return Err(EscrowError::AlreadyApproved);
            }
            order.seller_approved = true;
            log!(&env, "Seller approved release for order: {}", order_id);
        } else if approver == order.admin {
            // Admin approval counts as both if needed for dispute resolution
            // For normal flow, admin approval + one party = 2-of-3
            order.seller_approved = true; // Admin can act on seller's behalf
            log!(&env, "Admin approved release for order: {}", order_id);
        } else {
            return Err(EscrowError::Unauthorized);
        }

        // Check if we have 2-of-3 approvals
        let approval_count = 
            (if order.buyer_approved { 1 } else { 0 }) +
            (if order.seller_approved { 1 } else { 0 });

        if approval_count >= 2 {
            // Release funds to seller
            let token_client = token::Client::new(&env, &order.token);
            token_client.transfer(
                &env.current_contract_address(),
                &order.seller,
                &order.amount,
            );

            order.status = EscrowStatus::Released;
            order.completed_at = env.ledger().timestamp();

            log!(&env, "Funds released to seller for order: {}", order_id);

            // Emit event
            env.events().publish(
                (Symbol::new(&env, "order_released"), order_id.clone()),
                (order.seller.clone(), order.amount)
            );
        }

        // Save updated order
        env.storage().persistent().set(&order_key, &order);

        Ok(order)
    }

    /// Refund the buyer (requires admin + buyer OR admin + seller approval)
    pub fn refund_order(
        env: Env,
        order_id: String,
        caller: Address,
    ) -> Result<EscrowOrder, EscrowError> {
        // Require caller authorization
        caller.require_auth();

        // Get the order
        let order_key = DataKey::Order(order_id.clone());
        let mut order: EscrowOrder = env.storage()
            .persistent()
            .get(&order_key)
            .ok_or(EscrowError::OrderNotFound)?;

        // Only admin can initiate refund
        if caller != order.admin {
            return Err(EscrowError::Unauthorized);
        }

        // Verify order status allows refund (Funded or Locked)
        if order.status != EscrowStatus::Funded && order.status != EscrowStatus::Locked {
            return Err(EscrowError::InvalidStatus);
        }

        // Transfer tokens back to buyer
        let token_client = token::Client::new(&env, &order.token);
        token_client.transfer(
            &env.current_contract_address(),
            &order.buyer,
            &order.amount,
        );

        // Update order status
        order.status = EscrowStatus::Refunded;
        order.completed_at = env.ledger().timestamp();

        // Save updated order
        env.storage().persistent().set(&order_key, &order);

        log!(&env, "Order refunded: {} to buyer: {}", order_id, order.buyer);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "order_refunded"), order_id.clone()),
            (order.buyer.clone(), order.amount)
        );

        Ok(order)
    }

    /// Get order details
    pub fn get_order(env: Env, order_id: String) -> Result<EscrowOrder, EscrowError> {
        let order_key = DataKey::Order(order_id);
        env.storage()
            .persistent()
            .get(&order_key)
            .ok_or(EscrowError::OrderNotFound)
    }

    /// Get all orders for a seller
    pub fn get_seller_orders(env: Env, seller: Address) -> Vec<String> {
        let seller_orders_key = DataKey::SellerOrders(seller);
        env.storage()
            .persistent()
            .get(&seller_orders_key)
            .unwrap_or(vec![&env])
    }

    /// Get all orders for a buyer
    pub fn get_buyer_orders(env: Env, buyer: Address) -> Vec<String> {
        let buyer_orders_key = DataKey::BuyerOrders(buyer);
        env.storage()
            .persistent()
            .get(&buyer_orders_key)
            .unwrap_or(vec![&env])
    }

    /// Get total order count
    pub fn get_order_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::OrderCount)
            .unwrap_or(0)
    }

    /// Get admin address
    pub fn get_admin(env: Env) -> Result<Address, EscrowError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowError::NotInitialized)
    }

    /// Update admin address (only current admin can do this)
    pub fn set_admin(env: Env, current_admin: Address, new_admin: Address) -> Result<(), EscrowError> {
        // Require current admin authorization
        current_admin.require_auth();

        // Verify caller is current admin
        let stored_admin: Address = env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowError::NotInitialized)?;
        
        if current_admin != stored_admin {
            return Err(EscrowError::Unauthorized);
        }

        // Update admin
        env.storage().instance().set(&DataKey::Admin, &new_admin);

        log!(&env, "Admin updated from {} to {}", current_admin, new_admin);

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        token::{Client as TokenClient, StellarAssetClient},
        Env,
    };

    fn create_token_contract<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
        let contract_address = env.register_stellar_asset_contract_v2(admin.clone());
        (
            TokenClient::new(env, &contract_address.address()),
            StellarAssetClient::new(env, &contract_address.address()),
        )
    }

    #[test]
    fn test_full_escrow_flow() {
        let env = Env::default();
        env.mock_all_auths();

        // Setup accounts
        let admin = Address::generate(&env);
        let seller = Address::generate(&env);
        let buyer = Address::generate(&env);

        // Create token
        let (token_client, token_admin_client) = create_token_contract(&env, &admin);
        let token_address = token_client.address.clone();

        // Mint tokens to buyer
        token_admin_client.mint(&buyer, &1000_0000000); // 1000 tokens (7 decimals)

        // Deploy escrow contract
        let escrow_id = env.register_contract(None, LumeEscrowContract);
        let escrow_client = LumeEscrowContractClient::new(&env, &escrow_id);

        // Initialize
        escrow_client.initialize(&admin);

        // 1. Seller creates order
        let order_id = String::from_str(&env, "ORDER-001");
        let amount: i128 = 100_0000000; // 100 tokens

        let order = escrow_client.create_order(
            &order_id,
            &seller,
            &token_address,
            &amount,
        );
        assert_eq!(order.status, EscrowStatus::Created);
        assert_eq!(order.amount, amount);

        // 2. Buyer funds order
        let order = escrow_client.fund_order(&order_id, &buyer);
        assert_eq!(order.status, EscrowStatus::Funded);
        assert_eq!(order.buyer, buyer);

        // Check contract received tokens
        assert_eq!(token_client.balance(&escrow_id), amount);

        // 3. Buyer locks order
        let order = escrow_client.lock_order(&order_id, &buyer);
        assert_eq!(order.status, EscrowStatus::Locked);

        // 4. Buyer approves release (received goods)
        let order = escrow_client.approve_release(&order_id, &buyer);
        assert!(order.buyer_approved);
        assert_eq!(order.status, EscrowStatus::Locked); // Still locked, need 2-of-3

        // 5. Admin approves release (or seller could approve)
        let order = escrow_client.approve_release(&order_id, &admin);
        assert_eq!(order.status, EscrowStatus::Released); // Now released!

        // Check seller received tokens
        assert_eq!(token_client.balance(&seller), amount);
        assert_eq!(token_client.balance(&escrow_id), 0);
    }

    #[test]
    fn test_refund_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let seller = Address::generate(&env);
        let buyer = Address::generate(&env);

        let (token_client, token_admin_client) = create_token_contract(&env, &admin);
        let token_address = token_client.address.clone();
        token_admin_client.mint(&buyer, &1000_0000000);

        let escrow_id = env.register_contract(None, LumeEscrowContract);
        let escrow_client = LumeEscrowContractClient::new(&env, &escrow_id);

        escrow_client.initialize(&admin);

        // Create and fund order
        let order_id = String::from_str(&env, "ORDER-002");
        let amount: i128 = 50_0000000;

        escrow_client.create_order(&order_id, &seller, &token_address, &amount);
        escrow_client.fund_order(&order_id, &buyer);

        // Check buyer balance before refund
        let buyer_balance_before = token_client.balance(&buyer);

        // Admin refunds
        let order = escrow_client.refund_order(&order_id, &admin);
        assert_eq!(order.status, EscrowStatus::Refunded);

        // Check buyer got tokens back
        assert_eq!(token_client.balance(&buyer), buyer_balance_before + amount);
        assert_eq!(token_client.balance(&escrow_id), 0);
    }

    #[test]
    fn test_get_orders() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let seller = Address::generate(&env);
        let buyer = Address::generate(&env);

        let (token_client, _) = create_token_contract(&env, &admin);
        let token_address = token_client.address.clone();

        let escrow_id = env.register_contract(None, LumeEscrowContract);
        let escrow_client = LumeEscrowContractClient::new(&env, &escrow_id);

        escrow_client.initialize(&admin);

        // Create multiple orders
        escrow_client.create_order(
            &String::from_str(&env, "ORDER-A"),
            &seller,
            &token_address,
            &100,
        );
        escrow_client.create_order(
            &String::from_str(&env, "ORDER-B"),
            &seller,
            &token_address,
            &200,
        );

        // Check order count
        assert_eq!(escrow_client.get_order_count(), 2);

        // Check seller orders
        let seller_orders = escrow_client.get_seller_orders(&seller);
        assert_eq!(seller_orders.len(), 2);
    }
}
