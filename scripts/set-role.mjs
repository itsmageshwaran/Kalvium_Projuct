import fs from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Load environment variables from .env
const envFile = fs.readFileSync(".env", "utf-8");
const env = {};
envFile.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

initializeApp({
  credential: cert({
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const adminAuth = getAuth();
const adminDb = getFirestore();

const VALID_ROLES = ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"];

async function setUserRole() {
  const args = process.argv.slice(2);
  const email = args[0]?.trim().toLowerCase();
  const role = args[1]?.trim().toUpperCase();

  if (!email || !role) {
    console.log(`
Usage:
  node scripts/set-role.mjs <email> <role>

Valid Roles:
  - STUDENT
  - ORGANIZER
  - CAMPUS_MANAGER

Example:
  node scripts/set-role.mjs your.email@kalvium.com CAMPUS_MANAGER
    `);
    process.exit(1);
  }

  if (!VALID_ROLES.includes(role)) {
    console.error(`❌ Invalid role "${role}". Allowed roles are: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }

  try {
    const user = await adminAuth.getUserByEmail(email);
    console.log(`Found user: ${user.email} (UID: ${user.uid})`);

    // 1. Set Custom Claims in Firebase Auth
    await adminAuth.setCustomUserClaims(user.uid, { role });
    console.log(`✓ Firebase Custom Claims updated to: { role: "${role}" }`);

    // 2. Update Firestore User Document
    await adminDb.collection("users").doc(user.uid).set(
      {
        role,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`✓ Firestore document updated: users/${user.uid} -> role = "${role}"`);

    console.log(`\n🎉 Success! User "${email}" is now a ${role}.`);
    console.log(`(Note: If the user is currently signed in, they should sign out and sign in again to refresh their token claims.)\n`);
  } catch (err) {
    console.error(`❌ Error setting role:`, err.message);
    process.exit(1);
  }
}

setUserRole();
