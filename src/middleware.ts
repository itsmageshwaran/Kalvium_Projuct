import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("campus_auth_token")?.value;
  const role = req.cookies.get("campus_user_role")?.value?.toUpperCase();

  const getTargetDashboard = (userRole?: string) => {
    if (userRole === "CAMPUS_MANAGER") return "/dashboard/manager";
    if (userRole === "ORGANIZER") return "/dashboard/organizer";
    return "/dashboard/student";
  };

  // If user is authenticated and attempts to access the landing page "/" or "/login" or "/register"
  if (token && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
    const redirectParam = req.nextUrl.searchParams.get("redirect");
    if (redirectParam && redirectParam.startsWith("/")) {
      const isManagerRestricted = redirectParam.includes("/manager") && role !== "CAMPUS_MANAGER";
      const isOrganizerRestricted = redirectParam.includes("/organizer") && role !== "ORGANIZER" && role !== "CAMPUS_MANAGER";
      if (!isManagerRestricted && !isOrganizerRestricted) {
        return NextResponse.redirect(new URL(redirectParam, req.url));
      }
    }
    const target = getTargetDashboard(role);
    return NextResponse.redirect(new URL(target, req.url));
  }

  // Protect dashboard routes: require authentication and enforce role boundaries
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }

    // Role-based restrictions on dashboards
    if (pathname.startsWith("/dashboard/manager") && role !== "CAMPUS_MANAGER") {
      const target = getTargetDashboard(role);
      return NextResponse.redirect(new URL(target, req.url));
    }

    if (
      pathname.startsWith("/dashboard/organizer") &&
      role !== "ORGANIZER" &&
      role !== "CAMPUS_MANAGER"
    ) {
      const target = getTargetDashboard(role);
      return NextResponse.redirect(new URL(target, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*"],
};
