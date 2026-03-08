import React, { useState, useEffect } from 'react';
import { MacWindow } from '../components/MacWindow';
import type { SidebarItem } from '../components/AppSidebar';
import { AppSidebar } from '../components/AppSidebar';
import { Users, Shield, Settings, LayoutDashboard, Plus, AlertCircle, History } from 'lucide-react';
import apiClient from '../api/apiClient';

const ROLES = ['ADMIN', 'CREDIT_OFFICER', 'RISK_ANALYST', 'CREDIT_MANAGER', 'COMPLIANCE_OFFICER', 'VIEWER'];

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [employeeStats, setEmployeeStats] = useState<any[]>([]);
    const [dbApps, setDbApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'VIEWER' });
    const [inviteError, setInviteError] = useState('');

    const fetchUsers = React.useCallback(() => {
        setLoading(true);
        apiClient.get('/auth/users')
            .then(res => setUsers(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const fetchAuditLogs = React.useCallback(() => {
        apiClient.get('/audit')
            .then(res => setAuditLogs(res.data))
            .catch(console.error);
    }, []);

    const fetchWorkforceAnalytics = React.useCallback(() => {
        apiClient.get('/admin/workforce-analytics')
            .then(res => setEmployeeStats(res.data))
            .catch(console.error);
    }, []);

    const fetchApps = React.useCallback(() => {
        apiClient.get('/applications')
            .then(res => setDbApps(res.data))
            .catch(console.error);
    }, []);

    // ── Rules Engine (real DB values) ──────────────────────────────────────
    const [loanAmount, setLoanAmount] = React.useState(5000000);
    const [gstVariance, setGstVariance] = React.useState(15);
    const [cibilCheck, setCibilCheck] = React.useState(true);
    const [forceOtp, setForceOtp] = React.useState(false);
    const [savingRules, setSavingRules] = React.useState(false);
    const [rulesSaved, setRulesSaved] = React.useState(false);

    const fetchRules = React.useCallback(() => {
        apiClient.get('/admin/rules').then(res => {
            const r = res.data;
            setLoanAmount(r.maxAutoApprovalLoanAmount ?? 5000000);
            setGstVariance(Math.round((r.gstVarianceThreshold ?? 0.15) * 100));
            setCibilCheck(r.cibilCheckRequired ?? true);
            setForceOtp(r.forceOtpLogin ?? false);
        }).catch(console.error);
    }, []);

    const handleSaveRules = () => {
        setSavingRules(true);
        apiClient.put('/admin/rules', {
            gstVarianceThreshold: gstVariance / 100,
            maxAutoApprovalLoanAmount: loanAmount,
            cibilCheckRequired: cibilCheck,
            forceOtpLogin: forceOtp,
        }).then(() => {
            setSavingRules(false);
            setRulesSaved(true);
            setTimeout(() => setRulesSaved(false), 3000);
        }).catch(err => {
            setSavingRules(false);
            alert('Failed to save rules: ' + (err.response?.data?.message || err.message));
        });
    };


    useEffect(() => {
        fetchUsers();
        fetchAuditLogs();
        fetchRules();
        fetchWorkforceAnalytics();
        fetchApps();
    }, [fetchUsers, fetchAuditLogs, fetchRules, fetchWorkforceAnalytics, fetchApps]);


    const handleRoleChange = (userId: number, newRole: string) => {
        apiClient.put(`/auth/users/${userId}/role?role=${newRole}`)
            .then(() => {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            })
            .catch(err => alert("Failed to change role: " + err.response?.data?.message || err.message));
    };

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/auth/users/invite', inviteForm);
            setInviteModalOpen(false);
            setInviteForm({ name: '', email: '', role: 'VIEWER' });
            fetchUsers();
        } catch (err: any) {
            setInviteError(err.response?.data?.message || "Failed to invite user");
        }
    };

    const sidebarItems: SidebarItem[] = [
        { id: 'users', label: 'User Directory', icon: Users },
        { id: 'analytics', label: 'Workforce Analytics', icon: LayoutDashboard },
        { id: 'audit', label: 'Audit Logs', icon: History },
        { id: 'rules', label: 'Rules Engine', icon: Settings },
        { id: 'assignments', label: 'App Assignments', icon: LayoutDashboard },
    ];

    // ── Derived analytics from real data ──────────────────────────────────────
    const roleGroups = ROLES.reduce((acc: Record<string, number>, role) => {
        acc[role] = users.filter((u: any) => u.role === role).length;
        return acc;
    }, {});
    const maxRoleCount = Math.max(...Object.values(roleGroups), 1);

    const activityByUser = (employeeStats || []).sort((a, b) => b.totalActions - a.totalActions).slice(0, 8);
    const maxActivity = Math.max(...activityByUser.map(u => u.totalActions), 1);

    const ROLE_COLORS: Record<string, string> = {
        ADMIN: '#6366f1', CREDIT_OFFICER: '#0ea5e9', RISK_ANALYST: '#f59e0b',
        CREDIT_MANAGER: '#10b981', COMPLIANCE_OFFICER: '#8b5cf6', VIEWER: '#94a3b8',
    };

    const renderAnalytics = () => (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Workforce Analytics</h2>
                <p className="text-slate-500">Role distribution and activity comparison across all personnel.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Distribution Chart */}
                <MacWindow title="Role Distribution">
                    <div className="p-6 space-y-4">
                        {ROLES.map(role => {
                            const count = roleGroups[role] ?? 0;
                            const pct = Math.round((count / maxRoleCount) * 100);
                            return (
                                <div key={role}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider" style={{ color: ROLE_COLORS[role] }}>{role.replace('_', ' ')}</span>
                                        <span className="text-sm font-black text-slate-700">{count} {count === 1 ? 'person' : 'people'}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3">
                                        <div
                                            className="h-3 rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, backgroundColor: ROLE_COLORS[role] }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        <p className="text-xs text-slate-400 pt-2">Total: {users.length} system users</p>
                    </div>
                </MacWindow>

                {/* Activity Comparison */}
                <MacWindow title="Activity by Employee (Audit Log Actions)">
                    <div className="p-6">
                        {activityByUser.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">No activity data yet — audit logs are empty.</p>
                        ) : (
                            <div className="space-y-3">
                                {activityByUser.map((u, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                                                    style={{ backgroundColor: ROLE_COLORS[u.role] ?? '#94a3b8' }}>
                                                    {u.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{u.name}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase">{u.role?.replace('_', ' ')}</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-700">{u.totalActions}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${Math.round((u.totalActions / maxActivity) * 100)}%`,
                                                    backgroundColor: ROLE_COLORS[u.role] ?? '#94a3b8'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <p className="text-xs text-slate-400 pt-2">Showing top {activityByUser.length} most active users</p>
                            </div>
                        )}
                    </div>
                </MacWindow>

                {/* Summary Cards */}
                {[{
                    label: 'Total Users', val: users.length, sub: `${users.filter((u: any) => !u.suspended).length} active`, color: 'indigo'
                }, {
                    label: 'Suspended', val: users.filter((u: any) => u.suspended).length, sub: 'Locked accounts', color: 'red'
                }, {
                    label: 'Audit Events', val: auditLogs.length, sub: 'System-wide actions', color: 'emerald'
                }, {
                    label: 'Avg Actions/User', val: users.length > 0 ? Math.round(auditLogs.length / users.length) : 0, sub: 'Engagement metric', color: 'amber'
                }].map(stat => (
                    <div key={stat.label} className={`p-5 rounded-2xl border bg-${stat.color}-50 border-${stat.color}-200`}>
                        <p className={`text-xs font-black text-${stat.color}-600 uppercase tracking-wider mb-1`}>{stat.label}</p>
                        <p className={`text-4xl font-black text-${stat.color}-700`}>{stat.val}</p>
                        <p className={`text-xs text-${stat.color}-500 mt-1`}>{stat.sub}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderUserManagement = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">User Directory</h2>
                    <p className="text-slate-500">Manage system access, roles, and suspensions.</p>
                </div>
                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold tracking-wide shadow-sm transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Invite User</span>
                </button>
            </div>

            <MacWindow title="Access Control List" className="h-[650px] flex flex-col">
                <div className="flex-1 overflow-auto p-2">
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-slate-400">Loading directory...</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-xs sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-lg">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u: any) => (
                                    <tr key={u.id} className={`transition-colors hover:bg-slate-50 ${u.suspended ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`font-bold ${u.suspended ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                    {u.name} {u.role === 'ADMIN' && <Shield className="inline w-3 h-3 text-indigo-500 ml-1 mb-0.5" />}
                                                </span>
                                                <span className="text-xs text-slate-500">{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.role === 'ADMIN' ? (
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wider rounded-lg border border-indigo-200">ADMIN</span>
                                            ) : (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                                                >
                                                    {ROLES.filter(r => r !== 'ADMIN').map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {u.suspended
                                                ? <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black tracking-widest rounded">SUSPENDED</span>
                                                : <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest rounded">ACTIVE</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.role !== 'ADMIN' && (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => apiClient.put(`/auth/users/${u.id}/suspend`).then(fetchUsers)}
                                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${u.suspended ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'}`}
                                                    >
                                                        {u.suspended ? 'RESUME' : 'SUSPEND'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Delete ${u.name}?`)) apiClient.delete(`/auth/users/${u.id}`).then(fetchUsers);
                                                        }}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-bold rounded-lg transition-colors"
                                                    >
                                                        DELETE
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </MacWindow>

            {/* Invite Modal Overlay */}
            {inviteModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Invite New User</h3>
                            <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
                            {inviteError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> {inviteError}</div>}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                <input type="text" required value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Jane Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                <input type="email" required value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="jane@pheonix.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Role Assignment</label>
                                <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                                    {ROLES.filter(r => r !== 'ADMIN').map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setInviteModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors">Send Invitation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    const renderAuditLogs = () => (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Audit & Activity Logs</h2>
                    <p className="text-slate-500">Immutable trail of multi-tenant system actions and mutations.</p>
                </div>
                <button onClick={fetchAuditLogs} className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                    Refresh
                </button>
            </div>

            <MacWindow title="System Event Ledger" className="flex-1 flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-auto p-2">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-xs sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-lg">Timestamp</th>
                                <th className="px-6 py-4">User / Subject</th>
                                <th className="px-6 py-4">Action Event</th>
                                <th className="px-6 py-4">Latency</th>
                                <th className="px-6 py-4 text-right rounded-tr-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {auditLogs.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No audit events recorded yet.</td></tr>
                            ) : auditLogs.map((log: any) => (
                                <tr key={log.id} className="transition-colors hover:bg-slate-50">
                                    <td className="px-6 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 font-semibold text-slate-700">
                                        {log.username}
                                    </td>
                                    <td className="px-6 py-3 text-slate-800 text-xs font-medium">
                                        {log.message || log.action}
                                    </td>
                                    <td className="px-6 py-3 text-slate-500 text-xs">
                                        {log.executionTimeMs}ms
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        {log.status === 'SUCCESS'
                                            ? <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest rounded border border-emerald-100">OK</span>
                                            : <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black tracking-widest rounded border border-red-100" title={log.status}>ERROR</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </MacWindow>
        </div>
    );

    const renderRulesEngine = () => (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Rules Engine Configuration</h2>
                    <p className="text-slate-500">Changes persist to DB and affect the next ingestion job and ML decision.</p>
                </div>
                <div className="flex items-center space-x-3">
                    {rulesSaved && (
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl animate-in fade-in">
                            ✓ Saved to database
                        </span>
                    )}
                    <button
                        onClick={handleSaveRules}
                        disabled={savingRules}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                    >
                        {savingRules ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <MacWindow title="Risk Tolerances" className="h-fit">
                    <div className="p-6 space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-slate-700">Max Auto-Approval Loan Amount</label>
                                <span className="text-sm font-bold text-indigo-600">
                                    ₹ {loanAmount.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <input
                                type="range"
                                className="w-full accent-indigo-600"
                                min="100000"
                                max="10000000"
                                step="100000"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(Number(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Applications with ML-recommended loan above this go to MANUAL_REVIEW even if assurance score is OK.</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-slate-700">GST Circular Trading Threshold</label>
                                <span className="text-sm font-bold text-rose-600">{gstVariance}%</span>
                            </div>
                            <input
                                type="range"
                                className="w-full accent-rose-500"
                                min="1"
                                max="50"
                                value={gstVariance}
                                onChange={(e) => setGstVariance(Number(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">GST entries where 3B vs 2A variance exceeds {gstVariance}% will be flagged. Applied to the next batch job run.</p>
                        </div>
                    </div>
                </MacWindow>

                <div className="space-y-4">
                    <MacWindow title="System Flags" className="h-fit">
                        <div className="p-6 space-y-5">
                            <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">Require CIBIL Check</h4>
                                    <p className="text-xs text-slate-500">Enforce hard credit pull before processing.</p>
                                </div>
                                <input type="checkbox" checked={cibilCheck} onChange={(e) => setCibilCheck(e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded" />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">Force OTP on Login</h4>
                                    <p className="text-xs text-slate-500">Global 2FA requirement for all personnel.</p>
                                </div>
                                <input type="checkbox" checked={forceOtp} onChange={(e) => setForceOtp(e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded" />
                            </label>
                        </div>
                    </MacWindow>
                </div>
            </div>
        </div>
    );


    const renderAssignments = () => (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Application Queue Balancing</h2>
                    <p className="text-slate-500">Manually override and re-assign blocked or stale credit applications.</p>
                </div>
            </div>

            <MacWindow title="Active Credit Queue" className="flex-1 flex flex-col min-h-[500px]">
                <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                    <p className="text-sm text-yellow-800 font-medium">Showing active applications in the CRM.</p>
                </div>
                <div className="flex-1 overflow-auto p-2">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-xs sticky top-0">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-lg">App ID</th>
                                <th className="px-6 py-4">Borrower Entity</th>
                                <th className="px-6 py-4">Current Assignee</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right rounded-tr-lg">Reassign To</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dbApps.map((app) => (
                                <tr key={app.id} className="transition-colors hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">APP-{app.id}</td>
                                    <td className="px-6 py-4 font-bold text-slate-700">{app.companyName}</td>
                                    <td className="px-6 py-4 text-slate-500">{app.createdBy}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black tracking-widest rounded border border-amber-200">
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-indigo-500 block w-full p-2"
                                            value={app.createdBy}
                                            onChange={(e) => {
                                                // Minimal implementation: Ideally call an API to reassign user
                                                alert('Reassignment pending implementation for ' + e.target.value);
                                            }}
                                        >
                                            <option value="">Select new owner...</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.email}>{u.name} ({u.role})</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </MacWindow>
        </div>
    );

    return (
        <div className="h-screen flex overflow-hidden bg-slate-50">
            <AppSidebar items={sidebarItems} activeId={activeTab} onSelect={setActiveTab} />

            <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
                {/* Decorative background blur */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-6xl mx-auto h-full">
                    {activeTab === 'users' && renderUserManagement()}
                    {activeTab === 'analytics' && renderAnalytics()}
                    {activeTab === 'audit' && renderAuditLogs()}
                    {activeTab === 'rules' && renderRulesEngine()}
                    {activeTab === 'assignments' && renderAssignments()}
                </div>
            </main>
        </div>
    );
};
