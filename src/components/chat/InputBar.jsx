import React, { useState, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechToText } from '../../hooks/useSpeechToText';

/**
 * InputBar Component
 * Bottom input area with text field and mic button.
 */
const InputBar = ({ onSend, loading }) => {
  const [text, setText] = useState('');
  
  const handleTranscript = (transcript) => {
    if (transcript.trim()) {
      const fullText = text.trim() ? `${text} ${transcript}` : transcript;
      onSend(fullText);
      setText('');
    }
  };



  const { isListening, startListening, stopListening } = useSpeechToText(handleTranscript);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || loading) return;
    onSend(text);
    setText('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="p-sm bg-surface/80 backdrop-blur-md border-t border-border sticky bottom-0 z-40">
      <form 
        onSubmit={handleSend}
        className={`max-w-3xl mx-auto flex items-end gap-2 bg-surface-app border rounded-2xl p-1 transition-all duration-300 ${
          isListening ? 'border-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'border-border focus-within:border-primary/50'
        }`}
      >
        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
          className={`p-3 transition-colors shrink-0 rounded-xl ${
            isListening ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-primary'
          }`}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Mic size={20} aria-hidden="true" />
            </motion.div>
          ) : (
            <Mic size={20} aria-hidden="true" />
          )}
        </button>
        
        <label htmlFor="chat-input" className="sr-only">Ask Civiq</label>
        <textarea
          id="chat-input"
          aria-label="Ask Civiq"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isListening ? "Listening..." : "Ask Civiq..."}
          className="flex-1 bg-transparent border-none focus:ring-0 text-text-primary px-2 py-3 resize-none font-ui h-[44px] max-h-32 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          aria-label="Send message"
          disabled={!text.trim() || loading || isListening}
          className={`p-3 shrink-0 rounded-xl transition-colors ${
            text.trim() && !loading && !isListening ? 'bg-primary text-black' : 'bg-surface text-text-secondary opacity-50'
          }`}
        >
          <Send size={18} className={text.trim() ? "ml-1" : ""} aria-hidden="true" />
        </motion.button>
      </form>
      
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-center text-xs text-primary mt-2 font-medium"
          >
            Recording... Click mic to stop
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InputBar;

