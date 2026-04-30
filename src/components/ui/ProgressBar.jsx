import React from 'react';
import { motion } from 'framer-motion';

/**
 * ProgressBar Component
 * Shows progress through the journey or a checklist.
 * Uses Framer Motion for glow.
 */
const ProgressBar = ({ progress = 0, label = "Progress" }) => {
  return (
    <div className="w-full flex items-center gap-xs" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
      {label && <span className="font-ui text-xs font-bold uppercase text-text-secondary w-16">{label}</span>}
      <div className="flex-1 h-3 rounded-full bg-surface-app border border-border relative overflow-hidden">
        <motion.div 
          className="absolute left-0 top-0 h-full bg-primary box-shadow-glow"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="font-ui text-xs font-bold text-text-primary w-8 text-right">{progress}%</span>
    </div>
  );
};

export default ProgressBar;
