import React from 'react';
import { motion } from 'framer-motion';

const STEPS_DATA = [
  { icon: '🪪', text: 'Show your Voter ID at the booth' },
  { icon: '✍️', text: 'Sign the register — officer marks your finger with ink' },
  { icon: '🖥️', text: 'Walk to the EVM (Electronic Voting Machine)' },
  { icon: '🔘', text: 'Press the button next to your chosen candidate' },
  { icon: '✅', text: 'VVPAT slip appears for 7 seconds — verify your vote' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const StepVisualCard = ({ onComplete }) => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={() => {
        if (onComplete) setTimeout(onComplete, 500); 
      }}
      className="bg-surface border border-border rounded-lg p-md max-w-sm w-full flex flex-col gap-4 relative overflow-hidden"
    >
      <h3 className="font-editorial text-xl text-text-primary mb-2 hidden md:block border-b border-border pb-2">Inside the Booth</h3>
      
      {STEPS_DATA.map((step, idx) => (
        <motion.div 
          key={idx}
          variants={itemVariants}
          className="flex items-center gap-3 bg-surface-app p-2 rounded-md border border-border/50"
        >
          <div className="w-8 h-8 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-lg">{step.icon}</div>
          <span className="font-ui text-sm text-text-primary leading-tight">{step.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StepVisualCard;
