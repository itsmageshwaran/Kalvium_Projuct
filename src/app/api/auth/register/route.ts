import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, role, uid } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }
    
    if (!uid || typeof uid !== "string") {
      return NextResponse.json(
        { error: "Firebase UID is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const isAllowedDomain = cleanEmail.endsWith("@kalvium.community") || cleanEmail.endsWith("@kalvium.com");
    if (!isAllowedDomain) {
      return NextResponse.json(
        { error: "Only @kalvium.community and @kalvium.com email addresses are allowed for registration." },
        { status: 400 }
      );
    }

    // Require and verify caller's ID token to prevent IDOR and account takeover
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication token required for registration." },
        { status: 401 }
      );
    }

    const idToken = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired authentication token. Please try again." },
        { status: 401 }
      );
    }

    if (decodedToken.uid !== uid) {
      return NextResponse.json(
        { error: "Unauthorized: Provided UID does not match the authenticated session." },
        { status: 403 }
      );
    }

    // Role protection: CAMPUS_MANAGER cannot be self-registered
    const normalizedRole = role === "ORGANIZER" ? "ORGANIZER" : "STUDENT";

    // Check if another account with this email exists under a DIFFERENT UID
    const existingUsers = await adminDb.collection("users")
      .where("email", "==", cleanEmail)
      .get();

    const conflictingUser = existingUsers.docs.find(doc => doc.id !== uid);
    if (conflictingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists in the database." },
        { status: 400 }
      );
    }

    // 1. Prepare user profile
    const user = {
      id: uid,
      name: name.trim(),
      email: cleanEmail,
      role: normalizedRole,
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(cleanEmail)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Save or update user in Firestore
    await adminDb.collection("users").doc(uid).set({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }, { merge: true });

    // 3. Set custom claims on the Firebase user
    await adminAuth.setCustomUserClaims(uid, { role: normalizedRole });

    // 4. Create session cookie using verified idToken
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    const token = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      }
    });

    if (token) {
      setAuthCookie(response, token, user.role);
    }

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during registration." },
      { status: 500 }
    );
  }
}
