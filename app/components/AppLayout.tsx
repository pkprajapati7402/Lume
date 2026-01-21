'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import MainDashboard from './MainDashboard';
import LandingPage from './LandingPage';

export default function AppLayout() {
  const { isAuthorized } = useAuthStore();

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
