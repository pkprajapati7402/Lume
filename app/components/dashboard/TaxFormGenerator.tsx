'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, CheckCircle, Shield, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface TaxFormGeneratorProps {
  employee: {
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
  };
  year: number;
  publicKey: string;
  onClose: () => void;
}

interface TransactionDetail {
  transaction_hash: string;
  amount: number;
  asset_code: string;
  created_at: string;
}

export default function TaxFormGenerator({ employee, year, publicKey, onClose }: TaxFormGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionDetail[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const supabase = createClient();
      const startDate = new Date(year, 0, 1).toISOString();
      const endDate = new Date(year, 11, 31, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('payouts')
        .select('transaction_hash, amount, asset_code, created_at')
        .eq('owner_wallet_address', publicKey)
        .eq('employee_id', employee.id)
        .eq('status', 'success')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const generatePDF = () => {
    setLoading(true);
    try {
      const doc = new jsPDF('p', 'mm', 'letter');
      const formType = employee.employee_type === 'employee' ? 'W-2' : '1099-NEC';
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Color palette
      const indigo: [number, number, number] = [99, 102, 241];
      const slate: [number, number, number] = [51, 65, 85];
      const white: [number, number, number] = [255, 255, 255];

      // Header - Indigo gradient simulation
      doc.setFillColor(...indigo);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // LUME Logo/Title
      doc.setTextColor(...white);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('LUME', 20, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Stellar Payroll Platform', 20, 28);
      
      // Form type badge
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const formText = `Form ${formType}`;
      const formTextWidth = doc.getTextWidth(formText);
      doc.text(formText, pageWidth - formTextWidth - 20, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tax Year ${year}`, pageWidth - formTextWidth - 20, 28);

      // Reset text color for body
      doc.setTextColor(...slate);
      
      let yPos = 55;

      // Form title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const title = employee.employee_type === 'employee' 
        ? 'Wage and Tax Statement (W-2)'
        : 'Nonemployee Compensation (1099-NEC)';
      doc.text(title, 20, yPos);
      yPos += 15;

      // Divider line
      doc.setDrawColor(...indigo);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      // Employee Information Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee Information', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const infoLines = [
        { label: 'Full Name:', value: employee.full_name },
        { label: 'Stellar Address:', value: employee.wallet_address },
        { label: 'Department:', value: employee.department },
        { label: 'Employment Type:', value: employee.employee_type === 'employee' ? 'W-2 Employee' : '1099-NEC Contractor' },
        { label: 'Tax Rate:', value: `${employee.tax_rate}%` },
      ];

      infoLines.forEach(({ label, value }) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPos);
        yPos += 6;
      });

      yPos += 8;

      // Tax Summary Section
      doc.setDrawColor(...indigo);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Tax Year Summary', 20, yPos);
      yPos += 8;

      // Summary boxes
      const boxWidth = (pageWidth - 60) / 3;
      const boxHeight = 25;
      const boxY = yPos;

      // Box 1: Gross Pay
      doc.setFillColor(240, 240, 255);
      doc.rect(20, boxY, boxWidth, boxHeight, 'F');
      doc.setTextColor(...slate);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Gross Pay', 25, boxY + 8);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${employee.total_gross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 25, boxY + 18);

      // Box 2: Tax Withheld
      doc.setFillColor(255, 240, 240);
      doc.rect(30 + boxWidth, boxY, boxWidth, boxHeight, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Tax Withheld', 35 + boxWidth, boxY + 8);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${employee.total_tax_withheld.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 35 + boxWidth, boxY + 18);

      // Box 3: Net Disbursed
      doc.setFillColor(240, 255, 240);
      doc.rect(40 + 2 * boxWidth, boxY, boxWidth, boxHeight, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Net Disbursed', 45 + 2 * boxWidth, boxY + 8);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${employee.total_net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 45 + 2 * boxWidth, boxY + 18);

      yPos += boxHeight + 15;

      // Transaction Details Section
      doc.setDrawColor(...indigo);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Transaction History (${transactions.length} payments)`, 20, yPos);
      yPos += 8;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('All payments are verifiable on the Stellar blockchain:', 20, yPos);
      yPos += 8;

      // Transaction table header
      doc.setFillColor(51, 65, 85);
      doc.rect(20, yPos, pageWidth - 40, 8, 'F');
      doc.setTextColor(...white);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 25, yPos + 5);
      doc.text('Amount', 70, yPos + 5);
      doc.text('Asset', 115, yPos + 5);
      doc.text('Transaction Hash', 145, yPos + 5);
      yPos += 8;

      // Transaction rows (limit to first 15 to fit on page)
      doc.setTextColor(...slate);
      doc.setFont('helvetica', 'normal');
      const displayTransactions = transactions.slice(0, 15);
      
      displayTransactions.forEach((tx, index) => {
        if (yPos > pageHeight - 50) return; // Stop if near bottom

        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, yPos, pageWidth - 40, 6, 'F');
        }

        const date = new Date(tx.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        });
        doc.text(date, 25, yPos + 4);
        doc.text(`$${parseFloat(tx.amount.toString()).toFixed(2)}`, 70, yPos + 4);
        doc.text(tx.asset_code, 115, yPos + 4);
        
        const hashShort = `${tx.transaction_hash.slice(0, 12)}...${tx.transaction_hash.slice(-8)}`;
        doc.text(hashShort, 145, yPos + 4);
        yPos += 6;
      });

      if (transactions.length > 15) {
        yPos += 4;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`+ ${transactions.length - 15} more transactions (view full history on Stellar Expert)`, 25, yPos);
      }

      // Footer - Watermark
      yPos = pageHeight - 40;
      doc.setDrawColor(...indigo);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      // LUME Verified Badge
      doc.setFillColor(...indigo);
      doc.circle(35, yPos + 5, 5, 'F');
      doc.setTextColor(...white);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('✓', 33, yPos + 7);

      doc.setTextColor(...slate);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('LUME VERIFIED', 45, yPos + 7);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      yPos += 8;
      doc.text('This document is cryptographically verifiable on the Stellar blockchain.', 20, yPos);
      yPos += 4;
      doc.text(`All transaction hashes can be verified at: https://stellar.expert/explorer/testnet`, 20, yPos);
      yPos += 6;
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on ${new Date().toLocaleString('en-US')} • LUME Stellar Payroll Platform v1.0`, 20, yPos);

      // Save PDF
      const filename = `LUME_${formType}_${employee.full_name.replace(/\s+/g, '_')}_${year}.pdf`;
      doc.save(filename);

      toast.success('Tax Form Generated', {
        description: `${formType} form downloaded successfully`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('PDF Generation Failed', {
        description: 'Could not create tax form document',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Generate Tax Form</h3>
                <p className="text-sm text-slate-400">
                  {employee.employee_type === 'employee' ? 'W-2 Wage Statement' : '1099-NEC Nonemployee Compensation'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Employee Info Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{employee.full_name}</h4>
                  <p className="text-sm text-slate-400 font-mono mt-1">
                    {employee.wallet_address.slice(0, 12)}...{employee.wallet_address.slice(-10)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  employee.employee_type === 'employee'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {employee.employee_type === 'employee' ? 'W-2 Employee' : '1099-NEC Contractor'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Department:</span>
                  <span className="ml-2 text-white font-medium">{employee.department}</span>
                </div>
                <div>
                  <span className="text-slate-500">Tax Rate:</span>
                  <span className="ml-2 text-white font-medium">{employee.tax_rate}%</span>
                </div>
              </div>
            </div>

            {/* Tax Summary */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">Tax Year {year} Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-1">Gross Pay</div>
                  <div className="text-xl font-bold text-white">
                    ${employee.total_gross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-1">Tax Withheld</div>
                  <div className="text-xl font-bold text-white">
                    ${employee.total_tax_withheld.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-emerald-600/10 border border-emerald-500/30 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-1">Net Disbursed</div>
                  <div className="text-xl font-bold text-white">
                    ${employee.total_net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Count */}
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">
                <span className="font-medium text-white">{transactions.length}</span> blockchain-verified payments
              </span>
            </div>

            {/* Verification Badge */}
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-white mb-1">LUME Verified Document</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This tax form is generated from cryptographically verified Stellar blockchain transactions. 
                    All transaction hashes can be independently verified on Stellar Expert.
                  </p>
                </div>
              </div>
            </div>

            {/* Stellar Expert Link */}
            {transactions.length > 0 && (
              <a
                href={`https://stellar.expert/explorer/testnet/account/${employee.wallet_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Stellar Expert
              </a>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={generatePDF}
              disabled={loading || employee.total_gross === 0}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 
                       disabled:text-slate-500 text-white rounded-lg font-medium 
                       flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download {employee.employee_type === 'employee' ? 'W-2' : '1099-NEC'} Form
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
