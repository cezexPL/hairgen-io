import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getTokenFromRequest, invalidateSession, clearAuthCookie } from "@/lib/auth";
import { deleteUserData } from "@/lib/db/users";

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteUserData(user.id);

    // Invalidate current session
    const token = await getTokenFromRequest(req);
    if (token) {
      await invalidateSession(token);
    }

    const cookie = clearAuthCookie();
    const response = NextResponse.json({
      message: "All your data has been deleted.",
    });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    console.error("Delete data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
