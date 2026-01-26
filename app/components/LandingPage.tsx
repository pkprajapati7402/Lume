'use client';

import { motion } from 'framer-motion';
import { 
  Zap, 
  Users, 
  Building2, 
  ArrowRight, 
  Wallet, 
  CheckCircle, 
  Globe, 
  Shield, 
  TrendingDown,
  Clock,
  DollarSign,
  Mail,
  MessageSquare,
  Send
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import AnimatedBackground from './AnimatedBackground';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { connectWallet } from '@/lib/wallet-service';
import { useState, useRef, useEffect } from 'react';

export default function LandingPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const { setAuthorized, network } = useAuthStore();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleConnect = async () => {
    if (!isMountedRef.current) return;
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
        if (isMountedRef.current) {
          setIsConnecting(false);
        }
        return;
      }

      if (result.publicKey) {
        console.log('Connected to wallet:', result.publicKey);
        setAuthorized(result.publicKey);
        toast.success('Wallet Connected', {
          description: `Connected to ${result.publicKey.slice(0, 8)}...${result.publicKey.slice(-8)}`,
        });
        if (isMountedRef.current) {
          setShowWalletModal(false);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Connection Error', {
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
      });
    } finally {
      if (isMountedRef.current) setIsConnecting(false);
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
        {/* Animated Background */}
        <AnimatedBackground />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-32">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
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
                className="text-xl sm:text-2xl text-slate-300 leading-relaxed"
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
                  suppressHydrationWarning
                >
                  <Wallet className="w-5 h-5" />
                  {isConnecting ? 'Connecting...' : 'Get Started'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            {/* Right Column - Illustration */}
            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
                <img
                  src="/payment-illustration.png"
                  alt="Global payment illustration"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Feature Grid Section */}
        <div id="features" className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Powerful features designed for modern global teams
            </p>
          </motion.div>

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

          {/* Additional Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            {[
              { icon: Globe, title: 'Global Reach', desc: '180+ countries supported' },
              { icon: Shield, title: 'Secure', desc: 'Bank-level encryption' },
              { icon: Clock, title: '5-Second Settlements', desc: 'Lightning fast transfers' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                <div className="p-3 rounded-lg bg-slate-700/50">
                  <item.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Pay only 1% per transaction. No hidden fees, no surprises.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <p className="text-slate-400">For small teams</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">1%</span>
                  <span className="text-slate-400">per transaction</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 50 payments/month', 'Individual payouts', 'Basic support', 'Email notifications'].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? 'Connecting...' : 'Get Started'}
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative bg-gradient-to-b from-purple-900/40 to-slate-800/50 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl p-8 transform scale-105"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <p className="text-slate-400">For growing companies</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">0.9%</span>
                  <span className="text-slate-400">per transaction</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {['Unlimited payments', 'Bulk CSV uploads', 'Priority support', 'Advanced analytics', 'API access', 'Custom integrations'].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? 'Connecting...' : 'Get Started'}
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-slate-400">For large organizations</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">Custom</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">Volume discounts available</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['Everything in Pro', 'Dedicated account manager', 'Custom contracts', 'White-label options', '24/7 phone support', 'SLA guarantees'].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                Contact Sales
              </button>
            </motion.div>
          </div>

          {/* Savings Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-8 max-w-4xl mx-auto"
          >
            <div className="text-center mb-6">
              <TrendingDown className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">See Your Savings</h3>
              <p className="text-slate-400">Compare Lume to traditional payment methods</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 text-center">
                <DollarSign className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <div className="text-sm text-slate-400 mb-2">Traditional Banks</div>
                <div className="text-3xl font-bold text-red-400">5-7%</div>
                <div className="text-xs text-slate-500 mt-2">+ 3-5 days delay</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 text-center">
                <DollarSign className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <div className="text-sm text-slate-400 mb-2">Wire Transfers</div>
                <div className="text-3xl font-bold text-amber-400">3-5%</div>
                <div className="text-xs text-slate-500 mt-2">+ 1-2 days delay</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-xl p-6 text-center border-2 border-emerald-500/30">
                <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <div className="text-sm text-slate-400 mb-2">Lume</div>
                <div className="text-3xl font-bold text-emerald-400">1%</div>
                <div className="text-xs text-emerald-400 mt-2">Instant settlement</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* About Section */}
        <div id="about" className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              About Lume
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Revolutionizing global payroll with blockchain technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-bold text-white mb-6">
                Built on the Stellar Network
              </h3>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Lume leverages the power of Stellar's blockchain to provide fast, affordable, and reliable cross-border payments. Our mission is to make global payroll accessible to companies of all sizes.
                </p>
                <p>
                  Traditional payment systems are slow, expensive, and complex. We believe that paying your international team shouldn't cost a fortune or take days to process. That's why we built Lume.
                </p>
                <p>
                  With Stellar's path payment functionality, we automatically find the best exchange rates and routes for your payments, ensuring your team gets paid quickly and you save money on every transaction.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { label: 'Countries Supported', value: '180+' },
                { label: 'Average Settlement', value: '5 sec' },
                { label: 'Transaction Fee', value: '1%' },
                { label: 'Uptime', value: '99.9%' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Why Choose Lume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20"
          >
            <h3 className="text-3xl font-bold text-white mb-10 text-center">Why Choose Lume?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Transparent Pricing',
                  desc: 'No hidden fees. Just a flat 1% transaction fee with volume discounts for enterprises.',
                  icon: DollarSign
                },
                {
                  title: 'Lightning Fast',
                  desc: 'Settlements in 5 seconds. Your team gets paid instantly, not in 3-5 business days.',
                  icon: Zap
                },
                {
                  title: 'Global Coverage',
                  desc: 'Pay anyone, anywhere. Support for 180+ countries and multiple currencies.',
                  icon: Globe
                },
                {
                  title: 'Bank-Grade Security',
                  desc: 'Built on Stellar, a proven blockchain network trusted by financial institutions worldwide.',
                  icon: Shield
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Have questions? We're here to help.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8"
            >
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Message</label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    placeholder="Tell us about your payroll needs..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Email</div>
                      <div className="text-white font-semibold">support@lume.pay</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Live Chat</div>
                      <div className="text-white font-semibold">Available 24/7</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                <h4 className="text-white font-semibold mb-3">Enterprise Inquiries</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Looking to process high volumes? Contact our enterprise team for custom solutions and volume discounts.
                </p>
                <button className="text-purple-400 font-semibold text-sm hover:text-purple-300 transition-colors flex items-center gap-2">
                  Schedule a Call
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
                <h4 className="text-white font-semibold mb-3">FAQs & Documentation</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Check out our comprehensive documentation and frequently asked questions.
                </p>
                <button className="text-purple-400 font-semibold text-sm hover:text-purple-300 transition-colors flex items-center gap-2">
                  View Docs
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
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
