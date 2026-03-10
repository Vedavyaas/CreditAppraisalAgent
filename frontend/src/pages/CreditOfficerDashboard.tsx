import React, { useState, useEffect } from 'react';
import { MacWindow } from '../components/MacWindow';
import { useAuth } from '../contexts/AuthContext';
import {
    LogOut, UploadCloud, LayoutDashboard, Search, FileText, CheckCircle,
    AlertCircle, X, TrendingUp, ClipboardList, Building2, Users, Gavel,
    ChevronRight, Loader2, Save, CheckCircle2, Factory, Plus, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UploadZone } from '../components/UploadZone';
import { JobStatusTracker } from '../components/JobStatusTracker';
import apiClient from '../api/apiClient';

type TabId = 'queue' | 'ingest' | 'diligence';

const RISK_COLORS: Record<string, string> = {
    LOW: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200',
    HIGH: 'bg-red-50 text-red-600 border-red-200',
};

export const CreditOfficerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>('queue');
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [activeJobs, setActiveJobs] = useState<number[]>([]);

    // Due Diligence State
    const [ddLoading, setDdLoading] = useState(false);
    const [ddSaving, setDdSaving] = useState(false);
    const [ddSaved, setDdSaved] = useState(false);
    const [ddResult, setDdResult] = useState<any>(null);
    const [ddForm, setDdForm] = useState({
        siteVisitObservations: '',
        managementInterviewNotes: '',
        capacityUtilizationPct: 70,
        promoterAssessment: 'NEUTRAL',
        legalConcernsNoted: '',
    });

    const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
    const [newAppForm, setNewAppForm] = useState({
        companyName: '',
        cin: '',
        pan: '',
        gstNumber: '',
        industry: '',
        city: '',
        turnover: 0,
        loanType: '',
        loanTenure: 36,
        loanInterest: 0,
        requestedAmount: 0,
    });
    const [isCreatingApp, setIsCreatingApp] = useState(false);

    const [dbApplications, setDbApplications] = useState<any[]>([]);
    const [ddSelectedAppId, setDdSelectedAppId] = useState<number | ''>('');
    const [ingestSelectedAppId, setIngestSelectedAppId] = useState<number | ''>('');

    const [selectedAppDocs, setSelectedAppDocs] = useState<any[]>([]);
    const [selectedAppBankAvg, setSelectedAppBankAvg] = useState<string>('Pending');
    const [selectedAppGstAvg, setSelectedAppGstAvg] = useState<string>('Pending');
    const [selectedAppScore, setSelectedAppScore] = useState<any>(null);
    const [hasCircularFlags, setHasCircularFlags] = useState(false);

    useEffect(() => {
        if (selectedApp?.id) {
            apiClient.get(`/applications/${selectedApp.id}/documents`)
                .then(res => setSelectedAppDocs(res.data || []))
                .catch(console.error);

            apiClient.get(`/applications/${selectedApp.id}/bank`)
                .then(res => {
                    if (res.data?.length > 0) {
                        const maxB = Math.max(...res.data.map((b: any) => b.balance || 0));
                        setSelectedAppBankAvg(`₹ ${(maxB / 100000).toFixed(1)} Lakhs Avg`);
                    } else setSelectedAppBankAvg('No Bank Data');
                }).catch(console.error);

            apiClient.get(`/applications/${selectedApp.id}/gst`)
                .then(res => {
                    if (res.data?.length > 0) {
                        const sumG = res.data.reduce((s: number, g: any) => s + (g.gstr3bTurnover || 0), 0);
                        setSelectedAppGstAvg(`₹ ${(sumG / 10000000).toFixed(2)} Cr Revenue / yr`);
                        setHasCircularFlags(res.data.some((g: any) => g.circularTradingFlag));
                    } else {
                        setSelectedAppGstAvg('No GST Data');
                        setHasCircularFlags(false);
                    }
                }).catch(console.error);

            apiClient.get(`/admin/ml-predictions/${selectedApp.id}`)
                .then(res => setSelectedAppScore(res.data))
                .catch(() => setSelectedAppScore(null));
        }
    }, [selectedApp?.id]);

    useEffect(() => {
        apiClient.get('/applications')
            .then(res => setDbApplications(res.data))
            .catch(console.error);
    }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMsg(msg);
        setToastType(type);
        setTimeout(() => setToastMsg(''), 5000);
    };

    const handleUploadSuccess = (jobExecutionId: number) => {
        setActiveJobs(prev => [...prev, jobExecutionId]);
        showToast(`Ingestion pipeline started (Job #${jobExecutionId}). Tracking live below.`);
    };

    const handleJobComplete = (jobId: number) => {
        showToast(`Job #${jobId} completed. Data is ready for analysis.`);
    };

    // Load existing DD notes when tab is opened
    useEffect(() => {
        if (activeTab === 'diligence' && ddSelectedAppId) {
            setDdLoading(true);
            apiClient.get(`/applications/${ddSelectedAppId}/due-diligence`)
                .then(res => {
                    const d = res.data;
                    setDdForm({
                        siteVisitObservations: d.siteVisitObservations || '',
                        managementInterviewNotes: d.managementInterviewNotes || '',
                        capacityUtilizationPct: d.capacityUtilizationPct ?? 70,
                        promoterAssessment: d.promoterAssessment || 'NEUTRAL',
                        legalConcernsNoted: d.legalConcernsNoted || '',
                    });
                    setDdResult(d);
                })
                .catch(() => { /* No notes yet, use defaults */
                    setDdForm({
                        siteVisitObservations: '',
                        managementInterviewNotes: '',
                        capacityUtilizationPct: 70,
                        promoterAssessment: 'NEUTRAL',
                        legalConcernsNoted: '',
                    });
                    setDdResult(null);
                })
                .finally(() => setDdLoading(false));
        }
    }, [activeTab, ddSelectedAppId]);

    const handleSaveDueDiligence = async () => {
        if (!ddSelectedAppId) {
            showToast('Please select an application first', 'error');
            return;
        }
        setDdSaving(true);
        try {
            const res = await apiClient.post(`/applications/${ddSelectedAppId}/due-diligence`, ddForm);
            setDdResult(res.data);
            setDdSaved(true);
            setTimeout(() => setDdSaved(false), 3000);
            showToast(`Due Diligence notes saved. Qualitative score adjustment: ${res.data.qualitativeScoreAdjustment > 0 ? '+' : ''}${res.data.qualitativeScoreAdjustment} pts`);
        } catch {
            showToast('Failed to save notes.', 'error');
        } finally {
            setDdSaving(false);
        }
    };

    const handleCreateApp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingApp(true);
        try {
            const res = await apiClient.post('/applications', {
                ...newAppForm,
                status: 'IN_REVIEW',
                createdBy: user?.email || 'credit@test.com'
            });
            setDbApplications(prev => [res.data, ...prev]);
            setIsNewAppModalOpen(false);
            setNewAppForm({
                companyName: '',
                cin: '',
                pan: '',
                gstNumber: '',
                industry: '',
                city: '',
                turnover: 0,
                loanType: '',
                loanTenure: 36,
                loanInterest: 0,
                requestedAmount: 0,
            });
            showToast(`New application created for ${res.data.companyName}`);
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to create application', 'error');
        } finally {
            setIsCreatingApp(false);
        }
    };

    const TAB_CONFIG: { id: TabId; label: string; icon: React.FC<any> }[] = [
        { id: 'queue', label: 'Application Queue', icon: LayoutDashboard },
        { id: 'ingest', label: 'Document Ingestor', icon: UploadCloud },
        { id: 'diligence', label: 'Due Diligence Notes', icon: ClipboardList },
    ];

    const STATUS_META: Record<string, { label: string; dot: string; bg: string; text: string }> = {
        AWAITING_DOCS: { label: 'Awaiting Docs', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' },
        IN_REVIEW: { label: 'In Review', dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700' },
        PENDING_MANAGER: { label: 'Pending Manager', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    };

    const PIPELINE_STATS = [
        { label: 'Total Active', val: dbApplications.length, color: 'indigo' },
        { label: 'In Review', val: dbApplications.filter(a => a.status === 'IN_REVIEW').length, color: 'amber' },
        { label: 'Pending Manager', val: dbApplications.filter(a => a.status === 'PENDING_MANAGER' || a.status === 'DECIDED').length, color: 'emerald' },
    ];
    const renderQueue = () => (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
            {/* Pipeline stat strip */}
            <div className="grid grid-cols-4 gap-4">
                {PIPELINE_STATS.map(s => (
                    <div key={s.label} className={`p-4 rounded-2xl border bg-${s.color}-50 border-${s.color}-100 flex items-center space-x-4`}>
                        <div>
                            <p className={`text-3xl font-black text-${s.color}-700`}>{s.val}</p>
                            <p className={`text-xs font-bold text-${s.color}-500 uppercase tracking-wider mt-0.5`}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Application list */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-base font-black text-slate-800">Active Applications</h2>
                    <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-400">{dbApplications.length} records</span>
                        <button
                            onClick={() => setIsNewAppModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Application</span>
                        </button>
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-wider">
                            <th className="px-6 py-3 text-left">Borrower</th>
                            <th className="px-6 py-3 text-left">Sector</th>
                            <th className="px-6 py-3 text-left">Revenue</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Risk</th>
                            <th className="px-6 py-3 text-left">In Queue</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {dbApplications.map((app, i) => {
                            const sm = STATUS_META[app.status] || { label: app.status, dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' };
                            const initials = (app.companyName || 'U').split(' ').slice(0, 2).map((w: string) => w[0]).join('');
                            const avatarColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500', 'bg-rose-500'];
                            const risk = app.riskBand || (app.id % 3 === 0 ? 'HIGH' : app.id % 2 === 0 ? 'MEDIUM' : 'LOW');
                            const daysInQueue = Math.floor((new Date().getTime() - new Date(app.createdAt || new Date()).getTime()) / (1000 * 3600 * 24)) || 1;

                            return (
                                <tr
                                    key={app.id}
                                    onClick={() => setSelectedApp({ ...app, risk })}
                                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-9 h-9 rounded-xl ${avatarColors[i % 5]} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                                                {initials}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{app.companyName}</p>
                                                <p className="text-xs text-slate-400 font-mono">APP-{1000 + app.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-slate-600 font-semibold">{app.industry}</p>
                                        <p className="text-xs text-slate-400">{app.city}</p>
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-800">
                                        {app.gstNumber ? '₹ ' + (Number(app.id) * 1.2).toFixed(1) + ' Cr' : 'Pending'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${sm.bg} ${sm.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                                            <span>{sm.label}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest border ${RISK_COLORS[risk]}`}>
                                            {risk}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-bold ${daysInQueue >= 5 ? 'text-red-600' : daysInQueue >= 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                                            {daysInQueue}d
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors ml-auto" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderIngest = () => (
        <div className="max-w-4xl mx-auto mt-6 animate-fade-in space-y-6">
            <MacWindow title="Multi-Format Document Ingestor" className="min-h-[420px]">
                <div className="p-8 flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Borrower Documents</h3>
                    <p className="text-slate-500 text-sm mb-2 text-center max-w-lg">
                        Supports <strong>GST Returns (CSV)</strong>, <strong>Bank Statements (CSV)</strong>, <strong>Annual Reports</strong>, <strong>Legal Notices</strong>, <strong>Rating Reports</strong>, <strong>Sanction Letters</strong> (PDF). AI engine will parse and extract structured data.
                    </p>
                    <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6 w-full max-w-lg">
                        <Building2 className="w-5 h-5 text-slate-400" />
                        <select
                            value={ingestSelectedAppId}
                            onChange={(e) => setIngestSelectedAppId(e.target.value ? Number(e.target.value) : '')}
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none flex-1"
                        >
                            <option value="">-- Choose Borrower --</option>
                            {dbApplications.map(app => (
                                <option key={app.id} value={app.id}>{app.companyName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full max-w-lg">
                        {ingestSelectedAppId ? (
                            <UploadZone applicationId={Number(ingestSelectedAppId)} onUploadSuccess={handleUploadSuccess} />
                        ) : (
                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                                <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-400 font-semibold">Please select a borrower first</p>
                            </div>
                        )}
                    </div>
                </div>
            </MacWindow>

            <MacWindow title="Live Ingestion Pipeline Monitor">
                <div className="p-4 min-h-[150px]">
                    <JobStatusTracker activeJobs={activeJobs} onJobComplete={handleJobComplete} />
                </div>
            </MacWindow>
        </div>
    );

    const renderDueDiligence = () => (
        <div className="max-w-4xl mx-auto mt-6 animate-fade-in space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Primary Due Diligence</h2>
                    <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4">
                        <Building2 className="w-5 h-5 text-slate-400" />
                        <select
                            value={ddSelectedAppId}
                            onChange={(e) => setDdSelectedAppId(e.target.value ? Number(e.target.value) : '')}
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none w-64"
                        >
                            <option value="">-- Select Application --</option>
                            {dbApplications.map(app => (
                                <option key={app.id} value={app.id}>{app.companyName} ({app.cin})</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-slate-500 mt-1 text-sm">
                        Enter qualitative observations from factory visits and management interviews.
                        The AI adjusts the final assurance score based on these primary insights.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    {ddSaved && (
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
                            ✓ Notes saved
                        </span>
                    )}
                    <button
                        onClick={handleSaveDueDiligence}
                        disabled={ddSaving || !ddSelectedAppId}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {ddSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{ddSaving ? 'Saving...' : 'Save & Analyse'}</span>
                    </button>
                </div>
            </div>

            {ddLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
            ) : !ddSelectedAppId ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Select an application above to enter notes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Site Visit */}
                    <MacWindow title="🏭 Site Visit Observations" className="h-fit">
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    <Factory className="inline w-3.5 h-3.5 mr-1" />Capacity Utilization (On-site Estimate)
                                </label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="range" min={0} max={100} step={5}
                                        value={ddForm.capacityUtilizationPct}
                                        onChange={e => setDdForm({ ...ddForm, capacityUtilizationPct: Number(e.target.value) })}
                                        className="flex-1 accent-indigo-600"
                                    />
                                    <span className={`text-lg font-black w-14 text-center ${ddForm.capacityUtilizationPct >= 70 ? 'text-emerald-600' : ddForm.capacityUtilizationPct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {ddForm.capacityUtilizationPct}%
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    {ddForm.capacityUtilizationPct >= 70 ? '🟢 Strong production activity observed' : ddForm.capacityUtilizationPct >= 50 ? '🟡 Moderate utilization — flag for notes' : '🔴 Low utilization — significant risk signal'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    <Building2 className="inline w-3.5 h-3.5 mr-1" />Site Visit Narrative
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="e.g., Factory found operating at 40% capacity. Machinery appeared outdated. Three of five production lines were idle..."
                                    value={ddForm.siteVisitObservations}
                                    onChange={e => setDdForm({ ...ddForm, siteVisitObservations: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                    </MacWindow>

                    {/* Management Interview */}
                    <MacWindow title="👔 Management Interview" className="h-fit">
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    <Users className="inline w-3.5 h-3.5 mr-1" />Promoter Background Assessment
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['STRONG', 'NEUTRAL', 'CONCERNING'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setDdForm({ ...ddForm, promoterAssessment: opt })}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${ddForm.promoterAssessment === opt
                                                ? opt === 'STRONG' ? 'bg-emerald-500 text-white border-emerald-500'
                                                    : opt === 'NEUTRAL' ? 'bg-indigo-500 text-white border-indigo-500'
                                                        : 'bg-red-500 text-white border-red-500'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {opt === 'STRONG' ? '✅' : opt === 'NEUTRAL' ? '⚪' : '⚠️'} {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Interview Notes</label>
                                <textarea
                                    rows={5}
                                    placeholder="e.g., Management was transparent about revenue slowdown due to sector headwinds. MD has 20+ years experience. CFO previously at Big4..."
                                    value={ddForm.managementInterviewNotes}
                                    onChange={e => setDdForm({ ...ddForm, managementInterviewNotes: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                    </MacWindow>

                    {/* Legal Concerns */}
                    <MacWindow title="⚖️ Legal & Regulatory Concerns" className="h-fit">
                        <div className="p-6">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                <Gavel className="inline w-3.5 h-3.5 mr-1" />Litigation / Regulatory Issues
                            </label>
                            <textarea
                                rows={4}
                                placeholder="e.g., Ongoing dispute with GST dept for FY22 (₹40L). Labour court case filed in 2021, status 'pending'..."
                                value={ddForm.legalConcernsNoted}
                                onChange={e => setDdForm({ ...ddForm, legalConcernsNoted: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                            />
                            <p className="text-xs text-slate-400 mt-2">Leave blank if no legal concerns observed. Any entry triggers a −10 pt assurance penalty.</p>
                        </div>
                    </MacWindow>

                    {/* AI Adjustment Result */}
                    {ddResult?.qualitativeScoreAdjustment != null && (
                        <MacWindow title="🤖 AI Qualitative Assessment" className="h-fit">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score Adjustment</p>
                                        <p className={`text-4xl font-black mt-1 ${ddResult.qualitativeScoreAdjustment > 0 ? 'text-emerald-600' : ddResult.qualitativeScoreAdjustment < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                                            {ddResult.qualitativeScoreAdjustment > 0 ? '+' : ''}{ddResult.qualitativeScoreAdjustment} pts
                                        </p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-sm font-black tracking-wider border ${ddResult.overallSentiment === 'POSITIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        ddResult.overallSentiment === 'NEGATIVE' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>
                                        {ddResult.overallSentiment}
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-slate-500 mb-1">REASONING</p>
                                    <p className="text-sm text-slate-700">{ddResult.adjustmentReason || 'No adjustment factors recorded.'}</p>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-slate-400">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>This adjustment will be incorporated into the final CAM assurance score.</span>
                                </div>
                            </div>
                        </MacWindow>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Top Nav */}
            <div className="w-full flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 shadow-sm z-20">
                <div className="flex items-center space-x-8">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Credit Officer Workspace</h1>
                        <p className="text-sm text-slate-500 font-medium">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                        {TAB_CONFIG.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="Search applications..." className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64" />
                    </div>
                    <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-600">
                        <LogOut className="w-4 h-4" />
                        <span className="font-bold text-sm">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Toast */}
            {toastMsg && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 font-medium text-sm ${toastType === 'error' ? 'bg-red-700 text-white' : 'bg-slate-800 text-white'}`}>
                        {toastType === 'error' ? <AlertCircle className="w-5 h-5 text-red-300" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
                        <span>{toastMsg}</span>
                    </div>
                </div>
            )}

            {/* Main */}
            <main className="flex-1 relative flex overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex-1 overflow-auto p-8 relative z-10">
                    {activeTab === 'queue' && renderQueue()}
                    {activeTab === 'ingest' && renderIngest()}
                    {activeTab === 'diligence' && renderDueDiligence()}
                </div>

                {/* Borrower 360 Slide-out */}
                <div className={`absolute top-0 right-0 w-[520px] h-full bg-white shadow-2xl border-l border-slate-200 z-30 transition-transform duration-500 ${selectedApp ? 'translate-x-0' : 'translate-x-full'}`}>
                    {selectedApp && (
                        <div className="h-full flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-slate-50 to-indigo-50/30">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{selectedApp.id}</span>
                                        <span className={`text-[10px] font-black tracking-widest px-2 py-1 rounded border ${RISK_COLORS[selectedApp.risk]}`}>{selectedApp.risk} RISK</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedApp.companyName}</h2>
                                    <p className="text-sm text-slate-500 mt-1">{selectedApp.industry} · {selectedApp.city}</p>
                                    <p className="text-xs text-slate-400 font-mono mt-1">CIN: {selectedApp.cin}</p>
                                </div>
                                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Parsed Financials */}
                                <div>
                                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest mb-4 flex items-center">
                                        <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />Parsed Financials
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                            <p className="text-xs text-slate-400 font-bold mb-1">Declared Revenue (GST)</p>
                                            <p className="text-lg font-black text-slate-800">{selectedAppGstAvg}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                            <p className="text-xs text-slate-400 font-bold mb-1">Bank Statement Avg</p>
                                            <p className="text-lg font-black text-slate-800">{selectedAppBankAvg}</p>
                                        </div>
                                        {hasCircularFlags ? (
                                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl col-span-2 flex items-start">
                                                <AlertCircle className="w-5 h-5 text-rose-500 mr-3 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-rose-800">Circular Trading Check Triggered</p>
                                                    <p className="text-xs text-rose-600 mt-1">High GSTR-2A vs 3B variance or suspicious looping patterns detected. Requires intense analyst review.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl col-span-2 flex items-start">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-800">Clear Financials Found</p>
                                                    <p className="text-xs text-emerald-600 mt-1">GST vs Bank data aligns within safe tolerances. No circular trading loops detected.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Five Cs Quick View */}
                                <div>
                                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest mb-4 flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-indigo-500" />Five Cs Quick View
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            { c: 'Character', val: selectedAppScore ? `${selectedAppScore.assuranceScore}/100 Confidence` : 'Pending Assessment', color: 'indigo' },
                                            { c: 'Capacity', val: selectedAppGstAvg, color: 'slate' },
                                            { c: 'Capital', val: selectedAppScore ? `Max Loan: ₹ ${(selectedAppScore.recommendedMaxLoan / 1e7).toFixed(1)}Cr` : 'Net Worth: Pending', color: 'slate' },
                                            { c: 'Collateral', val: selectedAppScore ? `Tenor: ${selectedAppScore.recommendedTenorMonths}mo` : 'Asset cover: Unknown', color: 'amber' },
                                            { c: 'Conditions', val: `${selectedApp.industry} · ${selectedApp.city}`, color: 'slate' },
                                        ].map(item => (
                                            <div key={item.c} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg">
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-wider w-24">{item.c}</span>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span className="text-sm font-semibold text-slate-700 flex-1 text-right">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Source Docs */}
                                <div>
                                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest mb-4 flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-indigo-500" />Ingested Documents
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedAppDocs.length === 0 && <p className="text-sm text-slate-500 py-2">No documents ingested for this application.</p>}
                                        {selectedAppDocs.map(doc => (
                                            <div key={doc.id} className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg transition-all">
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mr-3`}>
                                                        {doc.fileName?.split('.').pop()?.toUpperCase() || 'DOC'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-700">{doc.fileName}</span>
                                                        <span className="text-xs text-slate-400 mt-0.5">{doc.type}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Ingested ✓</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-white">
                                <button
                                    onClick={() => {
                                        setActiveTab('diligence');
                                        if (selectedApp) {
                                            const dbApp = dbApplications.find(a => a.cin === selectedApp.cin);
                                            if (dbApp) setDdSelectedAppId(dbApp.id);
                                        }
                                        setSelectedApp(null);
                                    }}
                                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                                >
                                    Open Due Diligence Form →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {selectedApp && (
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-20" onClick={() => setSelectedApp(null)} />
                )}
            </main>

            {/* New Application Modal */}
            {isNewAppModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Add New Application</h3>
                                <p className="text-sm text-slate-500 mt-1">Initialize a new credit underwriting case.</p>
                            </div>
                            <button onClick={() => setIsNewAppModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* 💎 SAMPLE PROFILES ─ Helper for Demo 💎 */}
                        <div className="px-8 py-4 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center">
                                <Sparkles className="w-3 h-3 mr-1" /> Quick Demo Profiles
                            </span>
                            <button
                                type="button"
                                onClick={() => setNewAppForm({
                                    companyName: 'RELIANCE INDUSTRIES LIMITED',
                                    cin: 'L17110MH1973PLC019786',
                                    pan: 'RELI12345A',
                                    gstNumber: '27AAACR1234A1Z1',
                                    industry: 'Manufacturing',
                                    city: 'Mumbai',
                                    turnover: 500000000,
                                    loanType: 'Term Loan',
                                    loanTenure: 60,
                                    loanInterest: 8.5,
                                    requestedAmount: 10000000
                                })}
                                className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                                Reliance Industries (Petro/Mfg)
                            </button>
                        </div>

                        <form onSubmit={handleCreateApp} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Company Legal Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newAppForm.companyName}
                                        onChange={e => setNewAppForm({ ...newAppForm, companyName: e.target.value })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all"
                                        placeholder="e.g. Phoenix Logistics Pvt Ltd"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">CIN Number</label>
                                    <input
                                        required
                                        type="text"
                                        value={newAppForm.cin}
                                        onChange={e => setNewAppForm({ ...newAppForm, cin: e.target.value })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all font-mono"
                                        placeholder="U72900KA2024PTC..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">GST Identification</label>
                                    <input
                                        required
                                        type="text"
                                        value={newAppForm.gstNumber}
                                        onChange={e => setNewAppForm({ ...newAppForm, gstNumber: e.target.value })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all font-mono"
                                        placeholder="29AAACG..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Industry Sector</label>
                                    <select
                                        required
                                        value={newAppForm.industry}
                                        onChange={e => setNewAppForm({ ...newAppForm, industry: e.target.value })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all"
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="IT Services">IT Services</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Pharmaceuticals">Pharmaceuticals</option>
                                        <option value="Agribusiness">Agribusiness</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Renewable Energy">Renewable Energy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Registered City</label>
                                    <input
                                        required
                                        type="text"
                                        value={newAppForm.city}
                                        onChange={e => setNewAppForm({ ...newAppForm, city: e.target.value })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all"
                                        placeholder="e.g. Bengaluru"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">PAN Number</label>
                                    <input
                                        required
                                        type="text"
                                        value={newAppForm.pan}
                                        onChange={e => setNewAppForm({ ...newAppForm, pan: e.target.value })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all font-mono"
                                        placeholder="ABCDE1234F"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Annual Turnover (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        value={newAppForm.turnover || ''}
                                        onChange={e => setNewAppForm({ ...newAppForm, turnover: Number(e.target.value) })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all font-mono"
                                        placeholder="10000000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Loan Type</label>
                                    <select
                                        required
                                        value={newAppForm.loanType}
                                        onChange={e => setNewAppForm({ ...newAppForm, loanType: e.target.value })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all"
                                    >
                                        <option value="">Select Loan Type</option>
                                        <option value="Term Loan">Term Loan</option>
                                        <option value="Working Capital">Working Capital</option>
                                        <option value="Equipment Finance">Equipment Finance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Requested Loan Amount (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        value={newAppForm.requestedAmount || ''}
                                        onChange={e => setNewAppForm({ ...newAppForm, requestedAmount: Number(e.target.value) })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all"
                                        placeholder="5000000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tenure (Months)</label>
                                    <input
                                        required
                                        type="number"
                                        value={newAppForm.loanTenure || ''}
                                        onChange={e => setNewAppForm({ ...newAppForm, loanTenure: Number(e.target.value) })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all"
                                        placeholder="36"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Expected Interest (%)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.1"
                                        value={newAppForm.loanInterest || ''}
                                        onChange={e => setNewAppForm({ ...newAppForm, loanInterest: Number(e.target.value) })}
                                        className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all"
                                        placeholder="10.5"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsNewAppModalOpen(false)}
                                    className="px-8 py-3.5 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-50 rounded-2xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingApp}
                                    className="px-10 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center space-x-2"
                                >
                                    {isCreatingApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    <span>{isCreatingApp ? 'Processing...' : 'Create Case'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
