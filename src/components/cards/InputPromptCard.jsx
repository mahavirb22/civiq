import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const InputPromptCard = ({ placeholder, onSubmit }) => {
  const [val, setVal] = useState('');

  const handleRun = (e) => {
    e.preventDefault();
    if (val.trim()) {
      onSubmit(val.trim());
    }
  };

  return (
    <form onSubmit={handleRun} className="flex relative items-center max-w-sm w-full bg-surface-app border border-border rounded-lg overflow-hidden group hover:border-primary/50 transition-colors">
      <input 
        type="text"
        placeholder={placeholder}
        value={val}
        onChange={e => setVal(e.target.value)}
        className="w-full bg-transparent text-text-primary py-3 pl-4 pr-12 font-ui focus:outline-none placeholder:text-text-secondary/50 placeholder:italic"
      />
      <button 
        type="submit"
        disabled={!val.trim()}
        className="absolute right-2 p-1.5 text-text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:hover:text-text-secondary"
      >
        <Send size={18} />
      </button>
    </form>
  );
}

export default InputPromptCard;
