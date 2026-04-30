import React from 'react';
import { ExternalLink } from 'lucide-react';

const LinkCard = ({ title, description, url, icon, buttonText }) => {
  return (
    <div className="bg-surface border border-border rounded-lg p-md max-w-sm w-full flex flex-col gap-3 group hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <h3 className="font-ui font-bold text-text-primary text-base uppercase tracking-wider">{title}</h3>
      </div>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
      <button 
        onClick={() => window.open(url, '_blank')}
        className="w-full mt-2 bg-surface-bright hover:bg-primary border border-border text-text-primary hover:text-black py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 font-ui text-sm uppercase tracking-wider font-bold"
      >
        {buttonText} <ExternalLink size={16} />
      </button>
    </div>
  );
};

export default LinkCard;
