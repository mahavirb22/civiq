import React, { useState } from 'react';
import { Home, MapPin, Users, BookOpen, Bell } from 'lucide-react';
import { useJourneyProgress } from '../../hooks/useJourneyProgress';
import { AnimatePresence, motion } from 'framer-motion';

const TABS = [
  { id: 1, icon: Home, label: 'Register' },
  { id: 2, icon: MapPin, label: 'Booth' },
  { id: 3, icon: Users, label: 'Candidates' },
  { id: 4, icon: BookOpen, label: 'Ballot' },
  { id: 5, icon: Bell, label: 'Reminder' }
];

const MobileTabBar = () => {
  const { currentStep, isStepUnlocked, goToStep } = useJourneyProgress();
  const [toastMsg, setToastMsg] = useState('');

  const handlePress = (stepId) => {
    if (isStepUnlocked(stepId)) {
      goToStep(stepId);
    } else {
      setToastMsg('Complete previous steps first');
      setTimeout(() => setToastMsg(''), 2000);
    }
  };

  return (
    <>
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-surface text-text-primary px-4 py-2 rounded-full font-ui text-sm shadow-xl z-50 border border-border"
          >
             {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="md:hidden bg-surface-app border-t border-border flex justify-around items-center h-16 pb-safe px-2 z-40 relative">
        {TABS.map(tab => {
           const Icon = tab.icon;
           const isActive = (currentStep + 1) === tab.id;
           const isCompleted = isStepUnlocked(tab.id) && !isActive;

           return (
             <button 
               key={tab.id}
               onClick={() => handlePress(tab.id)}
               className="flex flex-col items-center justify-center w-full h-full gap-1 text-text-secondary relative"
             >
               <motion.div animate={{ scale: isActive ? 1.15 : 1 }}>
                 <Icon size={isActive ? 22 : 20} className={isActive ? "text-primary" : ""} />
               </motion.div>
               {isCompleted && (
                 <span className="absolute top-2 right-4 w-2 h-2 bg-primary rounded-full shadow-sm" />
               )}
               {isActive && (
                 <motion.div 
                   layoutId="activeTabIndicator" 
                   className="absolute bottom-1 w-6 h-0.5 bg-primary rounded-full" 
                 />
               )}
             </button>
           );
        })}
      </div>
    </>
  );
};

export default MobileTabBar;
