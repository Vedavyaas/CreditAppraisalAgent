import React from 'react';
import { motion } from 'framer-motion';

interface MacWindowProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const MacWindow: React.FC<MacWindowProps> = ({ title, children, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`glass-panel overflow-hidden flex flex-col ${className}`}
        >
            {/* Premium Mac OS Top Bar */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 relative bg-black/20">
                <div className="flex space-x-2 absolute left-4 group cursor-default">
                    <div className="w-3 h-3 rounded-full bg-slate-600 group-hover:bg-[#ff5f56] transition-colors"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-600 group-hover:bg-[#ffbd2e] transition-colors"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-600 group-hover:bg-[#27c93f] transition-colors"></div>
                </div>
                <div className="flex-1 text-center text-xs font-medium tracking-wide text-slate-400">
                    {title}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-transparent">
                {children}
            </div>
        </motion.div>
    );
};
