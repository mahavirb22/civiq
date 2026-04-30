import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XOctagon, Loader2 } from 'lucide-react';
import { useJourneyProgress } from '../hooks/useJourneyProgress';
import {
  db,
  disableFirestoreSync,
  doc,
  ensureFirestoreReady,
  isFirestoreSyncEnabled,
  setDoc,
} from '../services/firebaseClient';

const CSSConfetti = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
       {[...Array(30)].map((_, i) => (
         <div 
           key={i} 
           className="absolute w-2 h-4 mix-blend-screen opacity-0"
           style={{
             backgroundColor: ['#4ade80', '#60a5fa', '#facc15', '#f87171'][Math.floor(Math.random() * 4)],
             left: `${Math.random() * 100}%`,
             top: '-5%',
             animation: `confetti-fall 1.5s ease-in forwards`,
             animationDelay: `${Math.random() * 0.5}s`,
             transform: `rotate(${Math.random() * 360}deg)`
           }}
         />
       ))}
    </div>
  );
};

export const QuizModal = ({ onClose }) => {
  const { sessionId, userState } = useJourneyProgress();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selection, setSelection] = useState(null); // { idx: num, isCorrect: bool }
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const optionsRef = useRef([]);

  // Focus Trap
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    // Focus first option on open
    if (!loading && questions.length > 0 && !finished) {
      optionsRef.current[0]?.focus();
    }
  }, [loading, questions, finished]);

  const handleKeyDown = (e, index) => {
    if (selection !== null) return;
    
    let nextIndex = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      nextIndex = (index + 1) % questions[currentIndex].options.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + questions[currentIndex].options.length) % questions[currentIndex].options.length;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      optionsRef.current[nextIndex]?.focus();
    }
  };

  const handleFocusTrap = (e) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  useEffect(() => {
    // Generate fetching loop
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: userState || "India" })
        });
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [userState]);

  const handleSelect = (idx) => {
    if (selection !== null) return;
    const isCorrect = idx === questions[currentIndex].correctIndex;
    setSelection({ idx, isCorrect });
    if (isCorrect) setScore(s => s + 1);
  };

  const nextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelection(null);
    } else {
      setFinished(true);
      if (sessionId && db && isFirestoreSyncEnabled()) {
        ensureFirestoreReady()
          .then((firestoreReady) => {
            if (!firestoreReady || !isFirestoreSyncEnabled()) {
              return null;
            }

            const ref = doc(db, 'sessions', sessionId);
            return setDoc(
              ref,
              { quizScore: score + (selection?.isCorrect ? 1 : 0), quizAttempts: 1 },
              { merge: true },
            );
          })
          .catch((err) => {
            if (err?.code === 'permission-denied') {
              disableFirestoreSync();
              return;
            }
            console.error('Quiz score sync failed:', err);
          });
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-text-primary gap-4">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
          <p className="font-ui tracking-wider animate-pulse uppercase text-sm font-bold">Generating your personalized quiz...</p>
        </div>
      );
    }

    if (finished) {
      const isPerfect = score > 7;
      const isGood = score > 4;
      return (
        <div className="flex flex-col items-center justify-center h-full text-text-primary text-center px-6 relative">
          <CSSConfetti />
          <p className="font-ui text-sm uppercase tracking-widest text-text-secondary mb-2 relative z-10">Final Score</p>
          <motion.h2 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-editorial font-bold mb-6 text-primary drop-shadow-lg relative z-10"
            aria-label={`Quiz score ${score} out of 10`}
          >
            {score}<span className="text-4xl text-text-secondary" aria-hidden="true">/10</span>
          </motion.h2>

          <p className={`text-xl font-ui font-bold mb-8 relative z-10 ${isPerfect ? 'text-green-400' : isGood ? 'text-blue-400' : 'text-amber-400'}`}>
            {isPerfect ? 'Civic champion! 🏆' : isGood ? 'Good effort! 👍' : 'Keep learning! 📚'}
          </p>

          <button onClick={onClose} className="bg-primary text-black font-ui uppercase tracking-wider font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-transform hover:scale-105 relative z-10">
            Complete
          </button>
        </div>
      );
    }

    const currentQ = questions[currentIndex];

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-ui text-sm uppercase tracking-widest text-text-secondary">Question {currentIndex + 1}/10</h3>
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`h-1.5 w-1.5 rounded-full ${i <= currentIndex ? 'bg-primary' : 'bg-surface'}`} />
            ))}
          </div>
        </div>

        <h2 className="font-editorial text-2xl md:text-3xl text-text-primary mb-8 leading-tight">
          {currentQ?.question}
        </h2>

        <div className="flex flex-col gap-3 flex-1 overflow-y-auto" role="radiogroup" aria-label="Quiz Options">
          {currentQ?.options.map((opt, i) => {
            const isSelected = selection?.idx === i;
            const isCorrectOption = i === currentQ.correctIndex;
            
            let btnClass = "bg-surface border-border text-text-primary hover:border-primary/50";
            if (selection !== null) {
              if (isSelected && selection.isCorrect) btnClass = "bg-green-900 border-green-500 text-white pulse-glow";
              else if (isSelected && !selection.isCorrect) btnClass = "bg-red-900 border-red-500 text-white animate-[shake_0.4s_ease-in-out]";
              else if (isCorrectOption) btnClass = "bg-green-900/40 border-green-500/50 text-white"; // show proper answer
              else btnClass = "bg-surface/50 border-transparent text-text-secondary opacity-50";
            }

            return (
              <button 
                key={i}
                ref={el => optionsRef.current[i] = el}
                role="radio"
                aria-checked={isSelected}
                disabled={selection !== null}
                onClick={() => handleSelect(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(i);
                  } else {
                    handleKeyDown(e, i);
                  }
                }}
                className={`relative border text-left p-4 rounded-lg font-ui text-sm transition-all duration-200 ${btnClass}`}
              >
                {opt}
                {selection !== null && isSelected && selection.isCorrect && <Check className="absolute right-4 top-1/2 -translate-y-1/2" size={18} />}
                {selection !== null && isSelected && !selection.isCorrect && <XOctagon className="absolute right-4 top-1/2 -translate-y-1/2" size={18} />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selection !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded bg-surface border border-border"
            >
              <p className="font-ui text-sm text-text-primary leading-relaxed">
                <span className="font-bold text-primary mr-2">Explanation:</span>
                {currentQ.explanation}
              </p>
              
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={nextQuestion}
                className="w-full mt-4 bg-primary text-black font-bold uppercase tracking-widest text-xs py-3 rounded hover:bg-primary/90"
              >
                Next &rarr;
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
      >
        <motion.div 
          ref={modalRef}
          onKeyDown={handleFocusTrap}
          role="dialog"
          aria-modal="true"
          aria-label="Civic Quiz"
          onKeyDownCapture={(e) => {
            if (e.key === 'Escape') onClose();
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-background border border-border rounded-2xl w-full max-w-lg h-[80vh] md:h-auto md:min-h-[500px] flex flex-col relative overflow-hidden shadow-2xl"
        >
          <button 
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close quiz"
            className="absolute top-4 right-4 text-text-secondary hover:text-white p-2 z-20 transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
          
          <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10 w-full h-full">
             {renderContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

import ErrorBoundary from '../components/ErrorBoundary';

const QuizModalWrapper = (props) => (
  <ErrorBoundary 
    fallbackTitle="Quiz Error" 
    fallbackText="Quiz failed to load. Try again?"
  >
    <QuizModal {...props} />
  </ErrorBoundary>
);

export default QuizModalWrapper;
