'use client';

import { motion } from 'framer-motion';
import { Zap, Users, Building2, ArrowRight, Wallet } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuthStore } from '../store/authStore';
import * as freighter from '@stellar/freighter-api';
import { useState } from 'react';

export default function LandingPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { setAuthorized } = useAuthStore();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Check if Freighter is installed
      const connected = await freighter.isConnected();
      
      if (!connected) {
        window.open('https://www.freighter.app/', '_blank');
        alert('Freighter wallet is not installed. Please install it from freighter.app and refresh the page.');
        setIsConnecting(false);
        return;
      }

      // Request access to the wallet
      const accessResult = await freighter.requestAccess();
      
      if (accessResult.error) {
        console.error('Access denied:', accessResult.error);
        alert('Access to Freighter wallet was denied. Please try again and approve the request.');
        setIsConnecting(false);
        return;
      }

      // Get the wallet address
      const addressResult = await freighter.getAddress();
      
      if (addressResult.error) {
        console.error('Failed to get address:', addressResult.error);
        alert('Failed to retrieve wallet address. Please try again.');
        setIsConnecting(false);
        return;
      }

      if (addressResult.address) {
        console.log('Connected to wallet:', addressResult.address);
        setAuthorized(addressResult.address);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Individual Payouts',
      description: 'Instant FX conversion for single payments. Send to any team member worldwide with real-time exchange rates.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Bulk Payments',
      description: 'CSV Scaling for mass distributions. Upload your payment list and process hundreds of transactions in one click.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Building2,
      title: 'Direct Off-Ramps',
      description: 'MoneyGram Integration for cash pickups. Your team can withdraw locally without needing a bank account.',
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-32">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center space-y-8"
          >
            {/* Hero Content */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                Global Payroll at the{' '}
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Speed of Light
                </span>
              </h1>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              Pay your international team in seconds with{' '}
              <span className="text-purple-400 font-semibold">90% lower fees</span>{' '}
              using Stellar Path Payments.
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={fadeInUp} className="pt-4">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-5 h-5" />
                {isConnecting ? 'Connecting...' : 'Get Started'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Feature Grid Section */}
        <div id="features" className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-32">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/80 transition-all duration-300 hover:scale-105 hover:border-slate-600"
              >
                {/* Icon Container */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect border gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pb-32"
        >
          <div className="relative bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-12 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 blur-xl" />
            
            <div className="relative space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Ready to revolutionize your payroll?
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                Join thousands of companies using Stellar Payroll to pay their global teams faster and cheaper.
              </p>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-100 transition-all duration-300 hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-5 h-5" />
                {isConnecting ? 'Connecting...' : 'Start Paying Globally'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
