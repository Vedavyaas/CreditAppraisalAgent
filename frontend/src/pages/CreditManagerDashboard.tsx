import React, { useState, useEffect, useCallback } from 'react';
import { MacWindow } from '../components/MacWindow';
import { useAuth } from '../contexts/AuthContext';
import {
    LogOut, BrainCircuit, ShieldCheck, AlertTriangle,
    BadgeCheck, Scale, Building2, Wallet, Globe, Info, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const BASE_RATE = 8.5;
function interestRate(score: number) { return Math.round((BASE_RATE + ((100 - score) / 100) * 4) * 10) / 10; }

function buildFiveCs(mlPred: any, ddNote: any) {
    const score = mlPred?.assuranceScore ?? 50;
    const capacity = ddNote?.capacityUtilizationPct ?? 70;
    const promoter = ddNote?.promoterAssessment ?? 'NEUTRAL';
    const legal = !!ddNote?.legalConcernsNoted;
    const fraud = mlPred?.fraudProbability ?? 0;
    const trend = mlPred?.revenueTrend ?? 'STABLE';
    return [
        { label: 'Character', icon: BadgeCheck, grade: promoter === 'STRONG' ? 'A' : promoter === 'CONCERNING' ? 'C' : 'B', color: promoter === 'STRONG' ? 'emerald' : promoter === 'CONCERNING' ? 'red' : 'amber', detail: `Promoter: ${promoter}. ${legal ? 'Legal issues on record.' : 'No known legal issues.'}`, score: promoter === 'STRONG' ? 85 : promoter === 'CONCERNING' ? 35 : 60 },
        { label: 'Capacity', icon: Wallet, grade: score >= 70 ? 'A' : score >= 50 ? 'B' : 'C', color: score >= 70 ? 'emerald' : score >= 50 ? 'amber' : 'red', detail: `ML assurance score ${score}/100. Revenue: ${trend}.`, score },
        { label: 'Capital', icon: Building2, grade: capacity >= 70 ? 'B' : 'C', color: capacity >= 70 ? 'amber' : 'red', detail: `Capacity utilization ${capacity}% observed on-site.`, score: Math.round(capacity * 0.9) },
        { label: 'Collateral', icon: ShieldCheck, grade: fraud < 0.1 ? 'A' : fraud < 0.3 ? 'B' : 'C', color: fraud < 0.1 ? 'emerald' : fraud < 0.3 ? 'amber' : 'red', detail: `Fraud prob: ${mlPred?.fraudProbabilityPct ?? '—'}. ${mlPred?.isAnomalous ? '⚠ Anomaly flagged.' : 'No anomaly.'}`, score: Math.round((1 - fraud) * 90) },
        { label: 'Conditions', icon: Globe, grade: trend === 'GROWING' ? 'A' : trend === 'DECLINING' ? 'C' : 'B', color: trend === 'GROWING' ? 'emerald' : trend === 'DECLINING' ? 'red' : 'amber', detail: `Sector trend: ${trend}. Tenor: ${mlPred?.recommendedTenorMonths ?? 36}mo.`, score: trend === 'GROWING' ? 80 : trend === 'DECLINING' ? 40 : 65 },
    ];
}

const GRADE_RING: Record<string, string> = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700',
};

const DC_CFG: Record<string, any> = {
    APPROVED: { label: 'APPROVED', bg: 'bg-emerald-600', text: 'text-white', icon: ShieldCheck },
    MANUAL_REVIEW: { label: 'MANUAL REVIEW', bg: 'bg-amber-500', text: 'text-white', icon: Scale },
    REJECTED: { label: 'REJECTED', bg: 'bg-red-600', text: 'text-white', icon: AlertTriangle },
};

export const CreditManagerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [dbApps, setDbApps] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [mlPred, setMlPred] = useState<any>(null);
    const [ddNote, setDdNote] = useState<any>(null);
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient.get('/applications').then(res => {
            setDbApps(res.data);
            if (res.data.length > 0) setSelectedApp(res.data[0]);
        }).catch(console.error);
    }, []);

    const handleDecision = async (status: string) => {
        if (!selectedApp) return;
        try {
            await apiClient.put(`/applications/${selectedApp.id}/status`, { status });
            // Refresh
            const updated = { ...selectedApp, status };
            setSelectedApp(updated);
            setDbApps(dbApps.map(a => a.id === selectedApp.id ? updated : a));
        } catch (err: any) {
            alert('Failed to update status: ' + (err.response?.data?.message || err.message));
        }
    };

    const loadApp = useCallback(async (app: any) => {
        if (!app) return;
        setLoading(true);
        setError('');
        setMlPred(null);
        setDdNote(null);
        setReport(null);
        try {
            const [repRes, mlRes, ddRes] = await Promise.allSettled([
                apiClient.get(`/applications/${app.id}/automated-report`),
                apiClient.get(`/admin/ml-predictions/${app.id}`),
                apiClient.get(`/applications/${app.id}/due-diligence`),
            ]);
            if (repRes.status === 'fulfilled') setReport(repRes.value.data);
            if (mlRes.status === 'fulfilled') setMlPred(mlRes.value.data);
            if (ddRes.status === 'fulfilled') setDdNote(ddRes.value.data);
        } catch {
            setError('Partial data — ensure services are running.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadApp(selectedApp); }, [selectedApp?.id, loadApp]);

    const assuranceScore = mlPred?.assuranceScore ?? report?.assuranceScore ?? 50;
    let decision = mlPred?.decision ?? report?.autoDecision ?? 'MANUAL_REVIEW';
    if (selectedApp?.status === 'DECIDED') decision = 'APPROVED';
    if (selectedApp?.status === 'REJECTED') decision = 'REJECTED';
    const maxLoan = mlPred?.recommendedMaxLoan ?? (selectedApp?.requestedAmount ?? 0);
    const tenor = mlPred?.recommendedTenorMonths ?? 36;
    const emi = mlPred?.emiEstimate ?? 0;
    const fraudPct = mlPred?.fraudProbabilityPct ?? '—';
    const tier = mlPred?.recommendationTier ?? '—';
    const qualAdj = ddNote?.qualitativeScoreAdjustment ?? 0;
    const finalScore = Math.min(100, Math.max(0, assuranceScore + qualAdj));
    const rate = interestRate(finalScore);
    const dc = DC_CFG[decision] ?? DC_CFG['MANUAL_REVIEW'];
    const cs = buildFiveCs(mlPred, ddNote);
    const avgFiveC = Math.round(cs.reduce((s, c) => s + c.score, 0) / cs.length);
    const keys = report?.keyDrivers ?? [];

    return (
        <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/30">
            {/* ── LEFT: Company selector ─────────────────────────────────────────── */}
            <div className="w-72 border-r border-slate-200 bg-white flex flex-col">
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-600 rounded-xl">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-slate-800">CAM Engine</h1>
                            <p className="text-xs text-slate-400">{user?.name}</p>
                        </div>
                    </div>
                </div>
                <div className="p-3 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Portfolio — {dbApps.length} Applications</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {dbApps.map(app => {
                        const isSelected = selectedApp?.id === app.id;
                        return (
                            <button
                                key={app.id}
                                onClick={() => setSelectedApp(app)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-mono font-bold text-indigo-600">APP-{1000 + app.id}</span>
                                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-500' : 'text-slate-300'}`} />
                                </div>
                                <p className="text-sm font-bold text-slate-800 leading-tight">{app.companyName}</p>
                                <p className="text-xs text-slate-400 mt-1">{app.industry} · {app.city}</p>
                                <div className="flex justify-between items-center mt-1.5">
                                    <p className="text-xs font-bold text-slate-600">Req: ₹ {app.requestedAmount ? (app.requestedAmount / 1e7).toFixed(1) : '—'} Cr</p>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${app.status === 'DECIDED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>{app.status}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-slate-100">
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-600 text-sm font-bold">
                        <LogOut className="w-4 h-4" /><span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* ── RIGHT: CAM Detail ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Company header */}
                {selectedApp && (
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">{selectedApp.companyName}</h2>
                            <p className="text-sm text-slate-500">{selectedApp.industry} · {selectedApp.city} · APP-{1000 + selectedApp.id}</p>
                        </div>
                        {loading && <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />}
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs flex items-center space-x-2">
                        <Info className="w-4 h-4 shrink-0" /><span>{error}</span>
                    </div>
                )}

                {/* Decision Banner */}
                <div className={`${dc.bg} rounded-2xl p-5 flex items-center justify-between shadow-md`}>
                    <div className="flex items-center space-x-4">
                        <dc.icon className={`w-8 h-8 ${dc.text}`} />
                        <div>
                            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
                                {selectedApp?.status === 'DECIDED' || selectedApp?.status === 'REJECTED' ? 'Final Decision' : 'AI Recommendation'}
                            </p>
                            <h3 className={`text-2xl font-black ${dc.text}`}>{dc.label}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-xl font-black ${dc.text}`}>₹ {(maxLoan / 1e7).toFixed(2)} Cr</p>
                        <p className="text-white/70 text-xs">@ {rate}% p.a. · {tenor}mo</p>
                        {emi > 0 && <p className="text-white/60 text-xs">EMI ₹{emi.toLocaleString('en-IN')}/mo</p>}
                    </div>
                </div>

                {selectedApp?.status !== 'DECIDED' && selectedApp?.status !== 'REJECTED' && (
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => handleDecision('REJECTED')} className="px-6 py-2.5 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 shadow-sm transition-all text-sm">REJECT LOAN</button>
                        <button onClick={() => handleDecision('DECIDED')} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm transition-all text-sm">APPROVE LOAN</button>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    {/* Score */}
                    <div className="space-y-4">
                        <MacWindow title="Composite Score">
                            <div className="p-5 text-center">
                                <div className="relative inline-flex items-center justify-center w-32 h-32">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                                        <circle cx="60" cy="60" r="52" fill="none"
                                            stroke={finalScore >= 70 ? '#10b981' : finalScore >= 50 ? '#f59e0b' : '#ef4444'}
                                            strokeWidth="12"
                                            strokeDasharray={`${(finalScore / 100) * 327} 327`}
                                            strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-slate-800">{finalScore}</span>
                                        <span className="text-xs text-slate-400">/ 100</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Five-C avg: {avgFiveC}</p>
                                {qualAdj !== 0 && <p className={`text-xs font-semibold mt-1 ${qualAdj > 0 ? 'text-emerald-600' : 'text-red-600'}`}>DD adj: {qualAdj > 0 ? '+' : ''}{qualAdj}pts</p>}
                            </div>
                        </MacWindow>

                        <MacWindow title="Terms">
                            <div className="p-4 space-y-3">
                                {[
                                    ['Limit', `₹ ${(maxLoan / 1e7).toFixed(2)} Cr`],
                                    ['Rate (p.a.)', `${rate}%`],
                                    ['Tenor', `${tenor} months`],
                                    ['EMI est.', emi > 0 ? `₹${emi.toLocaleString('en-IN')}` : '—'],
                                    ['Fraud Risk', fraudPct],
                                    ['Tier', tier],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between border-b border-slate-50 pb-1.5">
                                        <span className="text-xs font-bold text-slate-400 uppercase">{k}</span>
                                        <span className="text-xs font-black text-slate-800">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </MacWindow>

                        {ddNote && (
                            <MacWindow title="Field DD">
                                <div className="p-4 space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-slate-400 font-bold">Capacity</span><span className={`font-black ${ddNote.capacityUtilizationPct >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>{ddNote.capacityUtilizationPct}%</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400 font-bold">Promoter</span><span className="font-black text-slate-700">{ddNote.promoterAssessment}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400 font-bold">Legal</span><span className={`font-black ${ddNote.legalConcernsNoted ? 'text-red-600' : 'text-emerald-600'}`}>{ddNote.legalConcernsNoted ? 'Issues ⚠' : 'Clean'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400 font-bold">Sentiment</span><span className="font-black text-slate-700">{ddNote.overallSentiment}</span></div>
                                </div>
                            </MacWindow>
                        )}
                    </div>

                    {/* Five Cs + Explainability */}
                    <div className="xl:col-span-2 space-y-5">
                        <MacWindow title="Five Cs of Credit">
                            <div className="p-4 grid grid-cols-5 gap-3">
                                {cs.map(c => (
                                    <div key={c.label} className={`border rounded-xl p-3 space-y-2 ${GRADE_RING[c.color]}`}>
                                        <div className="flex justify-between"><c.icon className="w-4 h-4" /><span className="text-xl font-black">{c.grade}</span></div>
                                        <p className="text-[10px] font-black uppercase tracking-wider">{c.label}</p>
                                        <div className="w-full bg-white/50 rounded-full h-1.5">
                                            <div className="h-1.5 rounded-full bg-current opacity-60" style={{ width: `${c.score}%` }} />
                                        </div>
                                        <p className="text-[10px] opacity-80 leading-tight">{c.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </MacWindow>

                        <MacWindow title="Why This Recommendation?">
                            <div className="p-4 space-y-2">
                                {(keys.length > 0 ? keys : [
                                    `Assurance score ${assuranceScore}/100 — ${assuranceScore >= 70 ? 'strong profile' : assuranceScore >= 50 ? 'moderate profile' : 'weak profile'}`,
                                    `Fraud probability: ${fraudPct}${mlPred?.isAnomalous ? ' — ANOMALY detected in bank data' : ''}`,
                                    `Recommended ₹${(maxLoan / 1e7).toFixed(2)} Cr @ ${rate}% based on risk-adjusted pricing`,
                                    ddNote ? `Field DD adjustment: ${qualAdj > 0 ? '+' : ''}${qualAdj}pts` : 'No due diligence data yet',
                                ]).map((line: string, i: number) => (
                                    <div key={i} className="flex items-start space-x-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                        <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-slate-700">{line}</p>
                                    </div>
                                ))}
                            </div>
                        </MacWindow>

                        {/* Revenue forecast mini chart */}
                        {mlPred?.forecastJson && (() => {
                            let vals: number[] = [];
                            try { vals = JSON.parse(mlPred.forecastJson.replace(/'/g, '"')); } catch { vals = [0, 0, 0]; }
                            const mx = Math.max(...vals, 1);
                            return (
                                <MacWindow title="Revenue Forecast — Next 3 Months">
                                    <div className="p-4 flex items-end justify-between space-x-4 h-36">
                                        {vals.map((v: number, i: number) => (
                                            <div key={i} className="flex-1 flex flex-col items-center space-y-2">
                                                <span className="text-xs font-bold text-slate-600 truncate max-w-[80px]">₹{(v / 1e5).toFixed(1)}L</span>
                                                <div className="w-full bg-slate-100 rounded-lg flex flex-col justify-end" style={{ height: '70px', minHeight: '70px' }}>
                                                    <div className={`w-full rounded-lg ${mlPred.revenueTrend === 'GROWING' ? 'bg-emerald-400' : mlPred.revenueTrend === 'DECLINING' ? 'bg-red-400' : 'bg-indigo-400'}`}
                                                        style={{ height: `${(v / mx) * 100}%` }} />
                                                </div>
                                                <span className="text-[10px] text-slate-400">M{i + 1}</span>
                                            </div>
                                        ))}
                                        <div className="text-[10px] text-slate-500 pl-2 border-l border-slate-200 pb-1 self-end flex-1 mb-1">
                                            <p className="font-bold whitespace-nowrap">{mlPred.revenueTrend}</p>
                                            <p className={`whitespace-nowrap ${mlPred.growthRatePct > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{mlPred.growthRatePct > 0 ? '+' : ''}{mlPred.growthRatePct?.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </MacWindow>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};
