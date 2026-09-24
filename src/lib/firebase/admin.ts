import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

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

  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
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

const proxyHandler = {
  get(target: any, prop: string | symbol) {
    // Prevent module bundler/loader checks from prematurely triggering Firebase initialization
    if (
      prop === "then" ||
      prop === "__esModule" ||
      prop === "default" ||
      typeof prop === "symbol"
    ) {
      return target[prop];
    }
    const instance = target.__getInstance ? target.__getInstance() : null;
    if (!instance) return undefined;
    const val = instance[prop];
    return typeof val === "function" ? val.bind(instance) : val;
  },
};

export const adminAuth = new Proxy(
  { __getInstance: getAdminAuth } as any,
  proxyHandler
) as Auth;

export const adminDb = new Proxy(
  { __getInstance: getAdminDb } as any,
  proxyHandler
) as Firestore;

export const adminStorage = new Proxy(
  { __getInstance: getAdminStorage } as any,
  proxyHandler
) as Storage;
