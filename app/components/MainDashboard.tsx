'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Wallet, 
  LayoutDashboard,
  Send,
  Upload,
  Users,
  LogOut,
  Menu,
  X,
  History,
  BarChart3,
  FileText,
  UserCog,
  ShieldCheck
} from 'lucide-react';
import OverviewSection from './dashboard/OverviewSection';
import PayEmployeeSection from './dashboard/PayEmployeeSection';
import BulkUploadSection from './dashboard/BulkUploadSection';
import DirectorySection from './dashboard/DirectorySection';
import HistoryTable from './dashboard/HistoryTable';
import AnalyticsDashboard from './dashboard/AnalyticsDashboard';
import ComplianceSection from './dashboard/ComplianceSection';
import { EscrowTab } from './escrow';
import { getEmployees } from '../actions/employees';
import type { Employee } from '@/types/database';

type Section = 'overview' | 'pay' | 'bulk' | 'directory' | 'history' | 'analytics' | 'compliance' | 'escrow';

interface PrefilledPaymentData {
  recipientAddress?: string;
  recipientName?: string;
  preferredAsset?: string;
}

export default function MainDashboard() {
  const { publicKey, setGuest, network, setNetwork, setUserRole } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [prefilledPaymentData, setPrefilledPaymentData] = useState<PrefilledPaymentData | undefined>(undefined);

  useEffect(() => {
    if (activeSection === 'directory' && publicKey) {
      loadEmployees();
    }
  }, [activeSection, publicKey]);

  const loadEmployees = async () => {
    if (!publicKey) return;
    
    setIsLoadingEmployees(true);
    const result = await getEmployees(publicKey);
    if (result.data) {
      setEmployees(result.data);
    }
    setIsLoadingEmployees(false);
  };

  const handleDisconnect = () => {
    setGuest();
  };

  const handleNetworkToggle = () => {
    setNetwork(network === 'testnet' ? 'mainnet' : 'testnet');
  };

  const navItems = [
    { id: 'overview' as Section, label: 'Overview', icon: LayoutDashboard },
    { id: 'pay' as Section, label: 'Pay Employee', icon: Send },
    { id: 'bulk' as Section, label: 'Bulk Upload', icon: Upload },
    { id: 'directory' as Section, label: 'Directory', icon: Users },
    { id: 'history' as Section, label: 'Transaction History', icon: History },
    { id: 'analytics' as Section, label: 'Analytics', icon: BarChart3 },
    { id: 'compliance' as Section, label: 'Compliance', icon: FileText },
    { id: 'escrow' as Section, label: 'Escrow', icon: ShieldCheck },
  ];

  const handleQuickPay = (employeeData: PrefilledPaymentData) => {
    setPrefilledPaymentData(employeeData);
    setActiveSection('pay');
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section as Section);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection onNavigate={handleNavigate} />;
      case 'pay':
        return <PayEmployeeSection prefilledData={prefilledPaymentData} />;
      case 'bulk':
        return <BulkUploadSection />;
      case 'directory':
        return <DirectorySection initialEmployees={employees} onQuickPay={handleQuickPay} />;
      case 'history':
        return <HistoryTable />;
      case 'analytics':
        return <AnalyticsDashboard publicKey={publicKey || ''} network={network} />;
      case 'compliance':
        return <ComplianceSection publicKey={publicKey || ''} network={network} />;
      case 'escrow':
        return <EscrowTab walletAddress={publicKey || ''} network={network} userRole="employer" />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-neutral-800/50">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center">
              <Image 
                src="/lume-logo.png" 
                alt="Lume" 
                width={120} 
                height={44} 
                className="h-11 w-auto object-contain"
              />
            </div>
          </div>
          
          {/* Wallet Info & Disconnect */}
          <div className="flex items-center gap-3">
            {/* Network Toggle */}
            <button
              onClick={handleNetworkToggle}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/50 hover:bg-neutral-800 rounded-lg border border-neutral-700/50 transition-colors group"
              title={`Switch to ${network === 'testnet' ? 'mainnet' : 'testnet'}`}
            >
              <div className={`w-2 h-2 rounded-full ${network === 'testnet' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              <span className="text-neutral-300 text-sm font-medium capitalize">
                {network}
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-neutral-900/50 rounded-lg border border-neutral-700/50">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span className="text-neutral-300 text-sm font-mono">
                {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
              </span>
            </div>
            <button
              onClick={() => setUserRole(null)}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
              title="Switch Role"
            >
              <UserCog className="w-5 h-5" />
            </button>
            <button
              onClick={handleDisconnect}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
              title="Disconnect"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 w-64 bg-black/95 backdrop-blur-md border-r border-neutral-800/50 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800/50">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-300 text-sm font-medium mb-1">Need Help?</p>
            <p className="text-neutral-400 text-xs">Check our documentation or contact support</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
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
      </main>
    </div>
  );
}
