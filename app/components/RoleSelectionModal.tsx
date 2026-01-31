'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Sparkles, ArrowRight, Wallet, Shield, Users, TrendingUp } from 'lucide-react';
import { useAuthStore, UserRole } from '../store/authStore';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
}

export default function RoleSelectionModal({
  isOpen,
  onClose,
  publicKey,
}: RoleSelectionModalProps) {
  const { setUserRole } = useAuthStore();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    onClose();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const roles = [
    {
      id: 'employer' as UserRole,
      title: 'Employer',
      subtitle: 'Business Owner / HR Manager',
      description: 'Manage payroll, pay employees, track expenses, and handle compliance',
      icon: Building2,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/20 to-purple-500/10',
      borderColor: 'border-violet-500/30',
      hoverBorder: 'hover:border-violet-400',
      features: [
        { icon: Users, text: 'Manage employee directory' },
        { icon: Wallet, text: 'Process bulk payments' },
        { icon: Shield, text: 'Tax & compliance tools' },
      ],
    },
    {
      id: 'employee' as UserRole,
      title: 'Employee',
      subtitle: 'Team Member / Freelancer',
      description: 'View wallet, send payments, track spending, and invest in liquidity pools',
      icon: User,
      gradient: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-500/20 to-blue-500/10',
      borderColor: 'border-cyan-500/30',
      hoverBorder: 'hover:border-cyan-400',
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#0d0d14] border border-white/10 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-cyan-600/20 border-b border-white/5 p-8 text-center">
              {/* Background Effects */}
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />
              <div className="absolute top-0 right-1/4 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="relative inline-flex p-4 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl mb-4"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className="relative text-2xl font-bold text-white mb-2">
                Welcome to Lume!
              </h2>
              <p className="relative text-gray-400 mb-4">
                Choose how you'd like to use the platform
              </p>
              
              {/* Connected Wallet Badge */}
              <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">Connected:</span>
                <code className="text-sm text-white font-mono">{truncateAddress(publicKey)}</code>
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
                          <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-1">
                          {role.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          {role.subtitle}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          {role.description}
                        </p>
                        
                        {/* Features */}
                        <div className="space-y-2">
                          {role.features.map((feature, idx) => {
                            const FeatureIcon = feature.icon;
                            return (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                                <FeatureIcon className="w-4 h-4 text-gray-500" />
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
                className="text-center text-sm text-gray-500 mt-6"
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
