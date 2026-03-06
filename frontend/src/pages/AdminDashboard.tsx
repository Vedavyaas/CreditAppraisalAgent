import React from 'react';
import { MacWindow } from '../components/MacWindow';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, Server, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col space-y-6">
            <div className="flex justify-between items-center bg-white/30 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 drop-shadow-sm">System Administration</h1>
                        <p className="text-sm text-slate-600 font-medium">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/40 hover:bg-white/60 border border-white/40 rounded-lg shadow-sm transition-all text-slate-700"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-semibold text-sm">Sign Out</span>
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MacWindow title="User Management" className="h-[600px]">
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                        <Users className="w-16 h-16 text-indigo-400 mb-2" />
                        <p className="text-lg font-medium">User Directory Coming Soon</p>
                        <p className="text-sm">Manage Credit Officers, Analysts, and Viewers.</p>
                    </div>
                </MacWindow>

                <MacWindow title="System Health & Stats" className="h-[600px]">
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                        <Server className="w-16 h-16 text-emerald-400 mb-2" />
                        <p className="text-lg font-medium">Health Monitor Coming Soon</p>
                        <p className="text-sm">View overall ingestion rates and error logs.</p>
                    </div>
                </MacWindow>
            </div>
        </div>
    );
};
