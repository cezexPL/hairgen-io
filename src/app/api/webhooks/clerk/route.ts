import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, deleteUserData } from "@/lib/db/users";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string;
    last_name?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: ClerkWebhookEvent = await req.json();

    switch (body.type) {
      case "user.created":
      case "user.updated": {
        const email = body.data.email_addresses?.[0]?.email_address;
        if (email) {
          const name = [body.data.first_name, body.data.last_name].filter(Boolean).join(" ");
          await getOrCreateUser(body.data.id, email, name || undefined);
        }
        break;
      }

      case "user.deleted": {
        await deleteUserData(body.data.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
