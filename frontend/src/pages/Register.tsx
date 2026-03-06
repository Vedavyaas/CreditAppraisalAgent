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
            <MacWindow className="w-full max-w-sm">
                <div className="text-center mb-8 mt-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 mb-4 shadow-sm">
                        <UserPlus className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Credit Appraisal Agent</h2>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Create a new agent account</p>
                </div>

                {success ? (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center border border-emerald-200 font-medium shadow-sm">
                        Account created successfully! Redirecting...
                    </div>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4 px-2">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="relative group">
                                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 placeholder:text-slate-400 transition-all font-medium shadow-sm"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 placeholder:text-slate-400 transition-all font-medium shadow-sm"
                                    placeholder="Work Email"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 placeholder:text-slate-400 transition-all font-medium shadow-sm"
                                    placeholder="Password"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 transition-all font-medium appearance-none shadow-sm cursor-pointer"
                                >
                                    <option value="CREDIT_OFFICER">Credit Officer</option>
                                    <option value="CREDIT_MANAGER">Credit Manager</option>
                                    <option value="ADMIN">System Admin</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center disabled:opacity-50 mt-6"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-sm font-medium text-slate-500">
                                Already have an account?{' '}
                                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 transition-colors font-semibold">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                )}
            </MacWindow>
        </div>
    );
};
