'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ShoppingBag } from 'lucide-react';
import MySalesSection from './MySalesSection';
import MarketplaceSection from './MarketplaceSection';

interface EscrowTabProps {
    walletAddress: string;
    network: 'testnet' | 'mainnet';
    userRole: 'employer' | 'employee';
}

type TabType = 'sales' | 'marketplace';

export default function EscrowTab({ walletAddress, network, userRole }: EscrowTabProps) {
    // Default to marketplace for employees, sales for employers
    const [activeTab, setActiveTab] = useState<TabType>(
        userRole === 'employee' ? 'marketplace' : 'sales'
    );

    const tabs = [
        { 
            id: 'sales' as TabType, 
            label: 'My Sales', 
            icon: Store,
            description: 'Create and manage escrow orders'
        },
        { 
            id: 'marketplace' as TabType, 
            label: 'Marketplace', 
            icon: ShoppingBag,
            description: 'Find and pay for orders'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                    Escrow & Secure Trade
                </h2>
                <p className="text-neutral-400">
                    2-of-3 multisig escrow for secure peer-to-peer transactions
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                            activeTab === tab.id
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'sales' ? (
                        <MySalesSection 
                            walletAddress={walletAddress} 
                            network={network} 
                        />
                    ) : (
                        <MarketplaceSection 
                            walletAddress={walletAddress} 
                            network={network} 
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
