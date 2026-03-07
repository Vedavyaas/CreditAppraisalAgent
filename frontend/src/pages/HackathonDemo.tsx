import React from 'react';
import {
    ShieldCheck,
    BrainCircuit,
    Zap,
    ShieldAlert,
    Eye,
    ArrowRight,
    Search,
    Code2,
    Database,
    LineChart
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HackathonDemo: React.FC = () => {
    const roles = [
        {
            role: 'Credit Officer',
            icon: ShieldCheck,
            color: 'blue',
            email: 'credit@test.com',
            desc: 'The Entry Point. Handles document ingestion and preliminary financial health checks.',
            features: [
                'Document Ingestion (OCR Extraction)',
                'Five Cs Quick View',
                'Application Pipeline Statistics',
                'GST/Bank Variance Alerts'
            ]
        },
        {
            role: 'Risk Analyst',
            icon: BrainCircuit,
            color: 'indigo',
            email: 'analyst@test.com',
            desc: 'The Brain. Deep dives into ML signals, external research, and qualitative notes.',
            features: [
                'ML Prediction Scores (1-100)',
                'Model Explainability (SHAP/LIME)',
                'Automated Web Research (MCA, News)',
                'Due Diligence Qualitative Scoring'
            ]
        },
        {
            role: 'Credit Manager',
            icon: Zap,
            color: 'violet',
            email: 'manager@test.com',
            desc: 'The Decision Maker. Reviews the full CAM (Credit Appraisal Memo) and sets terms.',
            features: [
                'Portfolio Portfolio Hub',
                'Risk-Adjusted Pricing (Iterative)',
                'Revenue Forecast Visualization',
                'Final Approval/Rejection Flow'
            ]
        },
        {
            role: 'Compliance Sentinel',
            icon: ShieldAlert,
            color: 'rose',
            email: 'compliance@test.com',
            desc: 'The Guardian. Monitors for fraud, circular trading, and audit violations.',
            features: [
                'Circular Trading Detection',
                'GSTR-3B vs 2A Reconciliation',
                'Real-time Audit Entropy Stream',
                'Fraud Flagging & HOLD protocols'
            ]
        },
        {
            role: 'Transparency Hub',
            icon: Eye,
            color: 'slate',
            email: 'viewer@test.com',
            desc: 'The Executive. A read-only bird\'s eye view of the entire processing pipeline.',
            features: [
                'Global Throughput Pipeline',
                'Executive Portfolio Analytics',
                'Master Ledger (Read-Only Archive)',
                'System Integrity Tracker'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-sans text-slate-300">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic">
                        AGENT-PHEONIX <span className="text-indigo-500">DEMO GUIDE</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-400 font-medium">
                        Welcome to the future of Underwriting. This guide explains the specialized roles
                        integrated into our AI-powered Credit Appraisal Memo system.
                    </p>
                    <div className="flex justify-center space-x-4 pt-4">
                        <Link to="/login" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black transition-all shadow-lg shadow-indigo-600/20">
                            PROCEED TO LOGIN
                        </Link>
                    </div>
                </div>

                {/* Tech Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
                        <Code2 className="w-8 h-8 text-indigo-400 mb-4" />
                        <h3 className="text-lg font-black text-white mb-2 uppercase italic">100% RESTful</h3>
                        <p className="text-sm text-slate-500">Zero hardcoded data. Every Dashboard is wired to a live Spring Boot backend via Axios.</p>
                    </div>
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
                        <Database className="w-8 h-8 text-emerald-400 mb-4" />
                        <h3 className="text-lg font-black text-white mb-2 uppercase italic">Real DB Seeding</h3>
                        <p className="text-sm text-slate-500">Our DataSeeder populates 800+ rows of realistic GST, Bank, and ML data on startup.</p>
                    </div>
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
                        <LineChart className="w-8 h-8 text-rose-400 mb-4" />
                        <h3 className="text-lg font-black text-white mb-2 uppercase italic">ML Explainability</h3>
                        <p className="text-sm text-slate-500">Features true SHAP/LIME logic and circular trading discrepancy sentencing.</p>
                    </div>
                </div>

                {/* Role Deep Dive */}
                <div className="space-y-8">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] text-center">Interactive Experience Roles</h2>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {roles.map((r, i) => (
                            <div key={i} className="group relative">
                                <div className={`absolute -inset-1 bg-gradient-to-r from-${r.color}-500 to-indigo-500 rounded-[2rem] blur opacity-5 group-hover:opacity-15 transition duration-500`}></div>
                                <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 bg-${r.color}-500/10 border border-${r.color}-500/20 rounded-2xl`}>
                                            <r.icon className={`w-8 h-8 text-${r.color}-500`} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Login ID</p>
                                            <p className="text-sm font-mono text-white font-bold">{r.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{r.role}</h3>
                                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">{r.desc}</p>

                                        <div className="space-y-3">
                                            {r.features.map((f, j) => (
                                                <div key={j} className="flex items-center text-xs font-bold text-slate-500">
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-${r.color}-500 mr-3 animate-pulse`}></div>
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center">
                                        <span className={`text-[10px] font-black uppercase text-${r.color}-500 tracking-tighter`}>Level {5 - i} Authorization</span>
                                        <Link
                                            to="/login"
                                            className="flex items-center text-xs font-black text-white hover:text-indigo-400 transition-colors uppercase tracking-widest"
                                        >
                                            TRY THIS ROLE <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-12 pb-24 border-t border-slate-900">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Search className="w-3 h-3 text-indigo-500" />
                        <span>Built for the 2026 Credit Innovation Hackathon</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
