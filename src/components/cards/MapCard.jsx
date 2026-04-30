import React from 'react';
import { ExternalLink, Navigation } from 'lucide-react';

const MapCard = ({ name, address, distance, mapsUrl, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-md max-w-sm w-full flex flex-col gap-4 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-surface-app rounded-md" />
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="h-4 bg-surface-app rounded w-3/4" />
            <div className="h-3 bg-surface-app rounded w-1/2" />
          </div>
        </div>
        <div className="h-10 bg-surface-app rounded-md w-full mt-2" />
      </div>
    );
  }

  return (
    <div
      className="bg-surface border border-border rounded-lg p-md max-w-sm w-full relative overflow-hidden group hover:border-primary/50 transition-colors"
      aria-label="Polling booth location card"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-ui font-bold text-text-primary text-base uppercase tracking-wider">{name || 'Designated Booth'}</h3>
          <p className="text-text-secondary text-sm mt-1">{address || 'Location assigned'}</p>
        </div>
        {distance && (
          <div className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold font-ui">
            {distance}
          </div>
        )}
      </div>

      <button 
        onClick={() => {
          if (mapsUrl) {
            window.open(mapsUrl, '_blank');
          }
        }}
        aria-label={`Open ${name || 'polling booth'} in Google Maps`}
        className="w-full mt-2 bg-surface-bright hover:bg-surface-app border border-border text-text-primary py-2 px-4 rounded transition-colors flex items-center gap-2 justify-center font-ui text-sm uppercase tracking-wider group-hover:text-primary group-hover:border-primary/50"
      >
        <Navigation size={16} aria-hidden="true" />
        Open in Maps
      </button>
    </div>
  );
};

export default MapCard;
