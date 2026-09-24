import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Fallback config to prevent fatal client bundle crash if .env is missing/unloaded
const firebaseConfig = {
  apiKey: apiKey && apiKey.trim() !== "" ? apiKey : "AIzaSyDummyKeyForUnconfiguredEnv0000",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "campus-event-hub",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!apiKey && typeof window !== "undefined") {
  console.warn(
    "⚠️ [Firebase Client] NEXT_PUBLIC_FIREBASE_API_KEY is missing. Please ensure your .env or .env.local file has your Firebase project credentials."
  );
}

// Initialize Firebase
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
