import { useState, useCallback } from 'react';
import { geminiService } from '../services/gemini';

/**
 * @typedef {Object} Message
 * @property {string|number} id - Unique identifier for the message
 * @property {string} text - Content of the message
 * @property {'user'|'bot'} sender - The sender entity
 * @property {'user'|'model'|'card'} role - The role for Gemini API context
 * @property {string} [emotion] - Detected emotion (if bot)
 * @property {boolean} [isError] - Flag indicating error state
 */

/**
 * @typedef {Object} UseChatParams
 * @property {string} sessionId - The current unique session identifier
 * @property {number} currentStep - The current numerical step in the journey (1-5)
 * @property {string} state - The user's registered state
 * @property {boolean} firstVoter - Whether the user is a first-time voter
 */

/**
 * Hook to manage Chat state, integrated with custom API + Custom Map Card Injections from UI
 * @param {UseChatParams} params Configuration object for chat initialization
 * @returns {{
 *  messages: Message[],
 *  isLoading: boolean,
 *  emotion: string,
 *  chips: string[],
 *  sendMessage: (text: string) => Promise<void>,
 *  pushMessage: (msgObj: Partial<Message>) => void
 * }}
 */
export const useChat = ({ sessionId, currentStep, state, firstVoter }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emotion, setEmotion] = useState("neutral");
  const [chips, setChips] = useState([]);

  // Allows injecting arbitrary objects into the message map
  const pushMessage = useCallback((msgObj) => {
    setMessages(prev => [...prev, { ...msgObj, id: Date.now() + Math.random() }]);
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Optimistically add user bubble
    const userMsg = { id: Date.now(), text, sender: 'user', role: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setChips([]); // Clear existing chips while loading

    // Build history excluding card blocks
    const history = messages
      .filter(m => m.role !== 'card')
      .map(m => ({
        role: m.sender === 'bot' ? 'model' : 'user',
        text: m.text
      }));

    try {
      const response = await geminiService.sendMessage({
        message: text,
        sessionId,
        step: currentStep,
        state,
        firstVoter,
        history
      });

      // Update state based on backend response
      setEmotion(response.emotion);
      if (response.suggestedChips && response.suggestedChips.length > 0) {
        setChips(response.suggestedChips);
      }

      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          text: response.reply, 
          sender: 'bot', 
          role: 'model',
          emotion: response.emotion 
        }
      ]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          text: "I'm having trouble connecting right now.", 
          sender: 'bot', 
          isError: true 
        }
      ]);
      setEmotion("neutral");
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId, currentStep, state, firstVoter]);

  return {
    messages,
    isLoading,
    emotion,
    chips,
    sendMessage,
    pushMessage
  };
};
