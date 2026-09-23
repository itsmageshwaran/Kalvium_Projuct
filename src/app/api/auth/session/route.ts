import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Firebase ID token is required." },
        { status: 400 }
      );
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = decoded.email || "";
    const cleanEmail = email.toLowerCase().trim();
    const isAllowedDomain = cleanEmail.endsWith("@kalvium.community") || cleanEmail.endsWith("@kalvium.com");
    
    // Check if user exists in Firestore
    const userRef = adminDb.collection("users").doc(decoded.uid);
    let userDoc = await userRef.get();
    let user = userDoc.data();

    if (!userDoc.exists) {
      // Enforce domain check on self-registration via session
      if (!isAllowedDomain) {
        return NextResponse.json(
          { error: "Access restricted to @kalvium.community and @kalvium.com email addresses." },
          { status: 403 }
        );
      }

      const name = decoded.name || (email ? email.split("@")[0] : "Campus Member");
      const role = (decoded.role as "STUDENT" | "ORGANIZER" | "CAMPUS_MANAGER") || "STUDENT";

      const fallbackUser = {
        name,
        email: cleanEmail,
        role,
        avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(cleanEmail || decoded.uid)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await userRef.set(fallbackUser);
      if (!decoded.role) {
        await adminAuth.setCustomUserClaims(decoded.uid, { role });
      }
      user = fallbackUser;
    } else {
      // Sync claims if missing from Auth
      if (!decoded.role && user?.role) {
        await adminAuth.setCustomUserClaims(decoded.uid, { role: user.role });
      }
    }

    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({
      success: true,
      user: {
        id: decoded.uid,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        avatar: user?.avatar,
      }
    });

    await setAuthCookie(response, sessionCookie, user?.role);

    return response;
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during login." },
      { status: 500 }
    );
  }
}
