import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Square, Loader2 } from 'lucide-react';
import { speakText } from '../../services/tts';

/**
 * Strips markdown formatting characters from AI output so they don't
 * appear as raw symbols (**, *, _, ##, etc.) in the chat UI.
 */
const cleanMarkdown = (text = '') =>
  text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')       // *italic* → italic
    .replace(/_{1,2}(.+?)_{1,2}/g, '$1') // _italic_ / __bold__
    .replace(/^#{1,6}\s+/gm, '')       // ## Heading → Heading
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1') // `code` → code
    .trim();

/**
 * ChatBubble Component
 * Fully functional with specific TTS service toggles and fallbacks natively integrated
 */
const ChatBubble = memo(({ message, isLoading }) => {
  const isBot = message?.sender === 'bot' || isLoading;
  const [ttsState, setTtsState] = useState('idle'); // idle | loading | playing
  const [audioObj, setAudioObj] = useState(null);

  const handleTTS = async () => {
    if (ttsState === 'playing' && audioObj) {
      audioObj.pause();
      audioObj.currentTime = 0;
      setTtsState('idle');
      return;
    }

    if (message?.text) {
      setTtsState('loading');
      const audio = await speakText(cleanMarkdown(message.text));
      if (audio) {
        setAudioObj(audio);
        setTtsState('playing');
        audio.onended = () => setTtsState('idle');
      } else {
        // Fallback natively to synthesis if Google fails
        if ('speechSynthesis' in window) {
           setTtsState('playing');
           const synth = new SpeechSynthesisUtterance(cleanMarkdown(message.text));
           synth.onend = () => setTtsState('idle');
           window.speechSynthesis.speak(synth);
        } else {
           setTtsState('idle');
        }
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`flex flex-col w-full ${isBot ? 'items-start' : 'items-end'}`}
        role="article"
        aria-label={isBot ? "Message from Civiq AI" : "Your message"}
      >
        <div 
          className={`max-w-[85%] px-sm py-3 rounded-2xl relative ${
            isBot 
              ? 'bg-surface-app border border-border text-text-primary rounded-tl-sm'
              : 'bg-primary text-black rounded-tr-sm'
          }`}
        >
          {isLoading ? (
            <div className="flex gap-1 py-1 px-2" role="status" aria-label="Civiq AI is typing">
              <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          ) : (
             <p className="font-ui text-sm whitespace-pre-wrap">{cleanMarkdown(message?.text)}</p>
          )}

          {isBot && !isLoading && message && (
            <button 
              onClick={handleTTS}
              aria-label="Read this message aloud"
              aria-pressed={ttsState === 'playing'}
              className={`absolute -right-8 bottom-1 p-1.5 transition-colors rounded-full ${
                ttsState === 'playing' ? 'text-primary' : 'text-text-secondary hover:text-primary'
              }`}
            >
              <span className="sr-only">Read aloud</span>
              <AnimatePresence mode="wait">
                 {ttsState === 'idle' && <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }}><Volume2 size={14} aria-hidden="true" /></motion.div>}
                 {ttsState === 'loading' && <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }}><Loader2 size={14} className="animate-spin" aria-hidden="true" /></motion.div>}
                 {ttsState === 'playing' && <motion.div key="playing" initial={{ scale: 0 }} animate={{ scale: 1 }}><Square size={14} fill="currentColor" aria-hidden="true" /></motion.div>}
              </AnimatePresence>
            </button>
          )}
        </div>
        <span className="text-[10px] text-text-secondary mt-1 font-ui uppercase tracking-widest px-1" aria-hidden="true">
          {isBot ? 'Civiq AI' : 'You'}
        </span>
      </motion.div>
    </AnimatePresence>
  );
});

export default ChatBubble;
