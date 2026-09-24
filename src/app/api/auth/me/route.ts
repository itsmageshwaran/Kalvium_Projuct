import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      const res = NextResponse.json({ user: null }, { status: 200 });
      res.cookies.delete("campus_auth_token");
      res.cookies.delete("campus_user_role");
      res.cookies.delete("campus_user_role_sig");
      return res;
    }

    const userDoc = await adminDb.collection("users").doc(auth.userId).get();
    
    if (!userDoc.exists) {
      const res = NextResponse.json({ user: null }, { status: 200 });
      res.cookies.delete("campus_auth_token");
      res.cookies.delete("campus_user_role");
      res.cookies.delete("campus_user_role_sig");
      return res;
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
    const res = NextResponse.json({ user: null }, { status: 200 });
    res.cookies.delete("campus_auth_token");
    res.cookies.delete("campus_user_role");
    res.cookies.delete("campus_user_role_sig");
    return res;
  }
}

