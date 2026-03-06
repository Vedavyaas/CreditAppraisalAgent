import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

            // Route based on role
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
            <MacWindow title="Sign In" className="w-full max-w-sm shadow-2xl">
                <div className="text-center mb-8 mt-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <KeyRound className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Intelli-Credit</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 px-2">
                    {error && (
                        <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/20 text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-slate-200 placeholder:text-slate-500 transition-all font-medium"
                                placeholder="Email Address"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-slate-200 placeholder:text-slate-500 transition-all font-medium"
                                placeholder="Password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center disabled:opacity-50 mt-6"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    </button>
                </form>
            </MacWindow>
        </div>
    );
};
