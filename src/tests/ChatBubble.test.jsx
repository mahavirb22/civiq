import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatBubble from '../components/chat/ChatBubble';

// Mock TTS service
jest.mock('../../services/tts', () => ({
  speakText: jest.fn(() => Promise.resolve({
    pause: jest.fn(),
    currentTime: 0,
    onended: jest.fn()
  }))
}));

describe('ChatBubble', () => {
  it('renders user message', () => {
    render(<ChatBubble message={{ text: "Hello Civiq", sender: "user" }} />);
    expect(screen.getByText('Hello Civiq')).toBeInTheDocument();
  });

  it('renders bot message with markdown stripped', () => {
    render(<ChatBubble message={{ text: "**Bold Text**", sender: "bot" }} />);
    expect(screen.getByText('Bold Text')).toBeInTheDocument();
  });

  it('shows TTS button for bot messages and allows clicking', () => {
    render(<ChatBubble message={{ text: "TTS Test", sender: "bot" }} />);
    const ttsButton = screen.getByRole('button', { name: /Read this message aloud/i });
    expect(ttsButton).toBeInTheDocument();
    
    // Simulate click
    fireEvent.click(ttsButton);
    // Since it's async, we just ensure it doesn't crash here. 
    // Further testing of TTS state transitions would require act/waitFor.
  });
  
  it('renders loading animation when isLoading is true', () => {
    const { container } = render(<ChatBubble isLoading={true} />);
    expect(screen.getByLabelText('Civiq AI is typing')).toBeInTheDocument();
  });
});
