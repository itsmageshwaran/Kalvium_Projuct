import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, hashPassword, setAuthCookie, DEMO_ACCOUNTS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "false" || process.env.DEMO_MODE === "false") {
      return NextResponse.json(
        { error: "Demo login is disabled in this environment." },
        { status: 403 }
      );
    }

    const { role } = await req.json();

    if (!role || !["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified for demo login." },
        { status: 400 }
      );
    }

    const demoConfig = DEMO_ACCOUNTS[role as keyof typeof DEMO_ACCOUNTS];

    // Seed or get the demo account with a real bcrypt-hashed password
    const secureDemoPasswordHash = await hashPassword("demo12345");
    const user = await prisma.user.upsert({
      where: { email: demoConfig.email },
      update: {
        role: demoConfig.role,
        name: demoConfig.name,
        avatar: demoConfig.avatar,
      },
      create: {
        email: demoConfig.email,
        name: demoConfig.name,
        role: demoConfig.role,
        password: secureDemoPasswordHash,
        avatar: demoConfig.avatar,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as "STUDENT" | "ORGANIZER" | "CAMPUS_MANAGER",
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Internal server error during demo login." },
      { status: 500 }
    );
  }
}
