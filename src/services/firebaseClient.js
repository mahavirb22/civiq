import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfigStr = import.meta.env.VITE_FIREBASE_CONFIG;

let db = null;
let firestoreSyncEnabled = false;
let firestoreReadyPromise = Promise.resolve(false);

try {
  if (firebaseConfigStr) {
    const config = JSON.parse(firebaseConfigStr);
    const app = initializeApp(config);
    db = getFirestore(app);
    firestoreSyncEnabled = true;

    const auth = getAuth(app);
    firestoreReadyPromise = signInAnonymously(auth)
      .then(() => true)
      .catch(() => {
        firestoreSyncEnabled = false;
        return false;
      });
  } else {
    console.warn("Client Firebase config missing (VITE_FIREBASE_CONFIG)");
  }
} catch (e) {
  console.warn("Error parsing client Firebase config", e);
}

const ensureFirestoreReady = async () => {
  if (!firestoreSyncEnabled) {
    return false;
  }

  try {
    // Add a 5-second timeout to the firestore ready promise
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), 5000));
    return await Promise.race([firestoreReadyPromise, timeoutPromise]);
  } catch {
    firestoreSyncEnabled = false;
    return false;
  }
};

const isFirestoreSyncEnabled = () => firestoreSyncEnabled;

const disableFirestoreSync = () => {
  firestoreSyncEnabled = false;
};

export {
  db,
  disableFirestoreSync,
  doc,
  ensureFirestoreReady,
  getDoc,
  isFirestoreSyncEnabled,
  serverTimestamp,
  setDoc,
};
