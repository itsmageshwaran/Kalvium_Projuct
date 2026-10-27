import fs from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Load .env
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

const DEMO_USERS = [
  {
    name: "Siva Subramaniyan",
    email: "siva.subramaniyan@kalvium.com",
    password: process.env.MANAGER_PASSWORD || undefined,
    role: "CAMPUS_MANAGER",
  },
  {
    name: "Robotics & AI Society",
    email: "organizer@kalvium.community",
    password: process.env.ORGANIZER_PASSWORD || "Organizer@12345",
    role: "ORGANIZER",
  },
  {
    name: "Alex Johnson",
    email: "student@kalvium.community",
    password: process.env.STUDENT_PASSWORD || "Student@12345",
    role: "STUDENT",
  },
];

async function provisionUser(demoUser) {
  let uid = null;
  try {
    const existing = await adminAuth.getUserByEmail(demoUser.email);
    uid = existing.uid;
    console.log(`- Existing auth account found for ${demoUser.email} (UID: ${uid})`);
    const updatePayload = {
      displayName: demoUser.name,
    };
    if (demoUser.password) {
      updatePayload.password = demoUser.password;
    }
    await adminAuth.updateUser(uid, updatePayload);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      const created = await adminAuth.createUser({
        email: demoUser.email,
        password: demoUser.password,
        displayName: demoUser.name,
      });
      uid = created.uid;
      console.log(`- Created new Firebase Auth account for ${demoUser.email} (UID: ${uid})`);
    } else {
      throw err;
    }
  }

  // Set Custom Claims
  await adminAuth.setCustomUserClaims(uid, { role: demoUser.role });

  // Set Firestore Document
  await adminDb.collection("users").doc(uid).set(
    {
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role,
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(demoUser.email)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(`  ✓ Claim and Firestore profile synchronized: Role = ${demoUser.role}`);
  return { ...demoUser, uid };
}

async function seedRoles() {
  console.log("==================================================");
  console.log("🌱 PROVISIONING CAMPUS EVENT HUB ROLES");
  console.log("==================================================\n");

  const results = [];
  for (const user of DEMO_USERS) {
    const res = await provisionUser(user);
    results.push(res);
  }

  // Also ensure lead students are synced with CAMPUS_MANAGER privileges
  for (const email of [
    "udeep.chowdary.s83@kalvium.com",
    "udeep.chowdary.s83@kalvium.community",
    "mageshwaran.t.s83@kalvium.community",
  ]) {
    try {
      const mainUser = await adminAuth.getUserByEmail(email);
      await adminAuth.setCustomUserClaims(mainUser.uid, { role: "CAMPUS_MANAGER" });
      const defaultName = email.includes("mageshwaran") ? "Mageshwaran T" : "Udeep Chowdary";
      await adminDb.collection("users").doc(mainUser.uid).set(
        {
          name: mainUser.displayName || defaultName,
          email: mainUser.email,
          role: "CAMPUS_MANAGER",
          avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(mainUser.email)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log(`- Verified ${email} has CAMPUS_MANAGER privileges.`);
    } catch (e) {
      // ignore if user not yet created
    }
  }

  console.log("\n==================================================");
  console.log("🔑 READY-TO-USE DEMO ACCOUNTS");
  console.log("==================================================");
  results.forEach((r) => {
    console.log(`\nRole:     ${r.role}`);
    console.log(`Email:    ${r.email}`);
    console.log(`Password: ${r.password}`);
  });
  console.log("==================================================\n");
}

seedRoles().catch(console.error);
