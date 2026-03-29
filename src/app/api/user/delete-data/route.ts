import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteUserData } from "@/lib/db/users";

export async function DELETE() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteUserData(clerkId);

    return NextResponse.json({
      message: "All your data has been deleted. Your account will be fully removed within 24 hours.",
    });
  } catch (error) {
    console.error("Delete data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
