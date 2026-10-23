/**
 * Safe redirect and root-relative path validator.
 * Can be safely imported in both client components and server code
 * without leaking server secrets or Web Crypto dependencies.
 */

/**
 * Validates that an incoming redirect URL is safe to navigate to within the campus app.
 * Rejects protocol-relative URLs (//attacker.com), backslash evasions (/\\attacker.com),
 * control characters, and external schemes (javascript:, data:, https://external.com).
 */
export function isSafeRedirectUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  // Reject control characters, newlines, null bytes (CRLF injection prevention)
  if (/[\x00-\x1F\x7F]/.test(trimmed)) return false;

  // Must strictly start with a single forward slash
  if (!trimmed.startsWith("/")) return false;

  // Reject protocol-relative URLs (//attacker.com) and backslash evasions
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.includes("\\")) {
    return false;
  }

  // Reject pseudo-protocol payloads disguised inside paths (e.g. /javascript:...)
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("/javascript:") ||
    lower.startsWith("/data:") ||
    lower.startsWith("/vbscript:")
  ) {
    return false;
  }

  // Ensure parsing as relative URL does not escape origin
  try {
    const dummyBase = "http://localhost:3000";
    const parsed = new URL(trimmed, dummyBase);
    if (parsed.origin !== dummyBase) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}
