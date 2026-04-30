import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuizModal } from '../pages/QuizModal';
import { useJourneyProgress } from '../hooks/useJourneyProgress';

// Mock hook
jest.mock('../hooks/useJourneyProgress');
jest.mock('../services/firebaseClient', () => ({
  db: {},
  disableFirestoreSync: jest.fn(),
  doc: jest.fn(),
  ensureFirestoreReady: jest.fn(() => Promise.resolve(true)),
  setDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  isFirestoreSyncEnabled: jest.fn(() => true),
}));
// Mock fetch
global.fetch = jest.fn();

const mockQuestions = [
  {
    question: "What is an EVM?",
    options: ["Machine", "Paper", "Box", "None"],
    correctIndex: 0,
    explanation: "Electronic Voting Machine"
  }
];

describe('QuizModal Component', () => {
  beforeEach(() => {
    useJourneyProgress.mockReturnValue({
      sessionId: 'test-id',
      userState: 'Delhi'
    });
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    );
  });

  test('renders dialog with aria-modal', async () => {
    render(<QuizModal onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  test('Escape key calls onClose', async () => {
    const onClose = jest.fn();
    render(<QuizModal onClose={onClose} />);
    await waitFor(() => screen.getByRole('dialog'));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('selecting correct answer shows success state', async () => {
    render(<QuizModal onClose={jest.fn()} />);
    await waitFor(() => screen.getByText(mockQuestions[0].question));
    
    const option = screen.getByText(mockQuestions[0].options[0]);
    fireEvent.click(option);
    
    expect(screen.getByText(/Explanation:/)).toBeInTheDocument();
    expect(screen.getByText(mockQuestions[0].explanation)).toBeInTheDocument();
  });
});
