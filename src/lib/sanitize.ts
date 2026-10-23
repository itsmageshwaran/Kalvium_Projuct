/**
 * Security Input Sanitization Utilities.
 * Protects against Stored XSS, HTML injection, and control character smuggling.
 */

/**
 * Strips all HTML tags, script elements, and style blocks from a string.
 * Example: "<script>alert(1)</script>Tech Fest" -> "Tech Fest"
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/**
 * Normalizes plain text: removes null bytes, unprintable control characters,
 * collapses redundant whitespace, and enforces maximum character limits.
 */
export function sanitizePlainText(
  input: string | null | undefined,
  maxLength?: number
): string {
  if (!input || typeof input !== "string") return "";

  // 1. Remove null bytes and unprintable control codes (except standard tab, LF, CR)
  let clean = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 2. Strip any embedded HTML tags to prevent stored script injection
  clean = stripHtml(clean);

  // 3. Bound length if specified
  if (typeof maxLength === "number" && maxLength > 0) {
    clean = clean.substring(0, maxLength);
  }

  return clean.trim();
}
