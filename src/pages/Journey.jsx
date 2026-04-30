import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import MobileTabBar from '../components/layout/MobileTabBar';
import StepSidebar from '../components/ui/StepSidebar';
import ChatArea from '../components/chat/ChatArea';
import InputBar from '../components/chat/InputBar';
import QuickReplyChips from '../components/ui/QuickReplyChips';
import ProgressBar from '../components/ui/ProgressBar';
import EmotionBadge from '../components/ui/EmotionBadge';
import LoadingScreen from '../components/LoadingScreen';
import { useChat } from '../hooks/useChat';
import { useJourneyProgress } from '../hooks/useJourneyProgress';
import QuizModal from './QuizModal';
import { findNearbyBooth, findNearbyBoothByPincode } from '../services/maps';
import { addElectionReminder } from '../services/calendar';
import { searchCandidates } from '../services/search';

const STEPS = [
  { title: "Voter Registration" },
  { title: "Find Polling Place" },
  { title: "Know Your Candidates" },
  { title: "Understand Ballot" },
  { title: "Set Reminder" }
];

export default function Journey() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showQuiz, setShowQuiz] = useState(false);
  const stepTriggered = useRef({});

  const stateVal = location.state?.state || 'Unknown';
  const firstVoterVal = location.state?.firstVoter || false;

  const { 
    currentStep, 
    sessionId, 
    isLoaded, 
    completeStep,
    goToStep,
    isStepUnlocked
  } = useJourneyProgress();

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  const { messages, isLoading, emotion, chips, sendMessage, pushMessage } = useChat({
    sessionId: sessionId || 'temp', // ensure string until loaded
    currentStep: currentStep + 1,
    state: stateVal,
    firstVoter: firstVoterVal
  });

  // Handle Automatic Step Injections
  useEffect(() => {
    if (!isLoaded || !sessionId) return;
    if (stepTriggered.current[currentStep]) return;
    stepTriggered.current[currentStep] = true;

    // Helper to push bot message quickly
    const botSay = (text) => pushMessage({ role: 'model', sender: 'bot', text });

    if (currentStep === 0) { // Step 1: Registration
      botSay("Let's start with the most important thing — making sure you're registered to vote!\nYour voter ID (EPIC card) is your key. Here's how to check your registration status:");
      setTimeout(() => {
        pushMessage({ 
          role: 'card', 
          type: 'link', 
          data: {
            title: "Check Voter Registration",
            description: "Official Election Commission portal — verify your EPIC card status",
            url: "https://electoralsearch.eci.gov.in",
            icon: "🗳️",
            buttonText: "Check now →"
          }
        });
      }, 500);
    }

    if (currentStep === 1) { // Step 2: Location
      botSay("Great! Now let's find exactly where you need to go on election day.");
      setTimeout(() => {
        pushMessage({ role: 'card', type: 'map', data: { isLoading: true } });
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const booth = await findNearbyBooth(pos.coords.latitude, pos.coords.longitude);
              pushMessage({ role: 'card', type: 'map', data: { ...booth } });
              completeStep(2, { boothFound: true, boothName: booth.name, boothAddress: booth.address });
            },
            () => botSay("Location denied. Please type your pincode below to fetch your polling booth.")
          );
        }
      }, 500);
    }

    if (currentStep === 2) { // Step 3: Candidates
      botSay("Knowing who you're voting for is just as important as voting itself.");
      setTimeout(() => {
         pushMessage({ 
           role: 'card', 
           type: 'inputPrompt',
           data: {
             placeholder: "Enter constituency e.g. Pune, Nashik...",
             onSubmit: async (val) => {
                const candidates = await searchCandidates(stateVal, val);
                candidates.forEach((cData, idx) => {
                  setTimeout(() => pushMessage({ role: 'card', type: 'candidate', data: cData }), 200 * idx);
                });
                setTimeout(() => completeStep(3, { constituency: val, candidatesLoaded: true }), candidates.length * 200 + 500);
             }
           }
         });
      }, 500);
    }

    if (currentStep === 3) { // Step 4: Ballot
      botSay("Let me walk you through exactly what happens inside the voting booth.");
      setTimeout(() => {
        pushMessage({ 
          role: 'card', 
          type: 'stepVisual',
          data: {
            onComplete: () => completeStep(4, { ballotUnderstood: true })
          }
        });
      }, 500);
    }

    if (currentStep === 4) { // Step 5: Reminder
      botSay("Last step! Let's make sure you actually show up on election day.");
      setTimeout(() => {
        pushMessage({ 
          role: 'card', 
          type: 'calendar', 
          data: { 
            date: stateVal, 
            onAdd: async () => {
              const res = await addElectionReminder(stateVal);
              if (res.success) {
                completeStep(5, { reminderSet: true });
                const confettiEl = document.createElement('div');
                confettiEl.className = 'confetti-burst';
                document.body.appendChild(confettiEl);
                setTimeout(() => navigate('/complete'), 1500);
              }
              return res;
            } 
          } 
        });
      }, 500);
    }

  }, [currentStep, isLoaded, sessionId, stateVal, completeStep, pushMessage, navigate]);

  const handleSend = async (text) => {
    if (text === "I'm registered ✓") {
      completeStep(1, { registrationChecked: true });
    } else if (text === "Next step →") {
      completeStep(currentStep + 1);
    } else if (text === "I'm ready! Next →") {
      completeStep(4);
    }

    if (text.toLowerCase().includes('quiz')) setShowQuiz(true);
    if (text.toLowerCase().includes('done')) navigate('/complete');

    if (currentStep === 1 && text.length === 6 && !isNaN(Number(text))) {
      const booth = await findNearbyBoothByPincode(text);
      if (!booth.error) {
         pushMessage({ role: 'card', type: 'map', data: booth });
         completeStep(2, { boothFound: true, boothName: booth.name, boothAddress: booth.address });
      }
    }

    sendMessage(text);
  };

  let manualChips = chips;
  if (!isLoading && manualChips.length === 0) {
    if (currentStep === 0) manualChips = ["I'm registered ✓", "I need to register", "What is EPIC card?"];
    if (currentStep === 1) manualChips = ["Get directions", "Save this location", "Next step →"];
    if (currentStep === 2) manualChips = ["Tell me more about voting", "What is NOTA?", "Next step →"];
    if (currentStep === 3) manualChips = ["What is NOTA?", "What if EVM fails?", "I'm ready! Next →"];
  }

  // Always ensure "I'm registered ✓" is available during Step 1 so users can advance
  if (!isLoading && currentStep === 0 && !manualChips.includes("I'm registered ✓")) {
    manualChips = ["I'm registered ✓", ...manualChips];
  }

  if (!isLoaded || !sessionId) return <LoadingScreen />;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <StepSidebar 
          steps={STEPS} 
          currentStepIndex={currentStep} 
          onStepClick={(idx) => goToStep(idx + 1)}
          isStepUnlocked={(idx) => isLoaded && isStepUnlocked(idx + 1)}
        />
        <main className="flex-1 flex flex-col relative overflow-hidden" role="main" aria-label="Current Journey Step">
          <div className="p-sm md:p-md border-b border-border bg-surface sticky top-0 z-10 flex flex-col gap-3">
            <div className="flex justify-between items-center w-full">
              <h2 className="font-editorial text-2xl text-text-primary" tabIndex="0">
                {STEPS[currentStep]?.title || "Journey"}
              </h2>
              <EmotionBadge 
                emoji="🧠" 
                text={emotion.charAt(0).toUpperCase() + emotion.slice(1)} 
                active={true} 
                emotion={emotion} 
              />
            </div>
            <ProgressBar progress={progressPercent} label="Progress" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 overflow-hidden flex flex-col relative h-full"
            >
              <ChatArea messages={messages} isLoading={isLoading} />
            </motion.div>
          </AnimatePresence>
          
          <div className="bg-surface pb-safe md:pb-0 z-30 relative">
            <div className="px-sm pb-1 max-w-3xl mx-auto border-t border-border/10 pt-2">
              {manualChips.length > 0 && (
                <QuickReplyChips 
                  chips={manualChips} 
                  onSelect={(reply) => handleSend(reply)} 
                />
              )}
            </div>
            <InputBar onSend={handleSend} loading={isLoading} />
          </div>
        </main>
      </div>
      <MobileTabBar />
      {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} />}
    </div>
  );
}
