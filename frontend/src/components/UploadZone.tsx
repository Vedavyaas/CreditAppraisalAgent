import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

interface UploadZoneProps {
    applicationId: number;
    onUploadSuccess: (jobExecutionId: number) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ applicationId, onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('GST_RETURN');
    const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('UPLOADING');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', docType);

        try {
            const response = await apiClient.post(`/ingest/${applicationId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const { jobExecutionId, status, error } = response.data;

            if (status === 'JOB_LAUNCH_FAILED') {
                setStatus('ERROR');
                setErrorMessage(error || 'Failed to start ingestion job');
            } else {
                setStatus('SUCCESS');
                onUploadSuccess(jobExecutionId);
                // Reset after 3 seconds
                setTimeout(() => {
                    setFile(null);
                    setStatus('IDLE');
                }, 3000);
            }
        } catch (err: any) {
            setStatus('ERROR');
            setErrorMessage(err.response?.data?.message || 'Upload failed');
        }
    };

    const resetState = () => {
        setFile(null);
        setStatus('IDLE');
        setErrorMessage('');
    };

    return (
        <div className="w-full h-full flex flex-col space-y-4">
            <div
                className={`flex-1 relative rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center
          ${isDragging
                        ? 'border-blue-400 bg-blue-50/10 dark:bg-blue-900/20'
                        : 'border-slate-300 dark:border-slate-600 bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".csv,.pdf"
                />

                <AnimatePresence mode="wait">
                    {!file && status === 'IDLE' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center pointer-events-none"
                        >
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4 text-blue-500">
                                <UploadCloud className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Drag & Drop Documents</h3>
                            <p className="text-sm text-slate-500 mt-2 max-w-xs">Supports GST Returns (.csv), Bank Statements (.csv), and Legal/Annual Reports (.pdf)</p>
                        </motion.div>
                    )}

                    {file && status === 'IDLE' && (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center w-full"
                        >
                            <FileText className="w-12 h-12 text-slate-600 dark:text-slate-400 mb-3" />
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            <div className="mt-6 w-full max-w-xs space-y-3" onClick={(e) => e.stopPropagation()}>
                                <label className="block text-left text-xs font-semibold uppercase text-slate-500">Document Type</label>
                                <select
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                    className="w-full p-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm shadow-sm backdrop-blur-sm"
                                >
                                    <option value="GST_RETURN">GST Return (CSV)</option>
                                    <option value="BANK_STATEMENT">Bank Statement (CSV)</option>
                                    <option value="ANNUAL_REPORT">Annual Report (PDF)</option>
                                    <option value="LEGAL_NOTICE">Legal Notice (PDF)</option>
                                    <option value="RATING_REPORT">Rating Report (PDF)</option>
                                    <option value="SANCTION_LETTER">Sanction Letter (PDF)</option>
                                </select>

                                <div className="flex space-x-2 pt-2">
                                    <button onClick={resetState} className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleUpload} className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors shadow-sm">
                                        Upload
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === 'UPLOADING' && (
                        <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                            <p className="font-medium text-slate-700 dark:text-slate-200">Starting Ingestion Pipeline...</p>
                        </motion.div>
                    )}

                    {status === 'SUCCESS' && (
                        <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Upload Successful</h3>
                            <p className="text-sm text-slate-500 mt-2">Job dispatched to Spring Batch.</p>
                        </motion.div>
                    )}

                    {status === 'ERROR' && (
                        <motion.div key="error" initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-red-600">Ingestion Failed</h3>
                            <p className="text-sm text-slate-600 mt-2 max-w-xs">{errorMessage}</p>
                            <button onClick={resetState} className="mt-4 px-4 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-white/80 transition-colors">
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
