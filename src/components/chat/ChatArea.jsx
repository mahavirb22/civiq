import React, { memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatBubble from './ChatBubble';
import MapCard from '../cards/MapCard';
import CalendarCard from '../cards/CalendarCard';
import CandidateCard from '../cards/CandidateCard';
import LinkCard from '../cards/LinkCard';
import InputPromptCard from '../cards/InputPromptCard';
import StepVisualCard from '../cards/StepVisualCard';

/**
 * ChatArea Component
 * Displays a list of messages including mapped custom Card Types
 */
const ChatArea = memo(({ messages, isLoading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div 
      className="flex-1 overflow-y-auto px-md py-lg flex flex-col gap-6 w-full max-w-3xl mx-auto scrollbar-hide"
      role="log"
      aria-live="polite"
      aria-label="Conversation with Civiq"
    >
      
      {messages.length === 0 && (
        <div className="text-center text-text-secondary font-editorial italic my-auto opacity-50" aria-hidden="true">
          Your journey begins here...
        </div>
      )}

      {messages.map((msg, i) => {
        if (msg.role === 'card') {
          return (
            <motion.div 
              key={msg.id || i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="self-start max-w-[85%]"
            >
              {msg.type === 'map' && <MapCard {...msg.data} />}
              {msg.type === 'calendar' && <CalendarCard {...msg.data} />}
              {msg.type === 'candidate' && <CandidateCard {...msg.data} />}
              {msg.type === 'link' && <LinkCard {...msg.data} />}
              {msg.type === 'inputPrompt' && <InputPromptCard {...msg.data} />}
              {msg.type === 'stepVisual' && <StepVisualCard {...msg.data} />}
            </motion.div>
          );
        }

        return <ChatBubble key={msg.id || i} message={msg} />;
      })}
      
      {isLoading && (
        <ChatBubble isLoading={true} />
      )}

      <div ref={bottomRef} />
    </div>
  );
});

export default ChatArea;
