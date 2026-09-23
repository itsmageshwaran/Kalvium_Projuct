/**
 * Edge-compatible authentication and security utilities.
 * Contains zero Node.js/Firebase-admin dependencies so it can safely execute
 * in Next.js Edge Middleware as well as client and server route handlers.
 */

export const AUTH_COOKIE_NAME = "campus_auth_token";
export const ROLE_COOKIE_NAME = "campus_user_role";
export const ROLE_SIG_COOKIE_NAME = "campus_user_role_sig";

const SIGNING_SECRET =
  process.env.COOKIE_SECRET ||
  process.env.FIREBASE_CLIENT_EMAIL ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "kalvium-campus-hub-secure-salt-2026";

/**
 * Computes an HMAC-SHA256 hex signature using standard Web Crypto API.
 */
export async function createRoleSignature(role: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SIGNING_SECRET),
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
 * Verifies an HMAC-SHA256 signature for a given role string.
 */
export async function verifyRoleSignature(
  role: string | null | undefined,
  signature: string | null | undefined
): Promise<boolean> {
  if (!role || !signature) return false;
  try {
    const expected = await createRoleSignature(role);
    return expected.length > 0 && expected === signature;
  } catch {
    return false;
  }
}

/**
 * Validates that an incoming redirect URL is safe to navigate to.
 * Disallows protocol-relative URLs (//attacker.com), backslashes, and external origins.
 */
export function isSafeRedirectUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  // Must start with a single slash, not double slash, and not contain backslashes
  return trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\");
}
