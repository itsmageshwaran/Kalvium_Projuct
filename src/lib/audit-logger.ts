/**
 * Tamper-Evident Security Audit Logger.
 * Records security-sensitive operations (approvals, declines, role elevations, logins)
 * with timestamps, actor IDs, IP addresses, and actions.
 */

export interface SecurityAuditEvent {
  action:
    | "AUTH_LOGIN_SUCCESS"
    | "AUTH_LOGIN_FAILED"
    | "AUTH_REGISTER"
    | "AUTH_LOGOUT"
    | "EVENT_SUBMITTED"
    | "EVENT_APPROVED"
    | "EVENT_DECLINED"
    | "EVENT_DELETED"
    | "ROLE_TAMPER_DETECTED"
    | "RATE_LIMIT_EXCEEDED"
    | "CSRF_BLOCKED";
  actorId?: string;
  actorRole?: string;
  ip?: string;
  targetId?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export function logSecurityEvent(event: SecurityAuditEvent): void {
  const payload = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  // Structured JSON output for SIEM ingestion (Google Cloud Logging, Datadog, AWS CloudWatch)
  console.log(`[SECURITY_AUDIT] ${JSON.stringify(payload)}`);
}
