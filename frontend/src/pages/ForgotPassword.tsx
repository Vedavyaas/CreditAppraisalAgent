import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MacWindow } from '../components/MacWindow';
import { authApi } from '../api/authApi';
import { KeyRound, Mail, Loader2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authApi.forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <MacWindow title="Password Reset" className="w-full max-w-sm shadow-2xl">
                <div className="text-center mb-8 mt-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <KeyRound className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Recovery</h2>
                </div>

                {success ? (
                    <div className="space-y-4 px-2">
                        <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl text-center border border-emerald-500/20">
                            Check your inbox for reset instructions.
                        </div>
                        <Link to="/login" className="block w-full py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 text-center font-medium rounded-xl shadow-lg shadow-black/20 transition-all mt-4 border border-white/5">
                            Return to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4 px-2">
                        {error && (
                            <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/20 text-center">
                                {error}
                            </div>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-slate-200 placeholder:text-slate-500 transition-all font-medium"
                                placeholder="Account Email"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center disabled:opacity-50 mt-6"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                        </button>

                        <div className="text-center mt-6">
                            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                Remember your password? Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </MacWindow>
        </div>
    );
};
