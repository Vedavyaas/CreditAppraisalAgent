import React, { useState, useEffect } from 'react';
import { MacWindow } from '../components/MacWindow';
import { useAuth } from '../contexts/AuthContext';
import {
    Activity, BarChart3, Clock,
    ArrowRightLeft, FileText, CheckCircle2,
    TrendingUp, Wallet, Zap, Shield, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { motion } from 'framer-motion';

export const ViewerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [auditRes, appsRes] = await Promise.all([
                    apiClient.get('/audit'),
                    apiClient.get('/applications')
                ]);
                setAuditLogs(auditRes.data.slice(0, 10));
                setApplications(appsRes.data);
            } catch (error) {
                console.error("Transparency hub data fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const interval = setInterval(() => {
            apiClient.get('/audit').then(res => setAuditLogs(res.data.slice(0, 10)));
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <Zap className="w-12 h-12 text-indigo-500" />
                </motion.div>
                <p className="mt-4 text-slate-500 font-bold tracking-tight">Syncing Oversight Channels...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
            {/* Top Bar - Transparency Header */}
            <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Transparency Hub</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center">
                                <Activity className="w-3 h-3 mr-1.5 text-emerald-500" /> Executive Oversight • Read-Only
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Observer Role</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
                {/* Global Pipeline Tracker */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 bg-white/50 border-none shadow-sm"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                            <ArrowRightLeft className="w-4 h-4 mr-2 text-indigo-500" /> Global Processing Pipeline
                        </h3>
                        <span className="text-[11px] font-bold text-slate-500">Active Throughput: {applications.length} Units</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
                        {/* Connecting Lines (Desktop only) */}
                        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 hidden md:block"></div>

                        {[
                            { label: "Ingestion", count: applications.filter(a => a.status === 'AWAITING_DOCS').length, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
                            { label: "Appraisal", count: applications.filter(a => a.status === 'IN_REVIEW').length, icon: BarChart3, color: "text-amber-500", bg: "bg-amber-50" },
                            { label: "Compliance", count: applications.filter(a => a.status === 'PENDING_MANAGER' || a.status === 'CLEARED').length, icon: Shield, color: "text-indigo-500", bg: "bg-indigo-50" },
                            { label: "Final Decision", count: applications.filter(a => a.status === 'DECIDED' || a.status === 'REJECTED' || a.status === 'APPROVED').length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" }
                        ].map((stage, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center">
                                <div className={`p-5 rounded-2xl bg-white border border-slate-100 mb-4 shadow-sm transition-all hover:scale-105 group ${stage.color}`}>
                                    <stage.icon className="w-6 h-6" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stage.label}</p>
                                <p className="text-xl font-black text-slate-900 mt-2">{stage.count}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left: Executive Analytics Cards */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Portfolio Value", value: `₹ ${(applications.reduce((s, a) => s + (a.requestedAmount || 0), 0) / 1e7).toFixed(1)} Cr`, icon: Wallet, trend: "Live", bg: "bg-indigo-50", color: "text-indigo-600" },
                                { label: "Active Queue", value: `${applications.length} Apps`, icon: Clock, trend: "Real-time", bg: "bg-blue-50", color: "text-blue-600" },
                                { label: "System Health", value: "98.4%", icon: TrendingUp, trend: "Stable", bg: "bg-emerald-50", color: "text-emerald-600" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -4 }}
                                    className="glass-panel p-6 border-none shadow-sm relative overflow-hidden group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[10px] font-black ${stat.color} ${stat.bg} px-2 py-0.5 rounded uppercase tracking-tighter`}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Application Repository Table */}
                        <MacWindow title="Master Disbursement Ledger">
                            <div className="overflow-auto -mx-8">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-y border-slate-100">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Borrowing Entity</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {applications.slice(0, 10).map((app: any) => (
                                            <tr key={app.id} className="hover:bg-slate-50/50 text-[13px] group transition-all">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{app.companyName}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">AUTH-ID: {1000 + app.id}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 uppercase tracking-tight">
                                                        {app.status?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right text-slate-900 font-black">
                                                    ₹ {(app.requestedAmount / 1e7).toFixed(2)} Cr
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                                                        {app.riskBand || 'MED'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </MacWindow>
                    </div>

                    {/* Right: Read-Only Audit Feed */}
                    <div className="col-span-12 lg:col-span-4">
                        <MacWindow title="System Audit Stream">
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-all">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{log.username}</span>
                                            <span className="text-[10px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-[12px] text-slate-600 leading-relaxed italic">
                                            "{log.message || log.actionMessage}"
                                        </p>
                                    </div>
                                ))}
                                <div className="pt-4 text-center">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">End of visible feed</p>
                                </div>
                            </div>
                        </MacWindow>
                    </div>
                </div>
            </div>
        </div>
    );
};
