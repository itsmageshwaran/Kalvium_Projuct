import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  ROLE_COOKIE_NAME,
  ROLE_SIG_COOKIE_NAME,
  isSafeRedirectUrl,
  verifyRoleSignature,
} from "./lib/auth-shared";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. CSRF Protection for state-changing API endpoints
  if (pathname.startsWith("/api/")) {
    const method = req.method.toUpperCase();
    const isMutating = ["POST", "PUT", "DELETE", "PATCH"].includes(method);

    if (isMutating) {
      const origin = req.headers.get("origin");
      const referer = req.headers.get("referer");
      const host = req.headers.get("host");

      if (origin) {
        try {
          const originUrl = new URL(origin);
          if (host && originUrl.host !== host) {
            return NextResponse.json(
              { error: "Cross-site request blocked by security policy (CSRF protection)." },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "Invalid origin header provided." },
            { status: 403 }
          );
        }
      } else if (referer) {
        try {
          const refererUrl = new URL(referer);
          if (host && refererUrl.host !== host) {
            return NextResponse.json(
              { error: "Cross-site request blocked by security policy (CSRF protection)." },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "Invalid referer header provided." },
            { status: 403 }
          );
        }
      }
    }
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const rawRole = req.cookies.get(ROLE_COOKIE_NAME)?.value?.toUpperCase();
  const roleSig = req.cookies.get(ROLE_SIG_COOKIE_NAME)?.value;

  // Verify role integrity for privileged access
  let effectiveRole = "STUDENT";
  if (rawRole === "CAMPUS_MANAGER" || rawRole === "ORGANIZER") {
    const isSignatureValid = await verifyRoleSignature(rawRole, roleSig);
    if (isSignatureValid) {
      effectiveRole = rawRole;
    } else {
      // Signature invalid or forged: treat user as STUDENT
      effectiveRole = "STUDENT";
    }
  }

  const getTargetDashboard = (userRole?: string) => {
    if (userRole === "CAMPUS_MANAGER") return "/dashboard/manager";
    if (userRole === "ORGANIZER") return "/dashboard/organizer";
    return "/dashboard/student";
  };

  // Protect /events/create route: require authentication
  if (pathname === "/events/create") {
    if (!token) {
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirect", "/events/create");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Protect dashboard routes: require authentication and enforce role boundaries
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }

    // Role-based restrictions on dashboards
    if (pathname.startsWith("/dashboard/manager") && effectiveRole !== "CAMPUS_MANAGER") {
      const target = getTargetDashboard(effectiveRole);
      return NextResponse.redirect(new URL(target, req.url));
    }

    if (
      pathname.startsWith("/dashboard/organizer") &&
      effectiveRole !== "ORGANIZER" &&
      effectiveRole !== "CAMPUS_MANAGER"
    ) {
      const target = getTargetDashboard(effectiveRole);
      return NextResponse.redirect(new URL(target, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/events/create", "/api/:path*"],
};
