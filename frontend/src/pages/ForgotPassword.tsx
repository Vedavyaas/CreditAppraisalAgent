import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MacWindow } from '../components/MacWindow';
import { authApi } from '../api/authApi';
import { KeyRound, Mail, Loader2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authApi.forgotPassword(email);
            setStep('OTP');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authApi.resetPassword({ email, otp, newPassword });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP or failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <MacWindow className="w-full max-w-sm">
                <div className="text-center mb-8 mt-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-50 border border-purple-100 mb-4 shadow-sm">
                        <KeyRound className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recovery</h2>
                </div>

                {success ? (
                    <div className="space-y-4 px-2">
                        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center border border-emerald-200 font-medium shadow-sm">
                            Check your inbox for reset instructions.
                        </div>
                        <Link to="/login" className="block w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-center font-medium rounded-xl shadow-sm transition-all mt-4 border border-slate-200">
                            Return to Sign In
                        </Link>
                    </div>
                ) : step === 'OTP' ? (
                    <form onSubmit={handleResetPassword} className="space-y-4 px-2">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="text-center mb-4">
                            <p className="text-sm text-slate-500 font-medium">Code sent to {email}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder:text-slate-400 transition-all font-medium shadow-sm text-center tracking-widest text-lg"
                                    placeholder="Enter 6-digit OTP"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder:text-slate-400 transition-all font-medium shadow-sm"
                                    placeholder="New Password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center disabled:opacity-50 mt-6"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                        </button>
                        <div className="text-center mt-4">
                            <button type="button" onClick={() => setStep('EMAIL')} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                                Use a different email
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSendOtp} className="space-y-4 px-2">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder:text-slate-400 transition-all font-medium shadow-sm"
                                placeholder="Account Email"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center disabled:opacity-50 mt-6"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                        </button>

                        <div className="text-center mt-6">
                            <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                                Remember your password? Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </MacWindow>
        </div>
    );
};
