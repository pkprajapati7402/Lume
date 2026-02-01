'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import MainDashboard from './MainDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import LandingPage from './LandingPage';
import RoleSelectionModal from './RoleSelectionModal';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const { isAuthorized, hasHydrated, publicKey, userRole } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show role selection modal only if authorized but no role selected
  // This handles edge cases like returning users who connected but never selected a role
  useEffect(() => {
    if (isAuthorized && publicKey && !userRole) {
      setShowRoleModal(true);
    } else {
      setShowRoleModal(false);
    }
  }, [isAuthorized, publicKey, userRole]);

  // Prevent hydration mismatch by not rendering until client-side mount
  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  // Render the appropriate dashboard based on role
  const renderDashboard = () => {
    if (userRole === 'employee') {
      return <EmployeeDashboard />;
    }
    return <MainDashboard />;
  };

  return (
    <>
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
            {renderDashboard()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        publicKey={publicKey || ''}
      />
    </>
  );
}
