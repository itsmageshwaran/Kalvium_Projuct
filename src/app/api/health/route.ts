import { NextResponse } from "next/server";
import { formatLocalDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET() {
  const isDev = process.env.NODE_ENV !== "production";
  let databaseHealthy = false;

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    await adminDb.collection("users").limit(1).get();
    databaseHealthy = true;
  } catch (e: any) {
    databaseHealthy = false;
    console.error("Health check database error:", e?.message || e);
  }

  const responseBody: any = {
    status: databaseHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    campusDate: formatLocalDate(new Date()),
    services: {
      database: databaseHealthy ? "healthy" : "unhealthy",
    },
  };

  // Only expose diagnostic config checks in local development
  if (isDev) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";

    responseBody.diagnostics = {
      hasProjectId: Boolean(projectId),
      hasClientEmail: Boolean(clientEmail),
      hasPrivateKey: rawKey.length > 50,
      hasCookieSecret: Boolean(process.env.COOKIE_SECRET),
    };
  }

  const response = NextResponse.json(responseBody, {
    status: databaseHealthy ? 200 : 503,
  });

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
