import React from 'react';
import { motion } from 'framer-motion';

/**
 * QuickReplyChips Component
 * Used below input area or quiz to suggest quick automated responses.
 */
const QuickReplyChips = ({ chips = [], onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-xs" role="listbox" aria-label="Suggested quick replies">
      {chips.map((chip, index) => (
        <motion.button
          key={`${chip}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          onClick={() => onSelect(chip)}
          role="option"
          aria-selected="false"
          className="whitespace-nowrap px-sm py-2 rounded-md bg-surface-bright border border-border text-xs font-ui font-bold text-text-primary hover:bg-primary hover:text-black transition-colors uppercase tracking-wider"
        >
          {chip}
        </motion.button>
      ))}
    </div>
  );
};

export default QuickReplyChips;
