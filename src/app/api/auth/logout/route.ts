import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, invalidateSession, clearAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (token) {
      await invalidateSession(token);
    }

    const cookie = clearAuthCookie();
    const response = NextResponse.json({ message: "Logged out" });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
