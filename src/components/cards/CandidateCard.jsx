import React from 'react';
import { ExternalLink } from 'lucide-react';

const CandidateCard = ({ title, snippet, url, source }) => {
  return (
    <div className="bg-surface border border-border rounded-lg p-md max-w-sm w-full flex flex-col gap-3 group hover:border-primary/50 transition-colors relative">
      <div className="flex items-start justify-between">
        <h3 className="font-ui font-bold text-text-primary text-base uppercase tracking-wider">{title || 'Unknown Candidate'}</h3>
      </div>
      
      <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
        {snippet || 'No details available for this candidate.'}
      </p>

      <div className="flex justify-between items-end mt-2">
        <button 
          onClick={() => {
            if (url) window.open(url, '_blank');
          }}
          className="text-primary font-ui text-xs uppercase tracking-widest font-bold hover:underline flex items-center gap-1"
        >
          Read full profile <ExternalLink size={12} />
        </button>
        {source && (
          <span className="bg-surface-app text-text-secondary px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
            {source}
          </span>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
