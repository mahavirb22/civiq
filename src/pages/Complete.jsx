import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ClipboardCopy, RotateCcw } from 'lucide-react';
import { useJourneyProgress } from '../hooks/useJourneyProgress';
import Navbar from '../components/layout/Navbar';

const CSSConfetti = () => {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]">
         {[...Array(40)].map((_, i) => (
           <div 
             key={i} 
             className="absolute w-2 h-5 mix-blend-screen opacity-0"
             style={{
               backgroundColor: ['#4ade80', '#60a5fa', '#facc15', '#f87171', '#c084fc'][Math.floor(Math.random() * 5)],
               left: `${Math.random() * 100}%`,
               top: '-10%',
               animation: `confetti-fall 1.5s ease-in forwards`,
               animationDelay: `${Math.random() * 0.8}s`,
               transform: `rotate(${Math.random() * 360}deg)`
             }}
           />
         ))}
      </div>
    );
};

const Complete = () => {
    const navigate = useNavigate();
    const { isLoaded, resetJourney, stepData } = useJourneyProgress();
    const [copied, setCopied] = useState(false);

    // Mappings from stepData
    const isReg = stepData[1]?.registrationChecked;
    const boothFound = stepData[2]?.boothFound;
    const boothName = stepData[2]?.boothName || "Assigned Booth";
    const score = 0; // Fetch from state or rely on Journey logic

    const handleShare = () => {
        const text = `I just completed my election journey on Civiq! 🗳️\nBooth found, candidates researched, reminder set.\nGet ready to vote: ${window.location.origin}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (!isLoaded) return <div className="min-h-screen bg-background" />;

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            <Navbar />
            <CSSConfetti />

            <AnimatePresence>
                {copied && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-surface text-primary px-6 py-3 rounded-full font-ui text-sm shadow-xl z-50 border border-primary/50 flex items-center gap-2 font-bold uppercase tracking-wider"
                    >
                         <Check size={16} /> Copied!
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 max-w-4xl mx-auto w-full">
                
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-8"
                >
                    <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <motion.path 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={3} 
                            d="M5 13l4 4L19 7" 
                        />
                    </svg>
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-editorial text-text-primary mb-12">
                    You're ready to vote.
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl text-left mb-12">
                    {[
                        { title: "Registration confirmed", icon: "✓", active: isReg },
                        { title: "Booth: " + boothName, icon: "📍", active: boothFound },
                        { title: "Quiz Completed", icon: "🗳️", active: true },
                        { title: "Reminder Set", icon: "📅", active: stepData[5]?.reminderSet }
                    ].map((item, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className={`p-4 rounded-xl border flex items-center gap-4 ${item.active ? 'bg-surface-app border-border' : 'bg-surface/50 border-border/30 opacity-50'}`}
                        >
                            <span className="text-2xl w-8 text-center">{item.icon}</span>
                            <span className="font-ui text-sm text-text-primary">{item.title}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <button 
                        onClick={handleShare}
                        className="flex-1 bg-primary text-black font-ui uppercase tracking-wider font-bold py-3 rounded hover:bg-primary/90 transition-transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <ClipboardCopy size={16} /> Share Status
                    </button>
                    <button 
                        onClick={() => { resetJourney(); navigate('/'); }}
                        className="flex-1 bg-surface-bright text-text-secondary hover:text-white font-ui uppercase tracking-wider font-bold py-3 rounded border border-border hover:border-text-secondary transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={16} /> Start Over
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Complete;
