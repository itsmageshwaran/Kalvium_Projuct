import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  let formatted = key.trim();

  // Strip leading and trailing quotes if passed by environment
  if (
    (formatted.startsWith('"') && formatted.endsWith('"')) ||
    (formatted.startsWith("'") && formatted.endsWith("'"))
  ) {
    formatted = formatted.slice(1, -1);
  }

  // Handle literal escaped newlines '\n' -> actual newline
  formatted = formatted.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");

  return formatted;
}

function initAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "campushub-8383";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    `${projectId}.firebasestorage.app`;

  if (clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });
    } catch (certError: any) {
      console.error("[Firebase Admin] Error initializing with cert:", certError.message);
    }
  }

  // Fallback app to prevent module load crash during build time or missing credentials
  console.warn("[Firebase Admin] Initializing fallback app without full credentials.");
  return initializeApp({
    projectId,
    storageBucket,
  });
}

function getAdminAuth(): Auth {
  const app = initAdminApp();
  return getAuth(app);
}

function getAdminDb(): Firestore {
  const app = initAdminApp();
  return getFirestore(app);
}

function getAdminStorage(): Storage {
  const app = initAdminApp();
  return getStorage(app);
}

export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    const instance = getAdminAuth();
    const val = (instance as any)[prop];
    return typeof val === "function" ? val.bind(instance) : val;
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    const instance = getAdminDb();
    const val = (instance as any)[prop];
    return typeof val === "function" ? val.bind(instance) : val;
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_, prop) {
    const instance = getAdminStorage();
    const val = (instance as any)[prop];
    return typeof val === "function" ? val.bind(instance) : val;
  },
});
