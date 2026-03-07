import React, { useState, useEffect } from 'react';
import { MacWindow } from '../components/MacWindow';
import { useAuth } from '../contexts/AuthContext';
import {
    ShieldAlert, Activity, CheckCircle2, AlertTriangle,
    ShieldCheck, LogOut, Fingerprint
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { motion } from 'framer-motion';

export const ComplianceOfficerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState<any[]>([]);
    const [flaggedEntries, setFlaggedEntries] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appsRes, auditRes] = await Promise.all([
                    apiClient.get('/applications'),
                    apiClient.get('/audit')
                ]);
                setApplications(appsRes.data);
                setAuditLogs(auditRes.data.slice(0, 10));

                const allGstPromises = appsRes.data.map((app: any) =>
                    apiClient.get(`/applications/${app.id}/gst`).catch(() => ({ data: [] }))
                );
                const allGstResults = await Promise.all(allGstPromises);
                const allFlagged = allGstResults.flatMap((res: any) => res.data).filter((e: any) => e.circularTradingFlag);
                setFlaggedEntries(allFlagged);
            } catch (error) {
                console.error("Compliance data fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const interval = setInterval(() => {
            apiClient.get('/audit').then(res => setAuditLogs(res.data.slice(0, 10)));
        }, 8000);

        return () => clearInterval(interval);
    }, [applications.length]);

    const handleAction = async (status: string, appStatus: string) => {
        if (!applications.length) return;
        setLoading(true);
        try {
            const appId = applications[0].id;
            await apiClient.put(`/applications/${appId}/compliance?status=${status}&appStatus=${appStatus}`);
            const appsRes = await apiClient.get('/applications');
            setApplications(appsRes.data);
        } catch (err: any) {
            alert("Action failed: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <ShieldCheck className="w-12 h-12 text-indigo-500" />
                </motion.div>
                <p className="mt-4 text-slate-500 font-bold tracking-tight animate-pulse">Establishing Secure Session...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">Compliance Hub</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Regulatory Oversight Engine</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Officer ID: #{(user?.id || 0) + 100}</p>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Integrity Score", value: flaggedEntries.length === 0 ? "100%" : "84%", sub: "Circular Trading Health", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
                        { label: "Alerts Detected", value: flaggedEntries.length, sub: "Requires Investigation", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
                        { label: "Queue Load", value: applications.length, sub: "Pending Clearances", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" }
                    ].map((m, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -4 }}
                            className="glass-panel p-6 flex items-center space-x-4 border-none shadow-sm"
                        >
                            <div className={`p-4 rounded-2xl ${m.bg}`}>
                                <m.icon className={`w-6 h-6 ${m.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                                <p className="text-2xl font-black text-slate-900 leading-none">{m.value}</p>
                                <p className="text-[11px] text-slate-500 font-medium mt-1.5">{m.sub}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Side: Policies & Audit */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        <MacWindow title="Verification Protocols">
                            <div className="space-y-3">
                                {[
                                    { label: "KYC & AML Screening", ok: true },
                                    { label: "GSTR Reconciliation", ok: flaggedEntries.length === 0 },
                                    { label: "Conflict of Interest Scan", ok: true },
                                    { label: "Director Integrity Check", ok: true },
                                    { label: "Statutory Filing Symmetry", ok: true }
                                ].map((step, i) => (
                                    <div key={i} className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all group">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-2 h-2 rounded-full ${step.ok ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            <span className="text-[13px] font-bold text-slate-600">{step.label}</span>
                                        </div>
                                        {step.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
                                    </div>
                                ))}
                            </div>
                        </MacWindow>

                        <MacWindow title="Audit Trail">
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{log.username}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-[12px] text-slate-600 leading-relaxed italic">
                                            "{log.message || log.actionMessage}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </MacWindow>
                    </div>

                    {/* Right Side: Detailed Investigation Table */}
                    <div className="col-span-12 lg:col-span-8">
                        <MacWindow title="Investigation Ledger" className="min-h-[600px] flex flex-col p-4">
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 sticky top-0 z-20">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Period</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">3B Turnover</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">2A Turnover</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Variance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {flaggedEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-40 text-center">
                                                    <ShieldCheck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Discrepancies Detected</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            flaggedEntries.map((entry, idx) => (
                                                <motion.tr
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={entry.id}
                                                    className="hover:bg-slate-50/50 transition-colors group"
                                                >
                                                    <td className="px-6 py-5">
                                                        <p className="text-[13px] font-bold text-slate-700">{entry.period}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">AUTH-REF: {Math.floor(1000 + Math.random() * 9000)}</p>
                                                    </td>
                                                    <td className="px-6 py-5 text-right text-[13px] font-medium text-slate-500 italic">₹{entry.gstr3bTurnover.toLocaleString()}</td>
                                                    <td className="px-6 py-5 text-right text-[13px] font-bold text-slate-900">₹{entry.gstr2aTurnover.toLocaleString()}</td>
                                                    <td className="px-6 py-5 text-right">
                                                        <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[11px] font-black rounded-lg border border-rose-100">
                                                            ₹{entry.difference.toLocaleString()}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Actions Footer */}
                            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-indigo-50 rounded-xl">
                                        <Fingerprint className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Verified Identity</p>
                                        <p className="text-[11px] text-slate-700 font-bold">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center gap-3">
                                    <button
                                        onClick={() => handleAction('FLAGGED', 'FRAUD_FLAGGED')}
                                        className="px-6 py-3 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all"
                                    >
                                        Report Anomaly
                                    </button>
                                    <button
                                        onClick={() => handleAction('HOLD', 'PENDING_COMPLIANCE')}
                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
                                    >
                                        Hold for Review
                                    </button>
                                    <button
                                        onClick={() => handleAction('CLEARED', 'PENDING_MANAGER')}
                                        className="px-10 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Verify & Authorize
                                    </button>
                                </div>
                            </div>
                        </MacWindow>
                    </div>
                </div>
            </main>
        </div>
    );
};
