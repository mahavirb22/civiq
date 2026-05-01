import { useState, useEffect, useCallback } from "react";
import {
  db,
  disableFirestoreSync,
  doc,
  ensureFirestoreReady,
  setDoc,
  getDoc,
  isFirestoreSyncEnabled,
  serverTimestamp,
} from "../services/firebaseClient.js";
import { v4 as uuidv4 } from "uuid";

const INITIAL_STATE = {
  currentStep: 0, // 0-based for internal array indices (0-4 mapping to 1-5 logic)
  completedSteps: [],
  stepData: {
    1: { registrationChecked: false },
    2: { boothFound: false, boothName: "", boothAddress: "" },
    3: { constituency: "", candidatesLoaded: false },
    4: { ballotUnderstood: false },
    5: { reminderSet: false },
  },
  sessionId: "",
  userName: "",
  userState: "",
  firstVoter: false,
  confidence: 0,
};

/**
 * @typedef {Object} JourneyState
 * @property {number} currentStep - 0-based index of the current active step
 * @property {number[]} completedSteps - Array of completed 1-based step indices
 * @property {Object} stepData - Custom data payload accumulated at each step
 * @property {string} sessionId - Unique persistent session UUID
 * @property {string} userName - User's display name
 * @property {string} userState - User's selected Indian state
 * @property {boolean} firstVoter - Flag if user is voting for first time
 * @property {number} confidence - Rating 1-5 of voter readiness
 */

/**
 * Hook to manage Journey Progression, syncing automatically with Firestore.
 * @returns {JourneyState & {
 *  isLoaded: boolean,
 *  completeStep: (stepNumber: number, data?: Object) => Promise<void>,
 *  goToStep: (stepNumber: number) => void,
 *  isStepUnlocked: (stepNumber: number) => boolean,
 *  resetJourney: () => void,
 *  nextStep: () => void
 * }}
 */
export const useJourneyProgress = () => {
  const [journeyState, setJourneyState] = useState(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initJourney = async () => {
      try {
        let sId = localStorage.getItem("civiq_session_id");
        if (!sId) {
          sId = uuidv4();
          localStorage.setItem("civiq_session_id", sId);
        }

        setJourneyState((prev) => ({ ...prev, sessionId: sId }));

        const firestoreReady = await ensureFirestoreReady();

        if (db && firestoreReady) {
          try {
            const sessionRef = doc(db, "sessions", sId);
            const snap = await getDoc(sessionRef);
            if (snap.exists()) {
              const data = snap.data();
              setJourneyState((prev) => ({
                ...prev,
                currentStep:
                  data.currentStep !== undefined
                    ? data.currentStep
                    : prev.currentStep,
                completedSteps: data.completedSteps || prev.completedSteps,
                stepData: data.stepData || prev.stepData,
              }));
            }
          } catch (e) {
            if (e?.code === "permission-denied") {
              disableFirestoreSync();
            } else {
              console.error("Firestore hydration error:", e);
            }
          }
        }
      } catch (err) {
        console.error("Journey initialization error:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    initJourney();
  }, []);

  const completeStep = useCallback(async (stepNumber, data = {}) => {
    setJourneyState((prev) => {
      const internalStepIndex = stepNumber - 1;
      const nextStepIndex = Math.min(internalStepIndex + 1, 4);

      const newCompleted = [...prev.completedSteps];
      if (!newCompleted.includes(stepNumber)) {
        newCompleted.push(stepNumber);
      }

      const newState = {
        ...prev,
        currentStep: nextStepIndex,
        completedSteps: newCompleted,
        stepData: {
          ...prev.stepData,
          [stepNumber]: { ...prev.stepData[stepNumber], ...data },
        },
      };

      // Sync Firestore async without blocking logic
      if (db && prev.sessionId && isFirestoreSyncEnabled()) {
        ensureFirestoreReady()
          .then((firestoreReady) => {
            if (!firestoreReady || !isFirestoreSyncEnabled()) {
              return null;
            }

            const sessionRef = doc(db, "sessions", prev.sessionId);
            return setDoc(
              sessionRef,
              {
                currentStep: newState.currentStep,
                completedSteps: newState.completedSteps,
                stepData: newState.stepData,
                lastActive: serverTimestamp(),
              },
              { merge: true },
            );
          })
          .catch((e) => {
            if (e?.code === "permission-denied") {
              disableFirestoreSync();
              return;
            }
            console.error("Firestore update fail:", e);
          });
      }

      return newState;
    });
  }, []);

  const goToStep = useCallback((stepNumber) => {
    const internalStepIndex = stepNumber - 1;
    setJourneyState((prev) => {
      // Allow going to already completed steps or the next immediately available logical step (length representing next available 0-base index)
      if (
        prev.completedSteps.includes(stepNumber) ||
        prev.completedSteps.length >= internalStepIndex
      ) {
        return { ...prev, currentStep: internalStepIndex };
      }
      return prev;
    });
  }, []);

  const isStepUnlocked = useCallback(
    (stepNumber) => {
      const internalStepIndex = stepNumber - 1;
      return (
        journeyState.completedSteps.includes(stepNumber) ||
        journeyState.completedSteps.length >= internalStepIndex
      );
    },
    [journeyState.completedSteps],
  );

  const resetJourney = useCallback(() => {
    localStorage.removeItem("civiq_session_id");
    try {
      window.location.reload();
    } catch {
      // jsdom does not implement navigation reload; ignore in tests.
    }
  }, []);

  // Backwards compatibility alias for Journey UI bindings
  const nextStep = useCallback(() => {
    setJourneyState((prev) => {
      const nxt = Math.min(prev.currentStep + 1, 4);
      return { ...prev, currentStep: nxt };
    });
  }, []);

  return {
    ...journeyState,
    isLoaded,
    completeStep,
    goToStep,
    isStepUnlocked,
    resetJourney,
    nextStep, // for simple generic bindings
  };
};
