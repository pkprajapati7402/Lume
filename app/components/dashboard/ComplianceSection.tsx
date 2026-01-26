'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  RefreshCw,
  Shield,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import type { NetworkType } from '@/app/store/authStore';
import { json2csv } from 'json-2-csv';
import TaxFormGenerator from './TaxFormGenerator';

interface ComplianceSectionProps {
  publicKey: string;
  network: NetworkType;
}

interface EmployeeComplianceData {
  id: string;
  full_name: string;
  wallet_address: string;
  employee_type: 'employee' | 'contractor';
  department: string;
  tax_rate: number;
  total_gross: number;
  total_tax_withheld: number;
  total_net: number;
  payment_count: number;
}

export default function ComplianceSection({ publicKey, network }: ComplianceSectionProps) {
  const [loading, setLoading] = useState(true);
  const [complianceData, setComplianceData] = useState<EmployeeComplianceData[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<'all' | 'employee' | 'contractor'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeComplianceData | null>(null);
  const [showTaxFormModal, setShowTaxFormModal] = useState(false);

  // Generate array of years from 2020 to current year
  const years = Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => 2020 + i).reverse();

  useEffect(() => {
    fetchComplianceData();
  }, [publicKey, selectedYear]);

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch employees
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, full_name, wallet_address, employee_type, department, tax_rate')
        .eq('owner_wallet_address', publicKey);

      if (empError) throw empError;

      // Fetch payouts for the selected year
      const startDate = new Date(selectedYear, 0, 1).toISOString();
      const endDate = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

      const { data: payouts, error: payError } = await supabase
        .from('payouts')
        .select('employee_id, amount, tax_withheld, net_amount, asset_code')
        .eq('owner_wallet_address', publicKey)
        .eq('status', 'success')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (payError) throw payError;

      // Aggregate data by employee
      const aggregated: EmployeeComplianceData[] = (employees || []).map((emp: any) => {
        const employeePayouts = (payouts || []).filter(p => p.employee_id === emp.id);
        
        const total_gross = employeePayouts.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const total_tax_withheld = employeePayouts.reduce((sum, p) => sum + parseFloat(p.tax_withheld || 0), 0);
        const total_net = employeePayouts.reduce((sum, p) => sum + parseFloat(p.net_amount || p.amount || 0), 0);

        // Calculate tax withheld if not already stored (for older records)
        const calculatedTaxWithheld = total_tax_withheld > 0 
          ? total_tax_withheld 
          : total_gross * (emp.tax_rate / 100);

        return {
          id: emp.id,
          full_name: emp.full_name,
          wallet_address: emp.wallet_address,
          employee_type: emp.employee_type || 'contractor',
          department: emp.department,
          tax_rate: emp.tax_rate || 20,
          total_gross,
          total_tax_withheld: calculatedTaxWithheld,
          total_net: total_gross - calculatedTaxWithheld,
          payment_count: employeePayouts.length,
        };
      });

      setComplianceData(aggregated);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      toast.error('Failed to Load Compliance Data', {
        description: 'Could not fetch tax and compliance information',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  const filteredData = complianceData.filter(emp => {
    // Employee type filter
    if (employeeTypeFilter !== 'all' && emp.employee_type !== employeeTypeFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        emp.full_name.toLowerCase().includes(query) ||
        emp.wallet_address.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Calculate totals
  const totalGrossPay = filteredData.reduce((sum, emp) => sum + emp.total_gross, 0);
  const totalTaxWithheld = filteredData.reduce((sum, emp) => sum + emp.total_tax_withheld, 0);
  const totalNetDisbursed = filteredData.reduce((sum, emp) => sum + emp.total_net, 0);
  const totalEmployees = filteredData.filter(e => e.employee_type === 'employee').length;
  const totalContractors = filteredData.filter(e => e.employee_type === 'contractor').length;

  // Export Annual Compliance Report
  const handleExportCSV = async () => {
    try {
      const exportData = filteredData.map(emp => ({
        'Employee Name': emp.full_name,
        'Wallet Address': emp.wallet_address,
        'Employee Type': emp.employee_type === 'employee' ? 'W-2 Employee' : '1099-NEC Contractor',
        'Department': emp.department,
        'Tax Rate (%)': emp.tax_rate,
        'Total Gross Pay (USD)': emp.total_gross.toFixed(2),
        'Tax Withheld (USD)': emp.total_tax_withheld.toFixed(2),
        'Net Disbursed (USD)': emp.total_net.toFixed(2),
        'Payment Count': emp.payment_count,
        'Year': selectedYear,
      }));

      const csv = json2csv(exportData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LUME_Annual_Compliance_Report_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Report Exported', {
        description: `${filteredData.length} employee records exported for ${selectedYear}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export Failed', {
        description: 'Could not export compliance report',
      });
    }
  };

  const handleGenerateTaxForm = (employee: EmployeeComplianceData) => {
    setSelectedEmployee(employee);
    setShowTaxFormModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-400" />
            Compliance & Tax Reporting
          </h2>
          <p className="text-slate-400">
            Advanced compliance dashboard for tax reporting and regulatory filings
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchComplianceData}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg 
                   flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white 
                       focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Employee Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={employeeTypeFilter}
              onChange={(e) => setEmployeeTypeFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white 
                       focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="employee">W-2 Employees</option>
              <option value="contractor">1099-NEC Contractors</option>
            </select>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 
                     text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 
                     text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-400">
          Showing {filteredData.length} of {complianceData.length} employees
          {employeeTypeFilter !== 'all' && ` (${employeeTypeFilter === 'employee' ? 'W-2' : '1099-NEC'} only)`}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm 
                   border border-indigo-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            <span className="text-sm text-slate-400">Total Gross Pay</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalGrossPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-1">YTD {selectedYear}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm 
                   border border-red-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
            <span className="text-sm text-slate-400">Tax Withheld</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalTaxWithheld.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-1">
            {totalGrossPay > 0 ? ((totalTaxWithheld / totalGrossPay) * 100).toFixed(1) : 0}% effective rate
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 backdrop-blur-sm 
                   border border-emerald-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-slate-400">Net Disbursed</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalNetDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-1">On Stellar Network</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm 
                   border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-slate-400">W-2 Employees</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalEmployees}</p>
          <p className="text-xs text-slate-500 mt-1">Domestic workers</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 backdrop-blur-sm 
                   border border-cyan-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-slate-400">1099 Contractors</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalContractors}</p>
          <p className="text-xs text-slate-500 mt-1">International contractors</p>
        </motion.div>
      </div>

      {/* YTD Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-400" />
            Year-to-Date Summary ({selectedYear})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Compliance Data</h3>
            <p className="text-slate-400">
              {complianceData.length === 0 
                ? `No payments recorded for ${selectedYear}`
                : 'No employees match your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr className="text-left text-slate-400 text-sm">
                  <th className="p-4 font-medium">Employee</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Department</th>
                  <th className="p-4 font-medium text-right">Tax Rate</th>
                  <th className="p-4 font-medium text-right">Gross Pay</th>
                  <th className="p-4 font-medium text-right">Tax Withheld</th>
                  <th className="p-4 font-medium text-right">Net Disbursed</th>
                  <th className="p-4 font-medium text-right">Payments</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {filteredData.map((emp, index) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-slate-700 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white">{emp.full_name}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {emp.wallet_address.slice(0, 8)}...{emp.wallet_address.slice(-6)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        emp.employee_type === 'employee'
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {emp.employee_type === 'employee' ? 'W-2' : '1099-NEC'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{emp.department}</td>
                    <td className="p-4 text-right text-sm">{emp.tax_rate}%</td>
                    <td className="p-4 text-right font-medium text-white">
                      ${emp.total_gross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right font-medium text-red-400">
                      ${emp.total_tax_withheld.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right font-medium text-emerald-400">
                      ${emp.total_net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right text-sm">{emp.payment_count}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleGenerateTaxForm(emp)}
                        disabled={emp.total_gross === 0}
                        className="mx-auto block px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 
                                 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg 
                                 text-sm font-medium transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Generate Form
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Tax Form Generator Modal */}
      {showTaxFormModal && selectedEmployee && (
        <TaxFormGenerator
          employee={selectedEmployee}
          year={selectedYear}
          publicKey={publicKey}
          onClose={() => {
            setShowTaxFormModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}
