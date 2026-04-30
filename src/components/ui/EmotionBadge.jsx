import React from 'react';
import { motion } from 'framer-motion';

const EMOTIONS = {
  confused: { color: '#fbbf24', text: 'text-black' },
  skeptical: { color: '#f87171', text: 'text-black' },
  engaged: { color: '#4ade80', text: 'text-black' },
  neutral: { color: '#94a3b8', text: 'text-black' },
};

/**
 * EmotionBadge Component
 * Dynamic background color based on emotion prop.
 */
const EmotionBadge = ({ emoji, text, active = false, onClick, emotion }) => {
  
  // Use passed emotion string to get colors, default to neutral if undefined or not active
  const mappedStyle = (active && emotion && EMOTIONS[emotion]) 
    ? EMOTIONS[emotion] 
    : { color: 'transparent', text: active ? 'text-primary' : 'text-text-secondary' };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layoutId={`badge-${text}`}
      animate={{ 
        backgroundColor: mappedStyle.color,
        borderColor: active ? mappedStyle.color : 'rgba(28, 38, 28, 1)' 
      }}
      transition={{ duration: 0.6 }}
      onClick={onClick}
      aria-label={`Current mode: ${text}`}
      aria-pressed={active}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-ui font-bold uppercase transition-colors ${
        active 
          ? mappedStyle.text
          : 'bg-surface-app border-border hover:border-primary/50'
      }`}
    >
      <span className="text-base" aria-hidden="true">{emoji}</span>
      <span>{text}</span>
    </motion.button>
  );
};

export default EmotionBadge;
