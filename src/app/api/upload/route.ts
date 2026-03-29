import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getUploadPresignedUrl } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and content type required" }, { status: 400 });
    }

    const key = `uploads/${user.id}/${Date.now()}-${filename}`;
    const presignedUrl = await getUploadPresignedUrl(key, contentType);

    return NextResponse.json({ presignedUrl, key });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
