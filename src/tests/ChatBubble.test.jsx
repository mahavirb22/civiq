import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatBubble from '../components/chat/ChatBubble';

jest.mock('../services/firebaseClient', () => ({
  db: {},
  disableFirestoreSync: jest.fn(),
  ensureFirestoreReady: jest.fn(() => Promise.resolve(true)),
  isFirestoreSyncEnabled: jest.fn(() => true),
}));

jest.mock('../services/tts', () => ({
  speakText: jest.fn(),
}));

describe('ChatBubble Component', () => {
  test('renders user message with correct aria-label', () => {
    const msg = { sender: 'user', text: 'Hello' };
    render(<ChatBubble message={msg} />);
    expect(screen.getByLabelText('Your message')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('renders bot bubble with correct aria-label', () => {
    const msg = { sender: 'bot', text: 'Hi, I am Civiq' };
    render(<ChatBubble message={msg} />);
    expect(screen.getByLabelText('Message from Civiq AI')).toBeInTheDocument();
  });

  test('TTS button is present for bot messages', () => {
    const msg = { sender: 'bot', text: 'Spoken text' };
    render(<ChatBubble message={msg} />);
    const ttsButton = screen.getByLabelText('Read this message aloud');
    expect(ttsButton).toBeInTheDocument();
  });

  test('loading state renders animated dots and no text', () => {
    render(<ChatBubble isLoading={true} />);
    expect(screen.getByLabelText('Civiq AI is typing')).toBeInTheDocument();
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });
});
