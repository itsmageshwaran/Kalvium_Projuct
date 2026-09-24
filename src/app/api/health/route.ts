import { NextResponse } from "next/server";
import { formatLocalDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  
  const hasProjectId = Boolean(projectId);
  const hasClientEmail = Boolean(clientEmail);
  const hasPrivateKey = rawKey.length > 50;
  const keyHeaderOk = rawKey.includes("BEGIN PRIVATE KEY");
  const keyHasRealNewlines = rawKey.includes("\n");
  const keyHasEscapedNewlines = rawKey.includes("\\n");

  let adminStatus = "untested";
  let adminError: string | null = null;
  let adminStack: string | null = null;
  let usersCount = -1;

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("users").limit(1).get();
    adminStatus = "connected";
    usersCount = snap.size;
  } catch (e: any) {
    adminStatus = "error";
    adminError = e?.message || String(e);
    adminStack = e?.stack || null;
  }

  const response = NextResponse.json({
    status: adminStatus === "error" ? "degraded" : "ok",
    deployedAt: new Date().toISOString(),
    campusDate: formatLocalDate(new Date()),
    admin: {
      status: adminStatus,
      usersFound: usersCount,
      error: adminError,
      stack: adminStack,
    },
    environment: {
      hasProjectId,
      projectId: projectId || "MISSING",
      hasClientEmail,
      clientEmailMasked: clientEmail ? `${clientEmail.substring(0, 6)}...` : "MISSING",
      hasPrivateKey,
      keyLength: rawKey.length,
      keyHeaderOk,
      keyHasRealNewlines,
      keyHasEscapedNewlines,
    },
  });

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
