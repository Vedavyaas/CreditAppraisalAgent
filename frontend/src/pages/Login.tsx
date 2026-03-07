import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MacWindow } from '../components/MacWindow';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/authApi';
import { KeyRound, Mail, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authApi.login({ email, password });
            login(
                { id: response.userId, email: response.email, name: response.name, role: response.role as any },
                response.token
            );

            if (response.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <MacWindow className="w-full max-w-sm">
                <div className="text-center mb-8 mt-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 mb-4 shadow-sm">
                        <KeyRound className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Credit Appraisal Agent</h2>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Please sign in to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 px-2">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 transition-all font-medium shadow-sm"
                                placeholder="Work Email"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 transition-all font-medium shadow-sm"
                                placeholder="Password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center disabled:opacity-50 mt-6"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                    </button>

                    <div className="text-center mt-6 space-y-2">
                        <p className="text-sm font-medium text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 transition-colors font-semibold">
                                Sign up
                            </Link>
                        </p>
                        <Link to="/forgot-password" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors block">
                            Forgot your password?
                        </Link>
                        <Link to="/demo" className="text-xs font-black text-indigo-500 hover:text-indigo-400 transition-colors block pt-2 uppercase tracking-widest">
                            🚀 View Hackathon Demo Guide
                        </Link>
                    </div>
                </form>

                {/* Hackathon Demo Access */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">Hackathon Demo Access</p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { role: 'Credit Officer', email: 'credit@test.com', color: 'blue' },
                            { role: 'Risk Analyst', email: 'analyst@test.com', color: 'indigo' },
                            { role: 'Credit Manager', email: 'manager@test.com', color: 'violet' },
                            { role: 'Compliance', email: 'compliance@test.com', color: 'rose' },
                            { role: 'Viewer Hub', email: 'viewer@test.com', color: 'slate' },
                            { role: 'System Admin', email: 'admin@test.com', color: 'emerald' },
                        ].map((demo) => (
                            <button
                                key={demo.role}
                                type="button"
                                onClick={() => {
                                    setEmail(demo.email);
                                    setPassword('password');
                                }}
                                className={`p-2.5 rounded-xl border border-${demo.color}-100 bg-${demo.color}-50/50 hover:bg-${demo.color}-50 transition-all text-left group`}
                            >
                                <p className={`text-[10px] font-bold text-${demo.color}-600 uppercase tracking-tight`}>{demo.role}</p>
                                <p className="text-[9px] text-slate-500 font-mono truncate">{demo.email}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </MacWindow>
        </div>
    );
};
