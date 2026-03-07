import React, { useState, useEffect, useCallback } from 'react';
import { MacWindow } from '../components/MacWindow';
import { useAuth } from '../contexts/AuthContext';
import {
    LogOut, Activity, AlertTriangle, CheckCircle2, ShieldAlert,
    Search, Newspaper, Scale, Globe2, BadgeAlert, TrendingDown, TrendingUp, Loader2, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export const RiskAnalystDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [appsQueue, setAppsQueue] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [gstEntries, setGstEntries] = useState<any[]>([]);
    const [bankEntries, setBankEntries] = useState<any[]>([]);
    const [mlPred, setMlPred] = useState<any>(null);
    const [ddNote, setDdNote] = useState<any>(null);
    const [researchData, setResearchData] = useState<any>(null);
    const [selectedScore, setSelectedScore] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [activeTab, setActiveTab] = useState<'gst' | 'bank' | 'research' | 'ml'>('ml');

    const loadAppDetails = useCallback(async (app: any) => {
        setLoadingDetails(true);
        setSelectedApp(app);
        const id = app.id;
        try {
            const [gstRes, bankRes, mlRes, ddRes, researchRes, scoreRes] = await Promise.allSettled([
                apiClient.get(`/applications/${id}/gst`),
                apiClient.get(`/applications/${id}/bank`),
                apiClient.get(`/admin/ml-predictions/${id}`),
                apiClient.get(`/applications/${id}/due-diligence`),
                apiClient.get(`/applications/${id}/research`),
                apiClient.get(`/admin/credit-scores/${id}`),
            ]);
            if (gstRes.status === 'fulfilled') setGstEntries(gstRes.value.data);
            if (bankRes.status === 'fulfilled') setBankEntries(bankRes.value.data);
            if (mlRes.status === 'fulfilled') setMlPred(mlRes.value.data);
            if (ddRes.status === 'fulfilled') setDdNote(ddRes.value.data);
            if (researchRes.status === 'fulfilled') {
                const r = researchRes.value.data;
                if (r.newsItemsJson) {
                    try { r.parsedNews = JSON.parse(r.newsItemsJson); } catch (e) { }
                }
                setResearchData(r);
            } else {
                setResearchData(null);
            }
            if (scoreRes.status === 'fulfilled') setSelectedScore(scoreRes.value.data);
            else setSelectedScore(null);
        } finally {
            setLoadingDetails(false);
        }
    }, []);

    // Load queue and auto-select first
    useEffect(() => {
        apiClient.get('/applications').then(res => {
            setAppsQueue(res.data);
            if (res.data.length > 0) loadAppDetails(res.data[0]);
        }).catch(console.error);
    }, [loadAppDetails]);

    const TABS = [
        { id: 'ml', label: 'ML Signals' },
        { id: 'gst', label: 'GST Data' },
        { id: 'bank', label: 'Bank Data' },
        { id: 'research', label: '🔍 Research Agent' },
    ] as const;

    const renderMLSignals = () => (
        <div className="space-y-4">
            {mlPred ? (
                <>
                    {/* Scores */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Risk Score', val: `${mlPred.riskScore}/100`, color: mlPred.riskScore >= 70 ? 'emerald' : mlPred.riskScore >= 50 ? 'amber' : 'red' },
                            { label: 'Decision', val: mlPred.decision, color: mlPred.decision === 'APPROVED' ? 'emerald' : mlPred.decision === 'REJECTED' ? 'red' : 'amber' },
                            { label: 'Fraud Risk', val: mlPred.fraudProbabilityPct, color: mlPred.isAnomalous ? 'red' : 'emerald' },
                            { label: 'Confidence', val: `${(mlPred.riskConfidence * 100).toFixed(0)}%`, color: 'indigo' },
                        ].map(s => (
                            <div key={s.label} className={`p-4 rounded-xl border bg-${s.color}-50 border-${s.color}-200`}>
                                <p className={`text-xs font-bold text-${s.color}-600 uppercase tracking-wider mb-1`}>{s.label}</p>
                                <p className={`text-xl font-black text-${s.color}-700`}>{s.val}</p>
                            </div>
                        ))}
                    </div>
                    {/* Flags */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-4 rounded-xl border ${mlPred.isAnomalous ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'} flex items-center space-x-3`}>
                            {mlPred.isAnomalous ? <BadgeAlert className="w-5 h-5 text-red-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-500">Isolation Forest</p>
                                <p className="font-bold text-sm">{mlPred.isAnomalous ? 'ANOMALY DETECTED' : 'No Anomaly'}</p>
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl border ${mlPred.revenueTrend === 'GROWING' ? 'bg-emerald-50 border-emerald-200' : mlPred.revenueTrend === 'DECLINING' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'} flex items-center space-x-3`}>
                            {mlPred.revenueTrend === 'GROWING' ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-500">Revenue Trend</p>
                                <p className="font-bold text-sm">{mlPred.revenueTrend} ({mlPred.growthRatePct?.toFixed(1)}%)</p>
                            </div>
                        </div>
                    </div>
                    {/* Detailed Five C's Scorecard */}
                    {selectedScore && (
                        <div className="grid grid-cols-5 gap-2">
                            {[
                                { l: 'Character', v: selectedScore.character },
                                { l: 'Capacity', v: selectedScore.capacity },
                                { l: 'Capital', v: selectedScore.capital },
                                { l: 'Collateral', v: selectedScore.collateral },
                                { l: 'Conditions', v: selectedScore.conditions }
                            ].map(c => (
                                <div key={c.l} className="bg-white border border-slate-200 p-2 rounded-lg text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{c.l}</p>
                                    <p className={`text-sm font-black ${c.v > 75 ? 'text-emerald-600' : c.v > 50 ? 'text-amber-600' : 'text-red-600'}`}>{c.v}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Loan */}
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-indigo-600 uppercase">Recommended Loan</p>
                            <p className="text-2xl font-black text-indigo-700">₹ {(mlPred.recommendedMaxLoan / 1e7).toFixed(2)} Cr</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">{mlPred.recommendedTenorMonths}mo · ₹{mlPred.emiEstimate?.toLocaleString('en-IN')}/mo EMI</p>
                            <span className={`text-xs font-black px-2 py-1 rounded-full border ${mlPred.recommendationTier === 'PRIME' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : mlPred.recommendationTier === 'RESTRICTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {mlPred.recommendationTier}
                            </span>
                        </div>
                    </div>

                    {/* ML explainability note */}
                    {selectedScore?.explainability && (
                        <div className="p-3 bg-slate-900 text-slate-300 rounded-xl text-xs font-mono">
                            <p className="text-indigo-400 font-bold mb-1 uppercase text-[10px]">Model Explainability (SHAP/LIME)</p>
                            {selectedScore.explainability}
                        </div>
                    )}

                    {/* DD note */}
                    {ddNote && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Due Diligence Signal</p>
                            <div className="flex flex-wrap gap-3">
                                <span className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1 font-semibold">Capacity: {ddNote.capacityUtilizationPct}%</span>
                                <span className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1 font-semibold">Promoter: {ddNote.promoterAssessment}</span>
                                <span className={`text-xs rounded-lg px-3 py-1 font-semibold border ${ddNote.legalConcernsNoted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                    Legal: {ddNote.legalConcernsNoted ? 'Issues noted' : 'Clean'}
                                </span>
                                {ddNote.qualitativeScoreAdjustment != null && (
                                    <span className={`text-xs rounded-lg px-3 py-1 font-semibold border ${ddNote.qualitativeScoreAdjustment >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                        DD Adj: {ddNote.qualitativeScoreAdjustment > 0 ? '+' : ''}{ddNote.qualitativeScoreAdjustment}pts
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-10 text-slate-400">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="font-semibold">No ML predictions yet — ingest documents to generate signals.</p>
                </div>
            )}
        </div>
    );

    const renderGST = () => (
        gstEntries.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No GST data ingested for this application.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-slate-100">
                            {['Period', 'GSTR-3B', 'GSTR-2A', 'Variance', 'Circular Flag'].map(h => (
                                <th key={h} className="py-2 px-3 text-xs font-black text-slate-400 uppercase">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {gstEntries.map((e: any, i: number) => {
                            const g3 = Number(e.gstr3bTurnover) || 0;
                            const g2 = Number(e.gstr2aTurnover) || 0;
                            const varPct = g3 > 0 ? ((Math.abs(g3 - g2) / g3) * 100).toFixed(1) : '—';
                            return (
                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="py-2 px-3 font-mono text-xs">{e.period}</td>
                                    <td className="py-2 px-3 font-semibold text-slate-700">₹{(g3 / 1e5).toFixed(1)}L</td>
                                    <td className="py-2 px-3 font-semibold text-slate-700">₹{(g2 / 1e5).toFixed(1)}L</td>
                                    <td className="py-2 px-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${Number(varPct) > 15 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                            {varPct}%
                                        </span>
                                    </td>
                                    <td className="py-2 px-3">
                                        {e.circularTradingFlag
                                            ? <span className="text-xs font-black text-red-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />FLAGGED</span>
                                            : <span className="text-xs text-emerald-600 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" />Clear</span>
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )
    );

    const renderBank = () => (
        bankEntries.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No bank transaction data ingested yet.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-slate-100">
                            {['Date', 'Credit', 'Debit', 'Balance', 'Suspicious'].map(h => (
                                <th key={h} className="py-2 px-3 text-xs font-black text-slate-400 uppercase">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bankEntries.slice(0, 15).map((t: any, i: number) => (
                            <tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${t.suspiciousFlag ? 'bg-red-50/30' : ''}`}>
                                <td className="py-2 px-3 font-mono text-xs text-slate-500">{t.transactionDate?.slice(0, 10)}</td>
                                <td className="py-2 px-3 text-emerald-700 font-semibold">{t.credit ? `₹${Number(t.credit).toLocaleString('en-IN')}` : '—'}</td>
                                <td className="py-2 px-3 text-red-600 font-semibold">{t.debit ? `₹${Number(t.debit).toLocaleString('en-IN')}` : '—'}</td>
                                <td className="py-2 px-3 text-slate-700 font-semibold">{t.balance ? `₹${Number(t.balance).toLocaleString('en-IN')}` : '—'}</td>
                                <td className="py-2 px-3">
                                    {t.suspiciousFlag
                                        ? <span className="text-xs font-black text-red-600 flex items-center"><ShieldAlert className="w-3 h-3 mr-1" />YES</span>
                                        : <span className="text-xs text-slate-400">—</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bankEntries.length > 15 && (
                    <p className="text-xs text-slate-400 text-center py-2">Showing 15 of {bankEntries.length} transactions</p>
                )}
            </div>
        )
    );

    const renderResearch = () => {
        const research = researchData;
        return !research ? (
            <div className="py-12 text-center text-slate-400">
                <Globe2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p>No secondary research data found for this application yet.</p>
            </div>
        ) : (
            <div className="space-y-6">
                {/* MCA Filing */}
                <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                        <Globe2 className="w-3.5 h-3.5 mr-1.5" />MCA Filing Status
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { label: 'CIN', val: research.mcaCin },
                            { label: 'Registered', val: research.mcaRegisteredDate },
                            { label: 'Paid-up Capital', val: research.mcaPaidUpCapital },
                            { label: 'Directors', val: `${research.mcaDirectorCount}` },
                            { label: 'Status', val: research.mcaActive ? '✅ Active Company' : '❌ Inactive' },
                            { label: 'Filing', val: research.mcaFilingStatus },
                        ].map(item => (
                            <div key={item.label} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <p className="text-xs text-slate-400 font-bold">{item.label}</p>
                                <p className="text-xs font-semibold text-slate-700 mt-0.5">{item.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* News Intelligence */}
                <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                        <Newspaper className="w-3.5 h-3.5 mr-1.5" />Secondary Research — News & Sector Intel
                    </h4>
                    <div className="space-y-2">
                        {research.parsedNews?.map((n: any, i: number) => (
                            <div key={i} className={`flex items-start space-x-3 p-3 rounded-xl border ${n.sentiment === 'POSITIVE' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                {n.sentiment === 'POSITIVE' ? <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <TrendingDown className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">{n.headline}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{n.source} · {n.date}</p>
                                </div>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${n.sentiment === 'POSITIVE' ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'}`}>{n.sentiment}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Litigation */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                            <Scale className="w-3.5 h-3.5 mr-1.5" />eCourts Litigation Check
                        </h4>
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <p className={`text-sm font-bold ${research.eCourtsCaseCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                {research.eCourtsCaseCount === 0 ? '✅ 0 Active Cases' : `⚠️ ${research.eCourtsCaseCount} Active Cases`}
                            </p>
                            <p className="text-xs text-slate-700 mt-1">{research.litigationNote}</p>
                            <p className={`text-xs mt-1 ${research.dgftAlerts !== 'None' ? 'text-red-600 font-bold' : 'text-slate-500'}`}>DGFT Alerts: {research.dgftAlerts}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                            <Search className="w-3.5 h-3.5 mr-1.5" />CIBIL Commercial
                        </h4>
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                            <p className={`text-2xl font-black ${research.cibilScore >= 700 ? 'text-emerald-700' : research.cibilScore >= 650 ? 'text-indigo-700' : 'text-red-700'}`}>
                                {research.cibilScore}
                            </p>
                            <p className="text-xs text-indigo-600 mt-1">Grade: {research.cibilGrade} · {research.cibilOutstandingLoans} active loans</p>
                            <p className="text-xs text-slate-500 mt-1">Overdue: {research.cibilOverdueAccounts} accounts</p>
                        </div>
                    </div>
                </div>

                {/* Sector */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2">{research.sectorName} Sector Outlook</p>
                    <div className="space-y-1 text-sm">
                        <div className="flex items-start space-x-2"><ChevronRight className="w-3 h-3 text-amber-500 mt-1 shrink-0" /><p className="text-amber-800">{research.sectorHeadwind}</p></div>
                        <div className="flex items-start space-x-2"><ChevronRight className="w-3 h-3 text-amber-500 mt-1 shrink-0" /><p className="text-amber-800">{research.rbiPolicyNote}</p></div>
                        <div className="flex items-start space-x-2"><ChevronRight className="w-3 h-3 text-amber-500 mt-1 shrink-0" /><p className="text-amber-800">Sector projected growth: {research.sectorGrowthPct}% YoY</p></div>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Top Nav */}
            <div className="w-full flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 shadow-sm z-20">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Risk Analyst Workbench</h1>
                    <p className="text-sm text-slate-500 font-medium">{user?.name} · Investigation & Research</p>
                </div>
                <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-600">
                    <LogOut className="w-4 h-4" /><span className="font-bold text-sm">Sign Out</span>
                </button>
            </div>

            {/* Main split layout */}
            <main className="flex-1 overflow-hidden flex">
                {/* LEFT: App List */}
                <div className="w-72 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Manual Review Queue</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {appsQueue.map((app: any) => {
                            const risk = app.riskBand || (app.id % 3 === 0 ? 'HIGH' : app.id % 2 === 0 ? 'MEDIUM' : 'LOW');
                            const badge = risk === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                                risk === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-200';

                            return (
                                <button
                                    key={app.id}
                                    onClick={() => loadAppDetails(app)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedApp?.id === app.id ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-mono font-bold text-indigo-600">APP-{1000 + app.id}</span>
                                        <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded border ${badge}`}>{risk}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 leading-tight">{app.companyName}</p>
                                    <p className="text-xs text-amber-600 font-semibold mt-1.5">{app.industry}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{app.city}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: Detail pane */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {selectedApp && (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">{selectedApp.companyName}</h2>
                                    <p className="text-sm text-slate-500">{selectedApp.industry} · {selectedApp.cin}</p>
                                </div>
                                {loadingDetails && <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />}
                            </div>

                            {/* Tab Nav */}
                            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <MacWindow title={TABS.find(t => t.id === activeTab)?.label ?? ''}>
                                <div className="p-4">
                                    {activeTab === 'ml' && renderMLSignals()}
                                    {activeTab === 'gst' && renderGST()}
                                    {activeTab === 'bank' && renderBank()}
                                    {activeTab === 'research' && renderResearch()}
                                </div>
                            </MacWindow>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};
