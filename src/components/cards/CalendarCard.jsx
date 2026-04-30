import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarCard = ({ date, onAdd }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleAdd = async () => {
    setStatus('loading');
    if (onAdd) {
      try {
        const res = await onAdd();
        setStatus(res.success ? 'success' : 'error');
      } catch (e) {
        setStatus('error');
      }
    } else {
      setTimeout(() => setStatus('success'), 1000);
    }
  };

  return (
    <div className="bg-surface border border-border hover:border-amber-500/50 transition-colors rounded-lg p-md max-w-sm w-full relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-surface-app flex border border-border items-center justify-center rounded-md text-amber-500">
          <CalendarIcon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-ui font-bold text-text-primary text-base uppercase tracking-wider mb-1">Election Day</h3>
          <p className="text-text-secondary text-sm">Priority reminder set for {date || 'upcoming'}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.button
          key={status}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          onClick={handleAdd}
          disabled={status === 'loading' || status === 'success'}
          aria-label={
            status === 'idle' ? 'Add election reminder to Google Calendar' :
            status === 'loading' ? 'Adding to calendar...' :
            status === 'success' ? 'Reminder added to Google Calendar' :
            'Retry adding election reminder to Google Calendar'
          }
          className="w-full mt-4 border border-border py-2 px-4 rounded flex items-center justify-center font-ui text-sm uppercase tracking-wider disabled:opacity-50 transition-colors"
          style={{
            backgroundColor: status === 'success' ? '#4ade80' : 'rgba(28, 38, 28, 1)',
            color: status === 'success' ? '#000' : 'white'
          }}
        >
          {status === 'idle' && (
            <>
              <CalendarIcon size={16} className="mr-2" />
              Add to Google Calendar
            </>
          )}
          {status === 'loading' && (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Adding...
            </div>
          )}
          {status === 'success' && (
            <>
              <CheckCircle size={16} className="mr-2" />
              Added!
            </>
          )}
          {status === 'error' && (
            <>
              <AlertTriangle size={16} className="mr-2 text-red-500" />
              Retry Add
            </>
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  );
};

export default CalendarCard;
