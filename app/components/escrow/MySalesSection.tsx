'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Lock, CheckCircle, XCircle, Clock, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useEscrowStore } from '@/app/store/escrowStore';
import { createEscrowOrder, getSellerOrders, EscrowOrder } from '@/app/actions/escrow';

interface MySalesSectionProps {
    walletAddress: string;
    network: 'testnet' | 'mainnet';
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    CREATED: { icon: <Clock className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    FUNDED: { icon: <Package className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    LOCKED: { icon: <Lock className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    RELEASED: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-400/10' },
    REFUNDED: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-400/10' },
};

export default function MySalesSection({ walletAddress, network }: MySalesSectionProps) {
    const { sellerOrders, setSellerOrders, isLoading, setIsLoading } = useEscrowStore();
    const [productId, setProductId] = useState('');
    const [amount, setAmount] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const explorerUrl = network === 'mainnet'
        ? 'https://stellar.expert/explorer/public'
        : 'https://stellar.expert/explorer/testnet';

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getSellerOrders(walletAddress);
            if (result.success && result.orders) {
                setSellerOrders(result.orders);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    }, [walletAddress, setSellerOrders, setIsLoading]);

    useEffect(() => {
        if (walletAddress) {
            fetchOrders();
        }
    }, [walletAddress, fetchOrders]);

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!productId.trim() || !amount.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsCreating(true);
        try {
            const result = await createEscrowOrder(walletAddress, numAmount, productId.toUpperCase());
            
            if (result.success) {
                toast.success(
                    <div className="flex flex-col gap-1">
                        <span>Escrow order created!</span>
                        <span className="text-xs text-neutral-400">
                            Order ID: {result.orderId}
                        </span>
                    </div>
                );
                setProductId('');
                setAmount('');
                fetchOrders();
            } else {
                toast.error(result.error || 'Failed to create order');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsCreating(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    return (
        <div className="space-y-6">
            {/* Create Order Form */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 backdrop-blur-sm"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Plus className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Create Escrow Order</h3>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">
                                Product ID
                            </label>
                            <input
                                type="text"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value.toUpperCase())}
                                placeholder="e.g., PROD-001"
                                className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                            />
                            <p className="text-xs text-neutral-500 mt-1">Format: XXXX-000</p>
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">
                                Amount (USDC)
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isCreating ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Package className="w-4 h-4" />
                                Create Escrow Order
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* Orders List */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 backdrop-blur-sm"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Package className="w-5 h-5 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">My Sales Orders</h3>
                    </div>
                    <button
                        onClick={fetchOrders}
                        disabled={isLoading}
                        className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-neutral-400 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {isLoading && sellerOrders.length === 0 ? (
                    <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 text-neutral-600 animate-spin mx-auto mb-2" />
                        <p className="text-neutral-500">Loading orders...</p>
                    </div>
                ) : sellerOrders.length === 0 ? (
                    <div className="text-center py-8">
                        <Package className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                        <p className="text-neutral-500">No escrow orders yet</p>
                        <p className="text-sm text-neutral-600">Create your first order above</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sellerOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                explorerUrl={explorerUrl}
                                onCopy={copyToClipboard}
                                truncateAddress={truncateAddress}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function OrderCard({
    order,
    explorerUrl,
    onCopy,
    truncateAddress,
}: {
    order: EscrowOrder;
    explorerUrl: string;
    onCopy: (text: string, label: string) => void;
    truncateAddress: (address: string) => string;
}) {
    const status = statusConfig[order.status];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 hover:border-neutral-600 transition-colors"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-white">{order.id}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.color} ${status.bg}`}>
                            {status.icon}
                            {order.status}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-amber-400">
                        {order.amount} {order.asset_code}
                    </p>
                </div>
                <div className="text-right text-sm text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString()}
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Escrow Vault:</span>
                    <div className="flex items-center gap-2">
                        <span className="text-neutral-300 font-mono">
                            {truncateAddress(order.escrow_public_key)}
                        </span>
                        <button
                            onClick={() => onCopy(order.escrow_public_key, 'Escrow address')}
                            className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                            <Copy className="w-3 h-3 text-neutral-400" />
                        </button>
                        <a
                            href={`${explorerUrl}/account/${order.escrow_public_key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                            <ExternalLink className="w-3 h-3 text-neutral-400" />
                        </a>
                    </div>
                </div>

                {order.buyer_wallet && (
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Buyer:</span>
                        <span className="text-neutral-300 font-mono">
                            {truncateAddress(order.buyer_wallet)}
                        </span>
                    </div>
                )}

                {order.release_tx_hash && (
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Release TX:</span>
                        <a
                            href={`${explorerUrl}/tx/${order.release_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                            View <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
