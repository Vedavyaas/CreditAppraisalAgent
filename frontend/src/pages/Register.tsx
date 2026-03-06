import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MacWindow } from '../components/MacWindow';
import { authApi } from '../api/authApi';
import { UserPlus, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'CREDIT_OFFICER' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authApi.register(formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <MacWindow title="Create Account" className="w-full max-w-sm shadow-2xl">
                <div className="text-center mb-8 mt-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <UserPlus className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Onboard User</h2>
                </div>

                {success ? (
                    <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl text-center border border-emerald-500/20">
                        Account created successfully! Redirecting...
                    </div>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4 px-2">
                        {error && (
                            <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/20 text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="relative group">
                                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-slate-200 placeholder:text-slate-500 transition-all font-medium"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-slate-200 placeholder:text-slate-500 transition-all font-medium"
                                    placeholder="Email Address"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-slate-200 placeholder:text-slate-500 transition-all font-medium"
                                    placeholder="Password"
                                    required
                                />
                            </div>

                            <div>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-slate-200 transition-all font-medium appearance-none"
                                >
                                    <option value="CREDIT_OFFICER" className="text-slate-900">Credit Officer</option>
                                    <option value="CREDIT_MANAGER" className="text-slate-900">Credit Manager</option>
                                    <option value="ADMIN" className="text-slate-900">System Admin</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center disabled:opacity-50 mt-6"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        </button>

                        <div className="text-center mt-6">
                            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                Already have an account? Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </MacWindow>
        </div>
    );
};
