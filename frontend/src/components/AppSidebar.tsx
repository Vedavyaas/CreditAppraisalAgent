import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export type SidebarItem = {
    id: string;
    label: string;
    icon: LucideIcon;
};

interface AppSidebarProps {
    items: SidebarItem[];
    activeId: string;
    onSelect: (id: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ items, activeId, onSelect }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 shadow-2xl z-20 relative">

            {/* Branding Area */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight leading-tight">Admin Console</h1>
                        <p className="text-xs text-indigo-300 font-medium tracking-wide uppercase">Pheonix Core</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">System Management</p>
                {items.map((item) => {
                    const isActive = activeId === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                            )}
                            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* User Profile & Logout Bottom Area */}
            <div className="p-4 border-t border-white/10 bg-slate-950/50">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-white truncate">{user?.name}</span>
                        <span className="text-xs text-slate-400 truncate">{user?.email}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 ml-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
