import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();

let db;

try {
  // If FIREBASE_PRIVATE_KEY exists in env, initialize admin app
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace literal \n with actual newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    initializeApp({
      credential: cert(serviceAccount)
    });
    
    db = getFirestore();
    console.log("Firebase Admin Initialized successfully.");
  } else {
    console.warn("Firebase Admin missing credentials in .env! Firestore writes will fail safely.");
  }
} catch (e) {
  console.error("Firebase Admin Initialization Error:", e);
}

export { db };
