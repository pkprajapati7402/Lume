'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useTransition } from 'react';
import { Search, Plus, Trash2, Wallet, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { addEmployee, deleteEmployee } from '@/app/actions/employees';
import { useAuthStore } from '@/app/store/authStore';
import type { Employee } from '@/types/database';
import EmployeeDetailModal from './EmployeeDetailModal';

interface DirectorySectionProps {
  initialEmployees: Employee[];
}

export default function DirectorySection({ initialEmployees }: DirectorySectionProps) {
  const { publicKey, network } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmployees(initialEmployees);
  }, [initialEmployees]);

  const refreshEmployees = async () => {
    if (!publicKey) return;
    
    const { getEmployees } = await import('@/app/actions/employees');
    const result = await getEmployees(publicKey);
    if (result.data) {
      setEmployees(result.data);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.wallet_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!publicKey) {
      toast.error('Wallet Not Connected', {
        description: 'Please connect your wallet to add employees',
      });
      return;
    }
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('ownerWallet', publicKey);
    
    startTransition(async () => {
      const result = await addEmployee(formData);
      
      if (result.error) {
        toast.error('Failed to Add Employee', {
          description: result.error,
        });
      } else {
        const employeeName = formData.get('name') as string;
        toast.success('Employee Added', {
          description: `${employeeName} has been added to the directory`,
        });
        setShowAddModal(false);
        form.reset();
        await refreshEmployees();
      }
    });
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    if (!publicKey) {
      toast.error('Wallet Not Connected', {
        description: 'Please connect your wallet first',
      });
      return;
    }

    startTransition(async () => {
      const result = await deleteEmployee(employeeId, publicKey);
      
      if (result.error) {
        toast.error('Failed to Delete Employee', {
          description: result.error,
        });
      } else {
        toast.success('Employee Deleted', {
          description: 'Employee has been removed from the directory',
        });
        await refreshEmployees();
      }
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Employee Directory</h2>
          <p className="text-slate-400">Manage your team members and payment preferences</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-indigo-500/25"
          suppressHydrationWarning
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or country..."
          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </motion.div>

      {/* Employee Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredEmployees.map((employee, index) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 transition-all hover:scale-[1.02] group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {employee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{employee.full_name}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    <span>{employee.department}</span>
                  </div>
                </div>
              </div>
              
              {/* Delete Button */}
              <button 
                onClick={() => handleDeleteEmployee(employee.id)}
                disabled={isPending}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="w-4 h-4 text-slate-500" />
                <span className="text-slate-400 text-xs">{employee.role}</span>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 mb-1">Wallet Address</div>
                <div className="font-mono text-xs text-slate-300 bg-slate-900/50 px-3 py-2 rounded border border-slate-700 break-all">
                  {employee.wallet_address}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Preferred Asset</div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {employee.preferred_asset}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={() => setSelectedEmployee(employee)}
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View History
              </button>
              <button className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-lg font-medium transition-all">
                Quick Pay
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">
            {employees.length === 0 ? 'No employees yet. Add your first team member!' : 'No employees found matching your search.'}
          </p>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add New Employee</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Stellar Wallet Address *
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  required
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Software Engineer"
                  defaultValue="Employee"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Engineering"
                  defaultValue="General"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preferred Asset
                </label>
                <select
                  name="preferredAsset"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue="USDC"
                  suppressHydrationWarning
                >
                  <option value="USDC">USDC</option>
                  <option value="EURT">EURT</option>
                  <option value="BRLT">BRLT</option>
                  <option value="NGNT">NGNT</option>
                  <option value="XLM">XLM</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  suppressHydrationWarning
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  suppressHydrationWarning
                >
                  {isPending ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          network={network}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}
