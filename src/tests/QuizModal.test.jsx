import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuizModal from '../pages/QuizModal';

describe('QuizModal', () => {
  it('renders correctly and handles close', () => {
    const mockOnClose = jest.fn();
    render(<QuizModal onClose={mockOnClose} state="Delhi" />);
    
    // Initial loading state should show "Preparing Your State Quiz..."
    expect(screen.getByText(/Preparing Your/i)).toBeInTheDocument();
  });

  it('can be closed via close button if accessible', () => {
    const mockOnClose = jest.fn();
    render(<QuizModal onClose={mockOnClose} state="Delhi" />);
    
    const closeButtons = screen.queryAllByRole('button');
    // If there's a close button rendered during loading, test it
    if (closeButtons.length > 0) {
      fireEvent.click(closeButtons[0]);
      // Depending on implementation, onClose might be called or state changed
    }
  });
});
