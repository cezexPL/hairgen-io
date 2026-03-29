import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/db/users";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress || "unknown@hairgen.io";
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ");

    const user = await getOrCreateUser(clerkId, email, name || undefined);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      creditsBalance: user.credits_balance,
      subscriptionTier: user.subscription_tier,
      gdprConsent: user.gdpr_consent,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
