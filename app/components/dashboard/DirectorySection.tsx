'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Mail, Globe } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  country: string;
  address: string;
  preferredAsset: string;
  totalPaid: string;
}

export default function DirectorySection() {
  const [searchQuery, setSearchQuery] = useState('');

  const employees: Employee[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      country: 'United States',
      address: 'GAXXX...XXX',
      preferredAsset: 'USDC',
      totalPaid: '$15,250'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      country: 'Germany',
      address: 'GBYYY...YYY',
      preferredAsset: 'EURT',
      totalPaid: '$12,890'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@company.com',
      country: 'Nigeria',
      address: 'GCZZZ...ZZZ',
      preferredAsset: 'NGNT',
      totalPaid: '$21,100'
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah@company.com',
      country: 'Brazil',
      address: 'GDAAA...AAA',
      preferredAsset: 'BRLT',
      totalPaid: '$8,750'
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david@company.com',
      country: 'United Kingdom',
      address: 'GEBBB...BBB',
      preferredAsset: 'EURT',
      totalPaid: '$18,500'
    },
  ];

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const countryFlags: Record<string, string> = {
    'United States': '🇺🇸',
    'Germany': '🇩🇪',
    'Nigeria': '🇳🇬',
    'Brazil': '🇧🇷',
    'United Kingdom': '🇬🇧',
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
        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-indigo-500/25">
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
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{employee.name}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    <span className="text-lg">{countryFlags[employee.country]}</span>
                    <span>{employee.country}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-slate-400 hover:text-indigo-400" />
                </button>
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-slate-300">{employee.email}</span>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 mb-1">Wallet Address</div>
                <div className="font-mono text-sm text-slate-300 bg-slate-900/50 px-3 py-2 rounded border border-slate-700">
                  {employee.address}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Preferred Asset</div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {employee.preferredAsset}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Total Paid</div>
                  <div className="text-white font-semibold">{employee.totalPaid}</div>
                </div>
              </div>
            </div>

            {/* Quick Pay Button */}
            <button className="w-full mt-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-lg font-medium transition-all">
              Quick Pay
            </button>
          </motion.div>
        ))}
      </motion.div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No employees found matching your search.</p>
        </div>
      )}
    </div>
  );
}
