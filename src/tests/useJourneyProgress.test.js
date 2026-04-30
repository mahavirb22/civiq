import { renderHook, act } from '@testing-library/react';
import { useJourneyProgress } from '../hooks/useJourneyProgress';

// Mock Firebase
jest.mock('../services/firebaseClient', () => ({
  db: {},
  disableFirestoreSync: jest.fn(),
  doc: jest.fn(),
  ensureFirestoreReady: jest.fn(() => Promise.resolve(true)),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  isFirestoreSyncEnabled: jest.fn(() => true),
  setDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(),
}));

describe('useJourneyProgress hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should initialize with step 1', () => {
    const { result } = renderHook(() => useJourneyProgress());
    expect(result.current.currentStep).toBe(0); // 0-based index for step 1
  });

  test('completeStep(1) should move to currentStep 1 (Step 2)', async () => {
    const { result } = renderHook(() => useJourneyProgress());
    await act(async () => {
      await result.current.completeStep(1);
    });
    expect(result.current.currentStep).toBe(1);
    expect(result.current.completedSteps).toContain(1);
  });

  test('isStepUnlocked(2) should be true after completeStep(1)', async () => {
    const { result } = renderHook(() => useJourneyProgress());
    await act(async () => {
      await result.current.completeStep(1);
    });
    expect(result.current.isStepUnlocked(2)).toBe(true);
  });

  test('goToStep(3) should fail if previous steps aren\'t done', async () => {
    const { result } = renderHook(() => useJourneyProgress());
    act(() => {
      result.current.goToStep(3);
    });
    expect(result.current.currentStep).toBe(0);
  });

  test('goToStep(2) should succeed if step 1 is done', async () => {
    const { result } = renderHook(() => useJourneyProgress());
    await act(async () => {
      await result.current.completeStep(1);
    });
    act(() => {
      result.current.goToStep(2);
    });
    expect(result.current.currentStep).toBe(1);
  });

  test('nextStep() should increment currentStep', () => {
    const { result } = renderHook(() => useJourneyProgress());
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(1);
  });

  test('resetJourney() should clear localStorage and reload', () => {
    delete window.location;
    window.location = { reload: jest.fn() };
    localStorage.setItem('civiq_session_id', 'test-id');
    const { result } = renderHook(() => useJourneyProgress());
    act(() => {
      result.current.resetJourney();
    });
    expect(localStorage.getItem('civiq_session_id')).toBeNull();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
