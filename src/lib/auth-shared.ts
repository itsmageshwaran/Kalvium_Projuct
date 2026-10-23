/**
 * Edge-compatible authentication and security utilities.
 * Contains zero Node.js/Firebase-admin dependencies so it can safely execute
 * in Next.js Edge Middleware as well as client and server route handlers.
 */

export const AUTH_COOKIE_NAME = "campus_auth_token";
export const ROLE_COOKIE_NAME = "campus_user_role";
export const ROLE_SIG_COOKIE_NAME = "campus_user_role_sig";

export { isSafeRedirectUrl } from "./safe-redirect";

function getSigningSecret(): string {
  // Private server/edge environment secrets only. Never fall back to NEXT_PUBLIC_* variables.
  const secret =
    process.env.COOKIE_SECRET ||
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.FIREBASE_CLIENT_EMAIL;

  if (secret && secret.length >= 16) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    console.error(
      "SECURITY WARNING: COOKIE_SECRET or FIREBASE_PRIVATE_KEY must be configured in production for cryptographic role signatures."
    );
  }

  return "kalvium-campus-hub-dev-secret-internal-salt-2026";
}

/**
 * Computes an HMAC-SHA256 hex signature using standard Web Crypto API.
 */
export async function createRoleSignature(role: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(getSigningSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, enc.encode(role.toUpperCase()));
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (err) {
    console.error("Role signature generation error:", err);
    return "";
  }
}

/**
 * Verifies an HMAC-SHA256 signature for a given role string using constant-time comparison.
 */
export async function verifyRoleSignature(
  role: string | null | undefined,
  signature: string | null | undefined
): Promise<boolean> {
  if (!role || !signature || typeof signature !== "string") return false;
  try {
    const expected = await createRoleSignature(role);
    if (!expected || expected.length === 0 || expected.length !== signature.length) {
      return false;
    }
    // Constant-time character comparison to prevent timing side-channel attacks
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

