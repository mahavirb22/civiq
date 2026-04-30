import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const Landing = () => {
  const navigate = useNavigate();
  const [usState, setUsState] = useState('');
  const [firstVoter, setFirstVoter] = useState(false);

  const handleStart = (e) => {
    e.preventDefault();
    navigate('/journey', { 
      state: { 
        state: usState || 'Delhi', 
        firstVoter 
      } 
    });
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-md relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full text-center z-10 flex flex-col gap-lg"
      >
        <div className="flex flex-col gap-2">
          <span className="font-ui text-primary font-bold tracking-widest uppercase text-xs">Election Night War Room</span>
          <h1 className="font-editorial text-6xl text-text-primary uppercase tracking-tighter">Civiq</h1>
        </div>

        <p className="font-ui text-text-secondary text-lg leading-relaxed">
          Your definitive source for civic duty. Professional, high-tech, and urgent. Enter the war room.
        </p>

        <form onSubmit={handleStart} className="flex flex-col gap-4 text-left font-ui bg-surface-app p-4 rounded-xl border border-border">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-bold text-text-secondary tracking-wider">Your State / Location</label>
            <select 
              value={usState}
              onChange={(e) => setUsState(e.target.value)}
              className="px-3 py-2 bg-surface text-text-primary border border-border focus:border-primary focus:outline-none rounded transition-colors appearance-none cursor-pointer"
              required
            >
              <option value="" disabled>Select your state</option>
              {INDIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="firstVoter" 
              checked={firstVoter}
              onChange={(e) => setFirstVoter(e.target.checked)}
              className="accent-primary w-4 h-4"
            />
            <label htmlFor="firstVoter" className="text-sm text-text-primary mt-1">I am a first-time voter</label>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full mt-2 bg-primary text-black font-ui font-bold px-lg py-md rounded-lg uppercase tracking-widest shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all"
          >
            Begin Journey
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
};

export default Landing;
