'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import MainDashboard from './MainDashboard';
import LandingPage from './LandingPage';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const { isAuthorized, hasHydrated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side mount
  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isAuthorized ? (
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LandingPage />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MainDashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
