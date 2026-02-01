'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Wallet, 
  LayoutDashboard,
  Send,
  BarChart3,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Copy,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Droplets,
  User,
  Settings,
  Bell,
  Moon,
  UserCog,
  ShieldCheck
} from 'lucide-react';
import WalletSection from './employee-dashboard/WalletSection';
import SendPaymentSection from './employee-dashboard/SendPaymentSection';
import SpendingAnalytics from './employee-dashboard/SpendingAnalytics';
import InvestSection from './employee-dashboard/InvestSection';
import { EscrowTab } from './escrow';

type Section = 'wallet' | 'send' | 'analytics' | 'invest' | 'escrow';

export default function EmployeeDashboard() {
  const { publicKey, setGuest, network, setNetwork, setUserRole } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>('wallet');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDisconnect = () => {
    setGuest();
  };

  const handleNetworkToggle = () => {
    setNetwork(network === 'testnet' ? 'mainnet' : 'testnet');
  };

  const navItems = [
    { id: 'wallet' as Section, label: 'My Wallet', icon: Wallet },
    { id: 'send' as Section, label: 'Send Payment', icon: Send },
    { id: 'analytics' as Section, label: 'Analytics', icon: BarChart3 },
    { id: 'invest' as Section, label: 'Invest', icon: TrendingUp },
    { id: 'escrow' as Section, label: 'Escrow', icon: ShieldCheck },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'wallet':
        return <WalletSection />;
      case 'send':
        return <SendPaymentSection />;
      case 'analytics':
        return <SpendingAnalytics />;
      case 'invest':
        return <InvestSection />;
      case 'escrow':
        return <EscrowTab walletAddress={publicKey || ''} network={network} userRole="employee" />;
      default:
        return <WalletSection />;
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/10 via-black to-neutral-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/3 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(251,191,36,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(251,191,36,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-black/95 backdrop-blur-xl border-r border-neutral-800/50 z-50 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-lg opacity-50" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Image 
                  src="/lume-logo.png" 
                  alt="Lume" 
                  width={120} 
                  height={44} 
                  className="h-11 w-auto object-contain"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Employee Portal</p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto lg:hidden p-2 hover:bg-neutral-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </motion.div>

          {/* User Card */}
          <motion.div 
            className="mb-8 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Employee</p>
                <p className="text-xs text-neutral-500 truncate">
                  {publicKey ? truncateAddress(publicKey) : 'Not connected'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-1 rounded-full ${
                network === 'testnet' 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {network === 'testnet' ? 'Testnet' : 'Mainnet'}
              </span>
              <span className="text-neutral-500">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive 
                      ? 'bg-amber-500/10 text-white border border-amber-500/20' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/30 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBg"
                      className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/5"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className={`relative p-2 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25' 
                      : 'bg-neutral-800/50 group-hover:bg-neutral-700/50'
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'}`} />
                  </div>
                  <span className={`relative font-medium ${isActive ? 'text-amber-50' : ''}`}>{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-amber-500"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="space-y-2 pt-4 border-t border-neutral-800/50">
            <button
              onClick={handleNetworkToggle}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-all group"
            >
              <div className="p-2 rounded-lg bg-neutral-800/50 group-hover:bg-neutral-700/50 transition-colors">
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-medium">Switch Network</span>
            </button>
            <button
              onClick={() => setUserRole(null)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all group"
            >
              <div className="p-2 rounded-lg bg-neutral-800/50 group-hover:bg-amber-500/20 transition-colors">
                <UserCog className="w-4 h-4 group-hover:text-amber-400" />
              </div>
              <span className="font-medium">Switch Role</span>
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
            >
              <div className="p-2 rounded-lg bg-neutral-800/50 group-hover:bg-red-500/20 transition-colors">
                <LogOut className="w-4 h-4 group-hover:text-red-400" />
              </div>
              <span className="font-medium">Disconnect</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen relative z-10">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-neutral-800/50 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-neutral-400" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {navItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="text-sm text-neutral-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2.5 hover:bg-neutral-800/50 rounded-xl transition-colors relative group">
                <Bell className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-neutral-900/50 rounded-xl border border-neutral-800/50">
                <div className={`w-2 h-2 rounded-full ${
                  network === 'testnet' ? 'bg-amber-400' : 'bg-emerald-400'
                } animate-pulse`} />
                <span className="text-sm text-neutral-400">
                  {network === 'testnet' ? 'Stellar Testnet' : 'Stellar Mainnet'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
