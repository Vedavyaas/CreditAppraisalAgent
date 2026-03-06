import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import apiClient from '../api/apiClient';

interface JobStatus {
    jobExecutionId: number;
    jobName: string;
    status: string;
    exitCode: string;
    exitDescription: string;
    startTime: string;
    endTime: string;
}

interface JobStatusTrackerProps {
    activeJobs: number[]; // List of job execution IDs to track
    onJobComplete: (jobExecutionId: number) => void;
}

export const JobStatusTracker: React.FC<JobStatusTrackerProps> = ({ activeJobs, onJobComplete }) => {
    const [jobStatuses, setJobStatuses] = useState<Record<number, JobStatus>>({});

    useEffect(() => {
        if (activeJobs.length === 0) return;

        // Poll status for all tracked jobs every 2 seconds
        const interval = setInterval(() => {
            activeJobs.forEach(async (jobId) => {
                // Skip polling if we already know it finished
                const currentStatus = jobStatuses[jobId]?.status;
                if (currentStatus === 'COMPLETED' || currentStatus === 'FAILED') return;

                try {
                    const response = await apiClient.get(`/ingest/jobs/${jobId}/status`);
                    const statusData: JobStatus = response.data;

                    setJobStatuses(prev => ({ ...prev, [jobId]: statusData }));

                    // Notify parent if job just completed
                    if (statusData.status === 'COMPLETED' || statusData.status === 'FAILED') {
                        onJobComplete(jobId);
                    }
                } catch (error) {
                    console.error(`Failed to poll status for job ${jobId}`, error);
                }
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [activeJobs, jobStatuses, onJobComplete]);

    if (activeJobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Clock className="w-12 h-12 mb-3 opacity-50" />
                <p>No active ingestion jobs.</p>
                <p className="text-sm mt-1">Upload a document to start processing.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-2 h-full overflow-y-auto">
            {activeJobs.map(jobId => {
                const job = jobStatuses[jobId];
                const isPending = !job;
                const isRunning = job?.status === 'STARTED' || job?.status === 'STARTING';
                const isComplete = job?.status === 'COMPLETED';
                const isFailed = job?.status === 'FAILED';

                return (
                    <motion.div
                        key={jobId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border shadow-sm transition-all
              ${isComplete ? 'bg-emerald-50 border-emerald-200' :
                                isFailed ? 'bg-red-50 border-red-200' :
                                    'bg-white border-slate-200'}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                {isPending || isRunning ? (
                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                                ) : isComplete ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                )}

                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        {job ? job.jobName : `Queueing Job #${jobId}`}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-mono mt-1 font-medium">
                                        Job Execution ID: {jobId}
                                    </p>

                                    {isFailed && job?.exitDescription && (
                                        <p className="text-xs text-red-600 mt-2 bg-red-100/50 p-2 rounded">
                                            {job.exitDescription}
                                        </p>
                                    )}
                                    {isComplete && (
                                        <p className="text-xs text-green-600 mt-1 font-medium">Successfully processed and saved to database.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full
                  ${isComplete ? 'bg-green-100 text-green-700' :
                                        isFailed ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'}`}>
                                    {job ? job.status : 'PENDING'}
                                </span>
                            </div>
                        </div>

                        {(isRunning || isPending) && (
                            <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};
