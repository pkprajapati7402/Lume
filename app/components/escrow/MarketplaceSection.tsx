'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, ShoppingCart, Lock, CheckCircle, XCircle, Clock, 
    RefreshCw, Copy, ExternalLink, Wallet, Package, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useEscrowStore } from '@/app/store/escrowStore';
import { 
    getEscrowOrder, 
    lockEscrowAccount, 
    buildReleaseTransaction, 
    finalizeEscrow,
    EscrowOrder 
} from '@/app/actions/escrow';
import { signTransaction } from '@stellar/freighter-api';

interface MarketplaceSectionProps {
    walletAddress: string;
    network: 'testnet' | 'mainnet';
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; text: string }> = {
    CREATED: { icon: <Clock className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-400/10', text: 'Awaiting Payment' },
    FUNDED: { icon: <Package className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-400/10', text: 'Funded' },
    LOCKED: { icon: <Lock className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-400/10', text: 'Locked - Confirm Receipt' },
    RELEASED: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-400/10', text: 'Completed' },
    REFUNDED: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-400/10', text: 'Refunded' },
};

export default function MarketplaceSection({ walletAddress, network }: MarketplaceSectionProps) {
    const { currentOrder, setCurrentOrder, searchOrderId, setSearchOrderId, isLoading, setIsLoading } = useEscrowStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionType, setActionType] = useState<'pay' | 'confirm' | null>(null);

    const explorerUrl = network === 'mainnet'
        ? 'https://stellar.expert/explorer/public'
        : 'https://stellar.expert/explorer/testnet';

    const networkPassphrase = network === 'mainnet'
        ? 'Public Global Stellar Network ; September 2015'
        : 'Test SDF Network ; September 2015';

    const handleSearch = useCallback(async () => {
        if (!searchOrderId.trim()) {
            toast.error('Please enter an Order ID');
            return;
        }

        setIsLoading(true);
        setCurrentOrder(null);

        try {
            const result = await getEscrowOrder(searchOrderId.toUpperCase());
            
            if (result.success && result.order) {
                setCurrentOrder(result.order);
            } else {
                toast.error(result.error || 'Order not found');
            }
        } catch (error) {
            toast.error('Failed to search for order');
        } finally {
            setIsLoading(false);
        }
    }, [searchOrderId, setCurrentOrder, setIsLoading]);

    const handlePayNow = async () => {
        if (!currentOrder) return;

        setIsProcessing(true);
        setActionType('pay');

        try {
            // Step 1: User needs to fund the escrow account first
            // This would typically open Freighter to send payment to escrow_public_key
            toast.info(
                <div className="flex flex-col gap-2">
                    <span className="font-semibold">Step 1: Fund Escrow</span>
                    <span className="text-sm">
                        Send {currentOrder.amount} {currentOrder.asset_code} to:
                    </span>
                    <code className="text-xs bg-neutral-800 p-2 rounded break-all">
                        {currentOrder.escrow_public_key}
                    </code>
                    <span className="text-xs text-neutral-400">
                        After sending, click &quot;Lock Escrow&quot; button below
                    </span>
                </div>,
                { duration: 10000 }
            );

            // Copy address to clipboard
            await navigator.clipboard.writeText(currentOrder.escrow_public_key);
            toast.success('Escrow address copied to clipboard');

        } catch (error) {
            toast.error('Failed to process payment');
        } finally {
            setIsProcessing(false);
            setActionType(null);
        }
    };

    const handleLockEscrow = async () => {
        if (!currentOrder) return;

        setIsProcessing(true);
        setActionType('pay');

        try {
            // In a real implementation, we'd capture the fund transaction hash
            // For now, we'll use a placeholder that would be replaced with actual tx hash
            const fundTxHash = 'pending-verification';

            const result = await lockEscrowAccount(
                currentOrder.id,
                walletAddress,
                fundTxHash
            );

            if (result.success) {
                toast.success('Escrow locked successfully! Funds are now secured.');
                // Refresh the order
                const refreshed = await getEscrowOrder(currentOrder.id);
                if (refreshed.success && refreshed.order) {
                    setCurrentOrder(refreshed.order);
                }
            } else {
                toast.error(result.error || 'Failed to lock escrow');
            }
        } catch (error) {
            toast.error('Failed to lock escrow');
        } finally {
            setIsProcessing(false);
            setActionType(null);
        }
    };

    const handleConfirmReceipt = async () => {
        if (!currentOrder) return;

        setIsProcessing(true);
        setActionType('confirm');

        try {
            // Step 1: Build the release transaction
            const buildResult = await buildReleaseTransaction(currentOrder.id);
            
            if (!buildResult.success || !buildResult.xdr) {
                toast.error(buildResult.error || 'Failed to build release transaction');
                return;
            }

            toast.info('Please sign the transaction in Freighter...');

            // Step 2: Sign with Freighter (Buyer's signature)
            const signResult = await signTransaction(buildResult.xdr, {
                networkPassphrase,
            });

            if (!signResult.signedTxXdr) {
                toast.error('Transaction signing cancelled');
                return;
            }

            // Step 3: Submit to finalize (adds Admin signature and submits)
            const finalizeResult = await finalizeEscrow(
                currentOrder.id,
                signResult.signedTxXdr
            );

            if (finalizeResult.success) {
                toast.success(
                    <div className="flex flex-col gap-1">
                        <span>Payment released to seller!</span>
                        {finalizeResult.txHash && (
                            <a
                                href={`${explorerUrl}/tx/${finalizeResult.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-400 text-sm flex items-center gap-1"
                            >
                                View Transaction <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                );

                // Refresh the order
                const refreshed = await getEscrowOrder(currentOrder.id);
                if (refreshed.success && refreshed.order) {
                    setCurrentOrder(refreshed.order);
                }
            } else {
                toast.error(finalizeResult.error || 'Failed to release payment');
            }

        } catch (error: unknown) {
            console.error('Confirm receipt error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to confirm receipt';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
            setActionType(null);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    const canPayNow = currentOrder?.status === 'CREATED' && currentOrder.seller_wallet !== walletAddress;
    const canLockEscrow = currentOrder?.status === 'CREATED' && currentOrder.seller_wallet !== walletAddress;
    const canConfirmReceipt = currentOrder?.status === 'LOCKED' && currentOrder.buyer_wallet === walletAddress;

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 backdrop-blur-sm"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Search className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Find Escrow Order</h3>
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={searchOrderId}
                        onChange={(e) => setSearchOrderId(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter Order ID (e.g., PROD-001)"
                        className="flex-1 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                        Search
                    </button>
                </div>
            </motion.div>

            {/* Order Details */}
            {currentOrder && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 backdrop-blur-sm"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white">{currentOrder.id}</h3>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${statusConfig[currentOrder.status].color} ${statusConfig[currentOrder.status].bg}`}>
                                    {statusConfig[currentOrder.status].icon}
                                    {statusConfig[currentOrder.status].text}
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-amber-400">
                                {currentOrder.amount} {currentOrder.asset_code}
                            </p>
                        </div>
                        <div className="text-right text-sm text-neutral-500">
                            Created: {new Date(currentOrder.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-neutral-800/50 rounded-lg p-4">
                            <p className="text-sm text-neutral-500 mb-1">Seller</p>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-mono">
                                    {truncateAddress(currentOrder.seller_wallet)}
                                </span>
                                <button
                                    onClick={() => copyToClipboard(currentOrder.seller_wallet, 'Seller address')}
                                    className="p-1 hover:bg-neutral-700 rounded transition-colors"
                                >
                                    <Copy className="w-3 h-3 text-neutral-400" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-neutral-800/50 rounded-lg p-4">
                            <p className="text-sm text-neutral-500 mb-1">Escrow Vault</p>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-mono">
                                    {truncateAddress(currentOrder.escrow_public_key)}
                                </span>
                                <button
                                    onClick={() => copyToClipboard(currentOrder.escrow_public_key, 'Escrow address')}
                                    className="p-1 hover:bg-neutral-700 rounded transition-colors"
                                >
                                    <Copy className="w-3 h-3 text-neutral-400" />
                                </button>
                                <a
                                    href={`${explorerUrl}/account/${currentOrder.escrow_public_key}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 hover:bg-neutral-700 rounded transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                                </a>
                            </div>
                        </div>

                        {currentOrder.buyer_wallet && (
                            <div className="bg-neutral-800/50 rounded-lg p-4">
                                <p className="text-sm text-neutral-500 mb-1">Buyer</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-mono">
                                        {truncateAddress(currentOrder.buyer_wallet)}
                                    </span>
                                    {currentOrder.buyer_wallet === walletAddress && (
                                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">You</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentOrder.fund_tx_hash && (
                            <div className="bg-neutral-800/50 rounded-lg p-4">
                                <p className="text-sm text-neutral-500 mb-1">Fund Transaction</p>
                                <a
                                    href={`${explorerUrl}/tx/${currentOrder.fund_tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm"
                                >
                                    View on Explorer <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {(canPayNow || canConfirmReceipt) && (
                        <div className="border-t border-neutral-700 pt-6">
                            {currentOrder.seller_wallet === walletAddress && (
                                <div className="flex items-center gap-2 text-amber-400 mb-4">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm">This is your own order</span>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3">
                                {canPayNow && (
                                    <>
                                        <button
                                            onClick={handlePayNow}
                                            disabled={isProcessing}
                                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            {isProcessing && actionType === 'pay' ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Wallet className="w-4 h-4" />
                                            )}
                                            Get Payment Address
                                        </button>
                                        <button
                                            onClick={handleLockEscrow}
                                            disabled={isProcessing}
                                            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            {isProcessing && actionType === 'pay' ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Lock className="w-4 h-4" />
                                            )}
                                            Lock Escrow (After Payment)
                                        </button>
                                    </>
                                )}

                                {canConfirmReceipt && (
                                    <button
                                        onClick={handleConfirmReceipt}
                                        disabled={isProcessing}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    >
                                        {isProcessing && actionType === 'confirm' ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        Confirm Receipt & Release Funds
                                    </button>
                                )}
                            </div>

                            {canConfirmReceipt && (
                                <p className="text-xs text-neutral-500 mt-3">
                                    By confirming receipt, you acknowledge that you have received the goods/services and authorize the release of funds to the seller.
                                </p>
                            )}
                        </div>
                    )}

                    {currentOrder.status === 'RELEASED' && (
                        <div className="border-t border-neutral-700 pt-6">
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-semibold">Transaction Completed</span>
                            </div>
                            {currentOrder.release_tx_hash && (
                                <a
                                    href={`${explorerUrl}/tx/${currentOrder.release_tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm mt-2"
                                >
                                    View Release Transaction <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Empty State */}
            {!currentOrder && !isLoading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <ShoppingCart className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-400 mb-2">No Order Selected</h3>
                    <p className="text-neutral-600">
                        Enter an Order ID above to view details and make a purchase
                    </p>
                </motion.div>
            )}
        </div>
    );
}
