'use client';

import Link from 'next/link';
import { Sparkles, Menu, X, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { connectWallet } from '@/lib/wallet-service';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { setAuthorized, network } = useAuthStore();

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      const result = await connectWallet(network);
      
      if (!result.success) {
        if (result.error?.includes('cancelled')) {
          toast.info('Connection Cancelled', {
            description: 'Wallet connection was cancelled',
          });
        } else {
          toast.error('Connection Failed', {
            description: result.error || 'Failed to connect wallet',
            duration: 5000,
          });
        }
        setIsConnecting(false);
        return;
      }

      if (result.publicKey) {
        console.log('Connected to wallet:', result.publicKey);
        setAuthorized(result.publicKey);
        toast.success('Wallet Connected', {
          description: `Connected to ${result.publicKey.slice(0, 8)}...${result.publicKey.slice(-8)}`,
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Connection Error', {
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <div className="absolute inset-0 bg-purple-500/30 blur-xl group-hover:bg-purple-400/40 transition-all" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Lume
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Get Started'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800/50">
          <div className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-slate-300 hover:text-white transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Get Started'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
