'use client';

import { motion } from 'framer-motion';
import { useState, useTransition } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, Download, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { bulkAddEmployees } from '@/app/actions/employees';

interface ParsedEmployee {
  name: string;
  walletAddress: string;
  role?: string;
  department?: string;
  preferredAsset?: string;
}

export default function BulkUploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedEmployee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);

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
      processFile(file);
    } else {
      setError('Please upload a CSV file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setUploadStatus(null);
    setUploadedFile(file);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setError('CSV file is empty or invalid');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const employees: ParsedEmployee[] = [];

      // Validate headers
      const requiredHeaders = ['Full_Name', 'Wallet_Address'];
      const hasRequiredHeaders = requiredHeaders.every(h => 
        headers.some(header => header.toLowerCase() === h.toLowerCase())
      );

      if (!hasRequiredHeaders) {
        setError('CSV must contain Full_Name and Wallet_Address columns');
        return;
      }

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length < 2) continue;

        const employee: ParsedEmployee = {
          name: values[0] || '',
          walletAddress: values[1] || '',
          role: values[2] || 'Employee',
          department: values[3] || 'General',
          preferredAsset: values[4] || 'USDC',
        };

        if (employee.name && employee.walletAddress) {
          employees.push(employee);
        }
      }

      if (employees.length === 0) {
        setError('No valid employee data found in CSV');
        return;
      }

      setParsedData(employees);
    } catch (err) {
      setError('Failed to parse CSV file');
      console.error(err);
    }
  };

  const handleUpload = () => {
    if (parsedData.length === 0) return;

    startTransition(async () => {
      const result = await bulkAddEmployees(parsedData);

      if (result.error) {
        setError(result.error);
        setUploadStatus({ success: false, message: result.error });
      } else {
        setUploadStatus({ 
          success: true, 
          message: `Successfully added ${result.count} employee${result.count !== 1 ? 's' : ''}!` 
        });
        // Reset after success
        setTimeout(() => {
          setUploadedFile(null);
          setParsedData([]);
          setUploadStatus(null);
        }, 3000);
      }
    });
  };

  const downloadTemplate = () => {
    const csv = `Full_Name,Wallet_Address,Role,Department,Preferred_Asset
John Doe,GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX,Software Engineer,Engineering,USDC
Jane Smith,GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY,Product Designer,Design,EURT
Mike Johnson,GZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ,Marketing Manager,Marketing,USDC
Sarah Williams,GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,HR Specialist,Human Resources,USDC
David Brown,GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB,DevOps Engineer,Engineering,XLM`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lume_employee_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Bulk Employee Upload</h2>
        <p className="text-slate-400">Add multiple employees at once using CSV files</p>
      </motion.div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {uploadStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            uploadStatus.success
              ? 'bg-emerald-500/20 border-emerald-500/50'
              : 'bg-red-500/20 border-red-500/50'
          } border rounded-lg p-4 flex items-start gap-3`}
        >
          {uploadStatus.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={`${
            uploadStatus.success ? 'text-emerald-300' : 'text-red-300'
          } text-sm`}>
            {uploadStatus.message}
          </p>
        </motion.div>
      )}

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
                  {parsedData.length} employee{parsedData.length !== 1 ? 's' : ''} found
                </h4>
                <p className="text-slate-400 text-sm mb-2">
                  {uploadedFile.name}
                </p>
                <p className="text-slate-500 text-xs">
                  Ready to upload to database
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    setParsedData([]);
                    setError(null);
                  }}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  Remove file
                </button>
              </>
            )}
          </div>

          {uploadedFile && parsedData.length > 0 && (
            <button 
              onClick={handleUpload}
              disabled={isPending}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning
            >
              <UploadIcon className="w-5 h-5" />
              {isPending ? 'Uploading...' : `Upload ${parsedData.length} Employee${parsedData.length !== 1 ? 's' : ''}`}
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
                    <span><strong>Full_Name:</strong> Employee's full name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span><strong>Wallet_Address:</strong> Stellar wallet address (G...)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-indigo-400 font-medium mb-2">Column Mapping:</h4>
                <div className="space-y-2 text-sm text-slate-300 bg-slate-900/30 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-indigo-300 font-semibold">Column Name</span>
                    <span className="text-slate-400">Description</span>
                  </div>
                  <div className="h-px bg-slate-700"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-mono text-xs">Full_Name</span>
                    <span className="text-xs">Employee's complete name</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-mono text-xs">Wallet_Address</span>
                    <span className="text-xs">56-char Stellar address (G...)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-mono text-xs">Role</span>
                    <span className="text-xs">Job title or position</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-mono text-xs">Department</span>
                    <span className="text-xs">Team or department name</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-mono text-xs">Preferred_Asset</span>
                    <span className="text-xs">USDC, EURT, XLM, etc.</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto">
                <div className="text-indigo-400 mb-2">Example CSV Format:</div>
                <div className="whitespace-nowrap">
                  <div className="text-emerald-400">Full_Name,Wallet_Address,Role,Department,Preferred_Asset</div>
                  <div className="mt-1">John Doe,GXXX...XXX,Software Engineer,Engineering,USDC</div>
                  <div>Jane Smith,GYYY...YYY,Product Designer,Design,EURT</div>
                  <div>Mike Johnson,GZZZ...ZZZ,Marketing Manager,Marketing,USDC</div>
                </div>
                <div className="text-slate-500 text-xs mt-3 whitespace-normal">
                  💡 Tip: Open the downloaded template in Excel or Google Sheets for easier editing
                </div>
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
                  <li>• Duplicate wallet addresses will be rejected by the database</li>
                  <li>• All employees will be added simultaneously</li>
                  <li>• Invalid wallet addresses will cause the upload to fail</li>
                  <li>• You can view all added employees in the Directory section</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
