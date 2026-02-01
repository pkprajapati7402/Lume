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
import PreConnectRoleModal from './PreConnectRoleModal';
import WalletSelectionModal from './WalletSelectionModal';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { connectSpecificWallet } from '@/lib/wallet-service';
import { useState, useRef, useEffect } from 'react';

export default function LandingPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'employer' | 'employee' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAuthorized, setUserRole, network } = useAuthStore();
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle Get Started button click - show role selection first
  const handleGetStarted = () => {
    setShowRoleModal(true);
  };

  // Handle role selection - then show wallet options
  const handleRoleSelect = (role: 'employer' | 'employee') => {
    setSelectedRole(role);
    setShowRoleModal(false);
    // Small delay for smooth transition
    setTimeout(() => {
      setShowWalletModal(true);
    }, 200);
  };

  // Handle wallet selection and connection
  const handleWalletSelect = async (walletId: string) => {
    console.log('handleWalletSelect called with wallet:', walletId);
    setIsConnecting(true);
    
    try {
      const result = await connectSpecificWallet(network, walletId);
      console.log('connectSpecificWallet result:', result);
      
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
        // Set the role that was selected earlier
        if (selectedRole) {
          setUserRole(selectedRole);
        }
        setAuthorized(result.publicKey);
        setShowWalletModal(false);
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
      if (isMountedRef.current) setIsConnecting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Sending message...');

    try {
      const form = new FormData();
      form.append('access_key', 'acb0f8e7-8363-45af-89e6-4ee071c64258');
      form.append('name', formData.name);
      form.append('email', formData.email);
      form.append('message', formData.message);
      form.append('subject', 'New Contact Form Submission - Lume');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: form
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Message Sent!', {
          id: toastId,
          description: 'Thank you for contacting us. We\'ll get back to you soon.',
          duration: 5000,
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to Send', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Please try again later',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
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
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Users,
      title: 'Bulk Payments',
      description: 'CSV Scaling for mass distributions. Upload your payment list and process hundreds of transactions in one click.',
      color: 'from-neutral-600 to-neutral-700'
    },
    {
      icon: Building2,
      title: 'Direct Off-Ramps',
      description: 'MoneyGram Integration for cash pickups. Your team can withdraw locally without needing a bank account.',
      color: 'from-emerald-600 to-teal-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black">
      <Navbar />
      
      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-32">
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
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    Speed of Light
                  </span>
                </h1>
              </motion.div>

              <motion.p
                variants={fadeInUp}
                className="text-xl sm:text-2xl text-neutral-300 leading-relaxed"
              >
                Pay your international team in seconds with{' '}
                <span className="text-amber-400 font-semibold">90% lower fees</span>{' '}
                using Stellar Path Payments.
              </motion.p>

              {/* CTA Button */}
              <motion.div variants={fadeInUp} className="pt-4 relative z-20">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Hero Get Started clicked');
                    handleGetStarted();
                  }}
                  disabled={isConnecting}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10">
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
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
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
                className="group relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-8 hover:bg-neutral-900/80 transition-all duration-300 hover:scale-105 hover:border-neutral-700"
              >
                {/* Icon Container */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">
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
              <div key={idx} className="flex items-start gap-4 bg-neutral-900/30 rounded-xl p-6 border border-neutral-800/30">
                <div className="p-3 rounded-lg bg-neutral-800/50">
                  <item.icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                  <p className="text-neutral-400 text-sm">{item.desc}</p>
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
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
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
              className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <p className="text-neutral-400">For small teams</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">1%</span>
                  <span className="text-neutral-400">per transaction</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 50 payments/month', 'Individual payouts', 'Basic support', 'Email notifications'].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGetStarted}
                disabled={isConnecting}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                suppressHydrationWarning
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
              className="relative bg-gradient-to-b from-amber-900/20 to-neutral-900/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-2xl p-8 transform scale-105"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <p className="text-neutral-400">For growing companies</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">0.9%</span>
                  <span className="text-neutral-400">per transaction</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {['Unlimited payments', 'Bulk CSV uploads', 'Priority support', 'Advanced analytics', 'API access', 'Custom integrations'].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGetStarted}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                suppressHydrationWarning
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
              className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-neutral-400">For large organizations</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">Custom</span>
                </div>
                <p className="text-neutral-400 text-sm mt-2">Volume discounts available</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['Everything in Pro', 'Dedicated account manager', 'Custom contracts', 'White-label options', '24/7 phone support', 'SLA guarantees'].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                suppressHydrationWarning
              >
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
              <p className="text-neutral-400">Compare Lume to traditional payment methods</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-900/50 rounded-xl p-6 text-center">
                <DollarSign className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <div className="text-sm text-neutral-400 mb-2">Traditional Banks</div>
                <div className="text-3xl font-bold text-red-400">5-7%</div>
                <div className="text-xs text-neutral-500 mt-2">+ 3-5 days delay</div>
              </div>
              <div className="bg-neutral-900/50 rounded-xl p-6 text-center">
                <DollarSign className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <div className="text-sm text-neutral-400 mb-2">Wire Transfers</div>
                <div className="text-3xl font-bold text-amber-400">3-5%</div>
                <div className="text-xs text-neutral-500 mt-2">+ 1-2 days delay</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-xl p-6 text-center border-2 border-emerald-500/30">
                <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <div className="text-sm text-neutral-400 mb-2">Lume</div>
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
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
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
              <div className="space-y-4 text-neutral-300 leading-relaxed">
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
                <div key={idx} className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-amber-400 mb-2">{stat.value}</div>
                  <div className="text-neutral-400 text-sm">{stat.label}</div>
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
                <div key={idx} className="flex gap-4 bg-neutral-900/30 rounded-xl p-6 border border-neutral-800/30">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-neutral-400">{item.desc}</p>
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
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
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
              className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-8"
            >
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div>
                  <label className="block text-neutral-300 text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/50 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="John Doe"
                    autoComplete="name"
                    suppressHydrationWarning
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/50 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="john@company.com"
                    autoComplete="email"
                    suppressHydrationWarning
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 text-sm font-medium mb-2">Message</label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-black/50 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    placeholder="Tell us about your payroll needs..."
                    autoComplete="off"
                    suppressHydrationWarning
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  suppressHydrationWarning
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
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
                    <div className="w-12 h-12 rounded-lg bg-neutral-900/50 border border-neutral-800/50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-neutral-400 text-sm mb-1">Email</div>
                      <div className="text-white font-semibold">support@lume.pay</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-neutral-900/50 border border-neutral-800/50 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-neutral-400 text-sm mb-1">Live Chat</div>
                      <div className="text-white font-semibold">Available 24/7</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6">
                <h4 className="text-white font-semibold mb-3">Enterprise Inquiries</h4>
                <p className="text-neutral-400 text-sm mb-4">
                  Looking to process high volumes? Contact our enterprise team for custom solutions and volume discounts.
                </p>
                <button className="text-amber-400 font-semibold text-sm hover:text-amber-300 transition-colors flex items-center gap-2">
                  Schedule a Call
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-800/30 rounded-xl p-6">
                <h4 className="text-white font-semibold mb-3">FAQs & Documentation</h4>
                <p className="text-neutral-400 text-sm mb-4">
                  Check out our comprehensive documentation and frequently asked questions.
                </p>
                <button className="text-amber-400 font-semibold text-sm hover:text-amber-300 transition-colors flex items-center gap-2">
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
          <div className="relative bg-gradient-to-r from-neutral-900/50 to-neutral-900/30 backdrop-blur-sm border border-neutral-700/50 rounded-3xl p-12 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-orange-600/5 blur-xl" />
            
            <div className="relative space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Ready to revolutionize your payroll?
              </h2>
              <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
                Join thousands of companies using Stellar Payroll to pay their global teams faster and cheaper.
              </p>
              <button
                onClick={handleGetStarted}
                disabled={isConnecting}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-8 py-4 rounded-xl text-lg font-semibold hover:from-amber-300 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Pre-connect Role Selection Modal */}
      <PreConnectRoleModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleSelect={handleRoleSelect}
      />

      {/* Wallet Selection Modal */}
      {selectedRole && (
        <WalletSelectionModal
          isOpen={showWalletModal}
          onClose={() => {
            setShowWalletModal(false);
            setSelectedRole(null);
          }}
          onSelectWallet={handleWalletSelect}
          selectedRole={selectedRole}
        />
      )}
    </div>
  );
}
