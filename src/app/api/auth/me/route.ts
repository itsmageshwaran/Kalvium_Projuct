import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const userDoc = await adminDb.collection("users").doc(auth.userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const userData = userDoc.data();
    const user = {
        id: auth.userId,
        name: userData?.name,
        email: userData?.email,
        role: userData?.role,
        avatar: userData?.avatar,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me check error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

