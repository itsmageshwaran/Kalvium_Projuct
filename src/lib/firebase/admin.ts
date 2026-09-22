import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n");

if (!getApps().length) {
  try {
    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      console.warn("Firebase Admin missing credentials. Skipping full initialization (expected during build).");
      initializeApp({
        projectId: projectId || "demo-project",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
      });
    }
  } catch (error: any) {
    console.log("Firebase admin initialization error", error.stack);
  }
}

const adminAuth = getAuth();
const adminDb = getFirestore();
const adminStorage = getStorage();

export { adminAuth, adminDb, adminStorage };
