'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BulkUploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setUploadedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const downloadTemplate = () => {
    const csv = 'Recipient_Address,Amount,Asset,Memo\nGXXXXXXXXXXXXXXXXXXXXXXX,1000,USDC,Salary January\nGYYYYYYYYYYYYYYYYYYYYYYY,1500,EURT,Salary January';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment_template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Bulk Upload</h2>
        <p className="text-slate-400">Process multiple payments at once using CSV files</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Upload CSV File</h3>

          {/* Download Template Button */}
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 mb-6 border border-slate-600"
          >
            <Download className="w-5 h-5" />
            Download CSV Template
          </button>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {!uploadedFile ? (
              <>
                <FileSpreadsheet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">
                  Drop your CSV file here
                </h4>
                <p className="text-slate-400 text-sm mb-4">
                  or click to browse
                </p>
                <p className="text-slate-500 text-xs">
                  Maximum file size: 5MB
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">
                  File uploaded successfully
                </h4>
                <p className="text-slate-400 text-sm">
                  {uploadedFile.name}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                  }}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  Remove file
                </button>
              </>
            )}
          </div>

          {uploadedFile && (
            <button className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-indigo-500/25">
              <UploadIcon className="w-5 h-5" />
              Process Payments
            </button>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* CSV Format Guide */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">CSV Format Guide</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-indigo-400 font-medium mb-2">Required Columns:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span><strong>Recipient_Address:</strong> Stellar wallet address (G...)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span><strong>Amount:</strong> Payment amount (numbers only)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span><strong>Asset:</strong> Asset code (USDC, EURT, NGNT, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span><strong>Memo:</strong> Transaction memo (optional)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto">
                <div className="text-indigo-400 mb-2">Example CSV:</div>
                <div>Recipient_Address,Amount,Asset,Memo</div>
                <div>GXXX...XXX,1000,USDC,Jan Salary</div>
                <div>GYYY...YYY,1500,EURT,Jan Salary</div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-indigo-300 font-semibold">Important Notes</h4>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  <li>• Double-check all recipient addresses before uploading</li>
                  <li>• Ensure you have sufficient balance for all payments</li>
                  <li>• Each payment will be processed individually</li>
                  <li>• You'll receive a confirmation for each transaction</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
