import { renderHook, act, waitFor } from "@testing-library/react";
import { useJourneyProgress } from "../hooks/useJourneyProgress";
import * as firestoreModule from "../services/firebaseClient";

jest.mock("../services/firebaseClient", () => ({
  db: {},
  disableFirestoreSync: jest.fn(),
  doc: jest.fn(),
  ensureFirestoreReady: jest.fn(() => Promise.resolve(true)),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  isFirestoreSyncEnabled: jest.fn(() => true),
  setDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(),
}));

describe("useJourneyProgress hook", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("should load existing session data from firestore", async () => {
    firestoreModule.getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ currentStep: 2, completedSteps: [1, 2], stepData: {} })
    });

    const { result } = renderHook(() => useJourneyProgress());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.currentStep).toBe(2);
      expect(result.current.completedSteps).toEqual([1, 2]);
    });
  });

  test("should handle firestore permission denied on load", async () => {
    firestoreModule.getDoc.mockRejectedValueOnce({ code: "permission-denied" });

    const { result } = renderHook(() => useJourneyProgress());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
      expect(firestoreModule.disableFirestoreSync).toHaveBeenCalled();
    });
  });

  test("completeStep handles permission denied error during sync", async () => {
    firestoreModule.getDoc.mockResolvedValueOnce({ exists: () => false });
    firestoreModule.setDoc.mockRejectedValueOnce({ code: "permission-denied" });

    const { result } = renderHook(() => useJourneyProgress());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.completeStep(1);
    });

    await waitFor(() => {
      expect(firestoreModule.disableFirestoreSync).toHaveBeenCalled();
    });
  });

  test("completeStep skips sync if firestore not ready", async () => {
    firestoreModule.getDoc.mockResolvedValueOnce({ exists: () => false });
    firestoreModule.ensureFirestoreReady.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useJourneyProgress());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.completeStep(1);
    });

    expect(result.current.currentStep).toBe(1);
  });

  test("resetJourney calls reload", () => {
    jest.spyOn(Storage.prototype, 'removeItem');
    const { result } = renderHook(() => useJourneyProgress());
    act(() => {
      result.current.resetJourney();
    });
    expect(localStorage.removeItem).toHaveBeenCalledWith('civiq_session_id');
  });

  test("nextStep() should increment currentStep", () => {
    const { result } = renderHook(() => useJourneyProgress());
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(1);
  });

  test("goToStep(2) should succeed if step 1 is done", async () => {
    const { result } = renderHook(() => useJourneyProgress());
    await act(async () => {
      await result.current.completeStep(1);
    });
    act(() => {
      result.current.goToStep(2);
    });
    expect(result.current.currentStep).toBe(1);
  });

  test("goToStep(3) should fail if previous steps aren't done", async () => {
    const { result } = renderHook(() => useJourneyProgress());
    act(() => {
      result.current.goToStep(3);
    });
    expect(result.current.currentStep).toBe(0);
  });

  test("isStepUnlocked(2) should be true after completeStep(1)", async () => {
    const { result } = renderHook(() => useJourneyProgress());
    await act(async () => {
      await result.current.completeStep(1);
    });
    expect(result.current.isStepUnlocked(2)).toBe(true);
  });
});
