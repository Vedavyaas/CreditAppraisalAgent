import React from 'react';
import { motion } from 'framer-motion';

interface MacWindowProps {
    title?: string;
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
            className={`glass-panel overflow-hidden flex flex-col p-8 ${className}`}
        >
            {title && (
                <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-6">{title}</h3>
            )}
            {/* Content Area */}
            <div className="flex-1 w-full h-full overflow-auto">
                {children}
            </div>
        </motion.div>
    );
};
