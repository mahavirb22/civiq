import React from 'react';
import { motion } from 'framer-motion';

/**
 * QuizQuestionCard Component
 * Implements flip or slide animation per prompt.
 */
const QuizQuestionCard = ({ question, options, onAnswer }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, rotateX: 90 }}
      animate={{ opacity: 1, rotateX: 0 }}
      exit={{ opacity: 0, rotateX: -90 }}
      transition={{ duration: 0.4 }}
      className="bg-surface-app border border-border p-md md:p-lg rounded-xl w-full max-w-md mx-auto flex flex-col gap-md"
      style={{ perspective: "1000px" }}
    >
      <h2 className="font-editorial text-2xl text-text-primary leading-tight">
        {question}
      </h2>
      
      <div className="flex flex-col gap-2 mt-4">
        {options.map((opt, i) => (
          <button 
            key={i} 
            onClick={() => onAnswer(opt)}
            className="w-full text-left font-ui text-sm bg-surface border border-border p-3 rounded hover:border-primary hover:bg-surface-bright transition-colors"
          >
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuizQuestionCard;
