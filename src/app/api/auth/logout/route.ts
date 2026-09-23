import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getAuthUser } from "@/lib/auth";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (auth && auth.userId) {
      try {
        await adminAuth.revokeRefreshTokens(auth.userId);
      } catch (revokeErr) {
        console.warn("Session token revocation warning:", revokeErr);
      }
    }
  } catch (err) {
    console.warn("Logout session extraction error:", err);
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  clearAuthCookie(response);
  return response;
}
