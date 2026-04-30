import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * StepSidebar Component
 * Right sidebar showing journey steps. Converts to MobileTabBar in mobile view (though this component manages the desktop sidebar).
 */
const StepSidebar = memo(({ steps = [], currentStepIndex = 0, onStepClick, isStepUnlocked }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 border-l border-border bg-surface p-md sticky top-0 h-screen" role="navigation" aria-label="Journey steps">
      <h3 className="font-editorial text-lg text-text-secondary mb-xl border-b border-border pb-xs">Journey Progress</h3>
      
      <div className="flex flex-col gap-lg relative">
        {/* Connecting line */}
        <div className="absolute left-3 top-4 bottom-8 w-px bg-border -z-10" />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const unlocked = isStepUnlocked ? isStepUnlocked(index) : isCompleted || isCurrent;
          
          return (
            <button 
              key={index} 
              className={`flex gap-md items-start relative z-10 text-left w-full ${unlocked ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-not-allowed opacity-50'}`} 
              aria-current={isCurrent ? "step" : undefined}
              onClick={() => { if (unlocked && onStepClick) onStepClick(index); }}
              disabled={!unlocked}
            >
              <motion.div 
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                  isCompleted ? 'bg-primary border-primary text-black' :
                  isCurrent ? 'bg-surface border-primary box-shadow-glow text-primary' :
                  'bg-surface-app border-border text-border'
                }`}
                initial={false}
                animate={{ scale: isCurrent ? 1.2 : 1 }}
              >
                {isCompleted ? <Check size={12} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
              </motion.div>
              
              <div className="flex flex-col -mt-1">
                <span className={`font-ui text-xs font-bold uppercase tracking-wider mb-1 ${isCurrent || isCompleted ? 'text-primary' : 'text-text-secondary'}`}>
                  Step 0{index + 1}
                </span>
                <span className={`font-editorial ${isCurrent || isCompleted ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {step.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
});

export default StepSidebar;
