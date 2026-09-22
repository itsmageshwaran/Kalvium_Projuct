import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const envFile = fs.readFileSync('.env', 'utf-8');
const envConfig = envFile.split('\n').reduce((acc, line) => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    acc[key.trim()] = values.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
  return acc;
}, {});

initializeApp({
  credential: cert({
    projectId: envConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: envConfig.FIREBASE_CLIENT_EMAIL,
    privateKey: envConfig.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const adminAuth = getAuth();
const adminDb = getFirestore();

const targetEmail = process.argv[2] || "abc@kalvium.community";

async function deleteTargetUser() {
  try {
    const user = await adminAuth.getUserByEmail(targetEmail);
    await adminAuth.deleteUser(user.uid);
    console.log(`Deleted Firebase Auth user: ${targetEmail} (${user.uid})`);
    await adminDb.collection("users").doc(user.uid).delete();
    console.log(`Deleted Firestore user doc: ${user.uid}`);
  } catch (err) {
    console.log(`User ${targetEmail} not found or error:`, err.message);
  }
}

deleteTargetUser();
