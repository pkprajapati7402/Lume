'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, ArrowRight, Wallet, Shield, Users, TrendingUp, X } from 'lucide-react';
import Image from 'next/image';
import { UserRole } from '../store/authStore';

interface PreConnectRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (role: 'employer' | 'employee') => void;
}

export default function PreConnectRoleModal({
  isOpen,
  onClose,
  onRoleSelect,
}: PreConnectRoleModalProps) {

  const handleRoleSelect = (role: 'employer' | 'employee') => {
    onRoleSelect(role);
  };

  const roles = [
    {
      id: 'employer' as const,
      title: 'Employer',
      subtitle: 'Business Owner / HR Manager',
      description: 'Manage payroll, pay employees, track expenses, and handle compliance',
      icon: Building2,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/10 to-orange-500/5',
      borderColor: 'border-amber-500/30',
      hoverBorder: 'hover:border-amber-400',
      features: [
        { icon: Users, text: 'Manage employee directory' },
        { icon: Wallet, text: 'Process bulk payments' },
        { icon: Shield, text: 'Tax & compliance tools' },
      ],
    },
    {
      id: 'employee' as const,
      title: 'Employee',
      subtitle: 'Team Member / Freelancer',
      description: 'View wallet, send payments, track spending, and invest in liquidity pools',
      icon: User,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      hoverBorder: 'hover:border-emerald-400',
      features: [
        { icon: Wallet, text: 'Wallet & QR code' },
        { icon: ArrowRight, text: 'Send payments' },
        { icon: TrendingUp, text: 'Invest & analytics' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-black border border-neutral-800 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden my-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-amber-600/10 via-orange-600/5 to-emerald-600/10 border-b border-neutral-800 p-8 text-center">
              {/* Background Effects */}
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute top-0 right-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="relative inline-flex p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30 mb-4"
              >
                <Image 
                  src="/lume-logo.png" 
                  alt="Lume" 
                  width={120} 
                  height={44} 
                  className="h-11 w-auto object-contain"
                />
              </motion.div>
              
              <h2 className="relative text-2xl font-bold text-white mb-2">
                How will you use Lume?
              </h2>
              <p className="relative text-neutral-400 mb-2">
                Select your role to get started
              </p>
              
              {/* Step Indicator */}
              <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/50 rounded-full border border-neutral-800">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-xs font-bold text-black">1</span>
                <span className="text-sm text-neutral-400">Choose Role</span>
                <span className="text-neutral-600 mx-1">→</span>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-700 text-xs font-bold text-neutral-400">2</span>
                <span className="text-sm text-neutral-500">Connect Wallet</span>
              </div>
            </div>

            {/* Role Selection */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role, index) => {
                  const Icon = role.icon;
                  return (
                    <motion.button
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${role.bgGradient} border ${role.borderColor} ${role.hoverBorder} p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                    >
                      {/* Hover Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      <div className="relative">
                        {/* Icon & Title */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${role.gradient}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-1">
                          {role.title}
                        </h3>
                        <p className="text-sm text-neutral-400 mb-3">
                          {role.subtitle}
                        </p>
                        <p className="text-sm text-neutral-500 mb-4">
                          {role.description}
                        </p>
                        
                        {/* Features */}
                        <div className="space-y-2">
                          {role.features.map((feature, idx) => {
                            const FeatureIcon = feature.icon;
                            return (
                              <div key={idx} className="flex items-center gap-2 text-sm text-neutral-400">
                                <FeatureIcon className="w-4 h-4 text-neutral-500" />
                                <span>{feature.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer Note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm text-neutral-500 mt-6"
              >
                You can switch roles anytime from the dashboard settings
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
