'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
    Keypair,
    Networks,
    TransactionBuilder,
    Operation,
    Asset,
    Horizon,
    BASE_FEE,
} from '@stellar/stellar-sdk';

// Types
export type EscrowStatus = 'CREATED' | 'FUNDED' | 'LOCKED' | 'RELEASED' | 'REFUNDED';

export interface EscrowOrder {
    id: string;
    seller_wallet: string;
    buyer_wallet: string | null;
    escrow_public_key: string;
    amount: number;
    asset_code: string;
    status: EscrowStatus;
    created_at: string;
    updated_at: string;
    funded_at: string | null;
    locked_at: string | null;
    released_at: string | null;
    refunded_at: string | null;
    release_tx_hash: string | null;
    fund_tx_hash: string | null;
}

// Configure Horizon server based on network
const getNetworkConfig = () => {
    const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
    const isMainnet = network.toLowerCase() === 'mainnet';
    
    return {
        horizonUrl: isMainnet
            ? 'https://horizon.stellar.org'
            : 'https://horizon-testnet.stellar.org',
        networkPassphrase: isMainnet ? Networks.PUBLIC : Networks.TESTNET,
    };
};

// App/Admin keypair for 2-of-3 multisig (store securely in production)
const ADMIN_SECRET_KEY = process.env.ESCROW_ADMIN_SECRET_KEY;

/**
 * Creates a new escrow order with a fresh Stellar keypair as the escrow vault
 */
export async function createEscrowOrder(
    sellerWallet: string,
    amount: number,
    orderId: string
): Promise<{ success: boolean; orderId?: string; escrowPublicKey?: string; error?: string }> {
    try {
        // Validate inputs
        if (!sellerWallet || !amount || !orderId) {
            return { success: false, error: 'Missing required fields' };
        }

        if (amount <= 0) {
            return { success: false, error: 'Amount must be greater than 0' };
        }

        // Validate orderId format (e.g., PROD-001)
        if (!/^[A-Z]+-\d+$/.test(orderId)) {
            return { success: false, error: 'Order ID must be in format: PROD-001' };
        }

        const supabase = await createServerSupabaseClient();

        // Check if order ID already exists
        const { data: existing } = await supabase
            .from('escrow_orders')
            .select('id')
            .eq('id', orderId)
            .single();

        if (existing) {
            return { success: false, error: 'Order ID already exists' };
        }

        // Generate a new random Stellar keypair for the escrow vault
        const escrowKeypair = Keypair.random();
        const escrowPublicKey = escrowKeypair.publicKey();
        const escrowSecretKey = escrowKeypair.secret();

        // Save to Supabase
        const { error: insertError } = await supabase
            .from('escrow_orders')
            .insert({
                id: orderId,
                seller_wallet: sellerWallet,
                escrow_public_key: escrowPublicKey,
                escrow_secret_key: escrowSecretKey, // In production, encrypt this
                amount: amount,
                asset_code: 'USDC',
                status: 'CREATED',
            });

        if (insertError) {
            console.error('Error creating escrow order:', insertError);
            return { success: false, error: 'Failed to create escrow order' };
        }

        return {
            success: true,
            orderId,
            escrowPublicKey,
        };
    } catch (error) {
        console.error('createEscrowOrder error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Locks the escrow account by setting up 2-of-3 multisig after buyer funds it
 */
export async function lockEscrowAccount(
    orderId: string,
    buyerWallet: string,
    fundTxHash?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!orderId || !buyerWallet) {
            return { success: false, error: 'Missing required fields' };
        }

        if (!ADMIN_SECRET_KEY) {
            return { success: false, error: 'Admin key not configured' };
        }

        const supabase = await createServerSupabaseClient();
        const { horizonUrl, networkPassphrase } = getNetworkConfig();
        const server = new Horizon.Server(horizonUrl);

        // Get the escrow order
        const { data: order, error: fetchError } = await supabase
            .from('escrow_orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return { success: false, error: 'Escrow order not found' };
        }

        if (order.status !== 'CREATED' && order.status !== 'FUNDED') {
            return { success: false, error: `Cannot lock order with status: ${order.status}` };
        }

        const escrowKeypair = Keypair.fromSecret(order.escrow_secret_key);
        const adminKeypair = Keypair.fromSecret(ADMIN_SECRET_KEY);

        // Load the escrow account
        let escrowAccount;
        try {
            escrowAccount = await server.loadAccount(order.escrow_public_key);
        } catch {
            return { success: false, error: 'Escrow account not found on network. Please fund it first.' };
        }

        // Verify the account has sufficient balance
        const xlmBalance = escrowAccount.balances.find(
            (b: Horizon.HorizonApi.BalanceLine) => b.asset_type === 'native'
        );
        
        if (!xlmBalance || parseFloat(xlmBalance.balance) < 2) {
            return { success: false, error: 'Escrow account needs at least 2 XLM for operations' };
        }

        // Build the multisig setup transaction
        const transaction = new TransactionBuilder(escrowAccount, {
            fee: BASE_FEE,
            networkPassphrase: networkPassphrase,
        })
            // Add Buyer as signer (weight 1)
            .addOperation(
                Operation.setOptions({
                    signer: {
                        ed25519PublicKey: buyerWallet,
                        weight: 1,
                    },
                })
            )
            // Add Seller as signer (weight 1)
            .addOperation(
                Operation.setOptions({
                    signer: {
                        ed25519PublicKey: order.seller_wallet,
                        weight: 1,
                    },
                })
            )
            // Add Admin as signer (weight 1)
            .addOperation(
                Operation.setOptions({
                    signer: {
                        ed25519PublicKey: adminKeypair.publicKey(),
                        weight: 1,
                    },
                })
            )
            // Set thresholds to require 2-of-3 signatures
            // Set master weight to 0 to lock the original escrow key
            .addOperation(
                Operation.setOptions({
                    masterWeight: 0,
                    lowThreshold: 2,
                    medThreshold: 2,
                    highThreshold: 2,
                })
            )
            .setTimeout(300)
            .build();

        // Sign with escrow key (before it's locked)
        transaction.sign(escrowKeypair);

        // Submit the transaction
        try {
            await server.submitTransaction(transaction);
        } catch (submitError: unknown) {
            console.error('Failed to submit multisig setup:', submitError);
            const errorMessage = submitError instanceof Error ? submitError.message : 'Unknown error';
            return { success: false, error: `Failed to setup multisig: ${errorMessage}` };
        }

        // Update the order status
        const { error: updateError } = await supabase
            .from('escrow_orders')
            .update({
                status: 'LOCKED',
                buyer_wallet: buyerWallet,
                locked_at: new Date().toISOString(),
                fund_tx_hash: fundTxHash || null,
            })
            .eq('id', orderId);

        if (updateError) {
            console.error('Error updating escrow status:', updateError);
            return { success: false, error: 'Escrow locked but failed to update database' };
        }

        return { success: true };
    } catch (error) {
        console.error('lockEscrowAccount error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Finalizes the escrow by adding admin signature and submitting the release transaction
 */
export async function finalizeEscrow(
    orderId: string,
    signedXdrFromBuyer: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
        if (!orderId || !signedXdrFromBuyer) {
            return { success: false, error: 'Missing required fields' };
        }

        if (!ADMIN_SECRET_KEY) {
            return { success: false, error: 'Admin key not configured' };
        }

        const supabase = await createServerSupabaseClient();
        const { horizonUrl, networkPassphrase } = getNetworkConfig();
        const server = new Horizon.Server(horizonUrl);

        // Get the escrow order
        const { data: order, error: fetchError } = await supabase
            .from('escrow_orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return { success: false, error: 'Escrow order not found' };
        }

        if (order.status !== 'LOCKED') {
            return { success: false, error: `Cannot release order with status: ${order.status}` };
        }

        const adminKeypair = Keypair.fromSecret(ADMIN_SECRET_KEY);

        // Deserialize the transaction from buyer's signed XDR
        const transaction = TransactionBuilder.fromXDR(
            signedXdrFromBuyer,
            networkPassphrase
        );

        // Add admin signature (2nd signature for 2-of-3)
        transaction.sign(adminKeypair);

        // Submit the transaction
        let result;
        try {
            result = await server.submitTransaction(transaction);
        } catch (submitError: unknown) {
            console.error('Failed to submit release transaction:', submitError);
            const errorMessage = submitError instanceof Error ? submitError.message : 'Unknown error';
            return { success: false, error: `Failed to release funds: ${errorMessage}` };
        }

        // Update the order status
        const { error: updateError } = await supabase
            .from('escrow_orders')
            .update({
                status: 'RELEASED',
                released_at: new Date().toISOString(),
                release_tx_hash: result.hash,
            })
            .eq('id', orderId);

        if (updateError) {
            console.error('Error updating escrow status:', updateError);
        }

        return {
            success: true,
            txHash: result.hash,
        };
    } catch (error) {
        console.error('finalizeEscrow error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Get escrow order by ID
 */
export async function getEscrowOrder(orderId: string): Promise<{
    success: boolean;
    order?: EscrowOrder;
    error?: string;
}> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from('escrow_orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error || !data) {
            return { success: false, error: 'Order not found' };
        }

        // Remove secret key from response
        const { escrow_secret_key, ...order } = data;

        return { success: true, order: order as EscrowOrder };
    } catch (error) {
        console.error('getEscrowOrder error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Get all escrow orders for a seller
 */
export async function getSellerOrders(sellerWallet: string): Promise<{
    success: boolean;
    orders?: EscrowOrder[];
    error?: string;
}> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from('escrow_orders')
            .select('*')
            .eq('seller_wallet', sellerWallet)
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: 'Failed to fetch orders' };
        }

        // Remove secret keys from response
        const orders = (data || []).map((row) => {
            const { escrow_secret_key, ...order } = row as { escrow_secret_key: string } & EscrowOrder;
            return order;
        });

        return { success: true, orders };
    } catch (error) {
        console.error('getSellerOrders error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Get all escrow orders where user is the buyer
 */
export async function getBuyerOrders(buyerWallet: string): Promise<{
    success: boolean;
    orders?: EscrowOrder[];
    error?: string;
}> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from('escrow_orders')
            .select('*')
            .eq('buyer_wallet', buyerWallet)
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: 'Failed to fetch orders' };
        }

        // Remove secret keys from response
        const orders = (data || []).map((row) => {
            const { escrow_secret_key, ...order } = row as { escrow_secret_key: string } & EscrowOrder;
            return order;
        });

        return { success: true, orders };
    } catch (error) {
        console.error('getBuyerOrders error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Build the release transaction for buyer to sign
 */
export async function buildReleaseTransaction(orderId: string): Promise<{
    success: boolean;
    xdr?: string;
    error?: string;
}> {
    try {
        const supabase = await createServerSupabaseClient();
        const { horizonUrl, networkPassphrase } = getNetworkConfig();
        const server = new Horizon.Server(horizonUrl);

        const { data: order, error: fetchError } = await supabase
            .from('escrow_orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return { success: false, error: 'Order not found' };
        }

        if (order.status !== 'LOCKED') {
            return { success: false, error: 'Order must be in LOCKED status' };
        }

        // Load the escrow account
        let escrowAccount;
        try {
            escrowAccount = await server.loadAccount(order.escrow_public_key);
        } catch {
            return { success: false, error: 'Escrow account not found' };
        }

        // For USDC, we need to use the proper asset
        // On testnet, you might use a test USDC issuer
        const asset = order.asset_code === 'XLM'
            ? Asset.native()
            : new Asset(
                order.asset_code,
                // Use appropriate issuer for the asset
                process.env.NEXT_PUBLIC_USDC_ISSUER || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
            );

        // Build payment transaction from escrow to seller
        const transaction = new TransactionBuilder(escrowAccount, {
            fee: BASE_FEE,
            networkPassphrase: networkPassphrase,
        })
            .addOperation(
                Operation.payment({
                    destination: order.seller_wallet,
                    asset: asset,
                    amount: order.amount.toString(),
                })
            )
            .setTimeout(300)
            .build();

        return {
            success: true,
            xdr: transaction.toXDR(),
        };
    } catch (error) {
        console.error('buildReleaseTransaction error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
