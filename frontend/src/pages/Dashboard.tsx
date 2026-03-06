import React, { useState } from 'react';
import { MacWindow } from '../components/MacWindow';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UploadZone } from '../components/UploadZone';
import { JobStatusTracker } from '../components/JobStatusTracker';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeJobs, setActiveJobs] = useState<number[]>([]);

    // Hardcode applicationId 1 for demo purposes
    const DEMO_APPLICATION_ID = 1;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUploadSuccess = (jobExecutionId: number) => {
        setActiveJobs(prev => [...prev, jobExecutionId]);
    };

    const handleJobComplete = (jobExecutionId: number) => {
        console.log(`Job ${jobExecutionId} finished processing.`);
        // We keep it in the list so the user sees the "SUCCESS" status tick.
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 lg:p-12">
            {/* Sleek MacOS-like global navigation bar */}
            <div className="w-full max-w-6xl flex justify-between items-center bg-white/5 backdrop-blur-2xl px-6 py-4 rounded-2xl border border-white/10 shadow-lg mb-8">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Credit Officer Workspace</h1>
                    <p className="text-sm text-slate-400 font-medium">Welcome back, {user?.name}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 active:bg-white/5 border border-white/10 rounded-xl shadow-sm transition-all text-slate-200"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pb-10">
                <MacWindow title="Intelli-Credit Document Ingestion" className="h-[500px]">
                    <UploadZone
                        applicationId={DEMO_APPLICATION_ID}
                        onUploadSuccess={handleUploadSuccess}
                    />
                </MacWindow>

                <MacWindow title="Active Compute Pipelines" className="h-[500px]">
                    <JobStatusTracker
                        activeJobs={activeJobs}
                        onJobComplete={handleJobComplete}
                    />
                </MacWindow>
            </div>
        </div>
    );
};
