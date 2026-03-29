import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUploadPresignedUrl } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and content type required" }, { status: 400 });
    }

    const key = `uploads/${clerkId}/${Date.now()}-${filename}`;
    const presignedUrl = await getUploadPresignedUrl(key, contentType);

    return NextResponse.json({ presignedUrl, key });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
