import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "./firebase/admin";



/**
 * Validates whether a URL is a safe HTTP/HTTPS URL or allowed internal path.
 * Disallows javascript:, data:text/html, vbscript:, etc.
 */
export function isValidSafeUrl(urlStr: string | null | undefined): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim();
  if (trimmed === "" || trimmed === "Not specified" || trimmed === "Needs verification") return true;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:text") ||
    lower.startsWith("vbscript:")
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === "http:" || 
      parsed.protocol === "https:" || 
      (parsed.protocol === "data:" && trimmed.startsWith("data:image/"))
    );
  } catch {
    // Allow root-relative paths e.g. /posters/...
    return trimmed.startsWith("/");
  }
}

/**
 * Returns a sanitized URL or a safe fallback if the input is dangerous or invalid.
 */
export function sanitizeUrl(urlStr: string | null | undefined, fallback: string = "Not specified"): string {
  if (!urlStr || typeof urlStr !== "string") return fallback;
  const trimmed = urlStr.trim();
  if (!isValidSafeUrl(trimmed)) {
    return fallback;
  }
  return trimmed;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: "STUDENT" | "ORGANIZER" | "CAMPUS_MANAGER";
  name: string;
}



export const AUTH_COOKIE_NAME = "campus_auth_token";
export const ROLE_COOKIE_NAME = "campus_user_role";

export function setAuthCookie(res: NextResponse, token: string, role?: string): void {
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  if (role) {
    res.cookies.set(ROLE_COOKIE_NAME, role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  }
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
  res.cookies.set(ROLE_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
}

/**
 * Extracts the authenticated user payload from the incoming NextRequest.
 * Checks Bearer Authorization header (ID Token) or the campus_auth_session HTTP cookie (Session Cookie).
 */
export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers.get("authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.split(" ")[1];
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      let role = (decoded.role as "STUDENT" | "ORGANIZER" | "CAMPUS_MANAGER") || undefined;
      let name = decoded.name || "";
      if (!role) {
        try {
          const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
          if (userDoc.exists) {
            const data = userDoc.data();
            role = data?.role;
            if (!name && data?.name) name = data.name;
          }
        } catch (dbErr) {
          console.warn("Failed to fetch user role from firestore:", dbErr);
        }
      }
      return {
        userId: decoded.uid,
        email: decoded.email || "",
        role: role || "STUDENT",
        name,
      };
    } catch (error) {
      console.error("ID Token verification failed", error);
      return null;
    }
  }

  const cookie = req.cookies.get(AUTH_COOKIE_NAME);
  if (cookie && cookie.value) {
    try {
      const decoded = await adminAuth.verifySessionCookie(cookie.value, true);
      let role = (decoded.role as "STUDENT" | "ORGANIZER" | "CAMPUS_MANAGER") || undefined;
      let name = decoded.name || "";
      if (!role) {
        try {
          const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
          if (userDoc.exists) {
            const data = userDoc.data();
            role = data?.role;
            if (!name && data?.name) name = data.name;
          }
        } catch (dbErr) {
          console.warn("Failed to fetch user role from firestore:", dbErr);
        }
      }
      return {
        userId: decoded.uid,
        email: decoded.email || "",
        role: role || "STUDENT",
        name,
      };
    } catch (error) {
      console.error("Session cookie verification failed", error);
      return null;
    }
  }

  return null;
}

/**
 * Enforces role-based authorization on an API endpoint.
 * Returns either the authorized user or a JSON error response (401 or 403).
 */
export async function requireAuth(
  req: NextRequest,
  allowedRoles?: Array<"STUDENT" | "ORGANIZER" | "CAMPUS_MANAGER">
): Promise<{ user: TokenPayload } | { errorResponse: NextResponse }> {
  const user = await getAuthUser(req);

  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      errorResponse: NextResponse.json(
        {
          error: `Access denied. Role '${user.role}' is not authorized for this operation.`,
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}


