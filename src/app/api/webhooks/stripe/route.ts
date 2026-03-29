import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { query, queryOne } from "@/lib/db/index";
import { addCredits, updateSubscription, updateStripeCustomer } from "@/lib/db/users";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency check
  const existing = await queryOne<{ id: string }>(
    "SELECT id FROM stripe_events WHERE id = $1",
    [event.id]
  );
  if (existing) {
    return NextResponse.json({ received: true });
  }

  await query(
    "INSERT INTO stripe_events (id, type) VALUES ($1, $2)",
    [event.id, event.type]
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.metadata?.clerk_id;
        if (!clerkId) break;

        const user = await queryOne<{ id: string }>(
          "SELECT id FROM users WHERE clerk_id = $1",
          [clerkId]
        );
        if (!user) break;

        if (session.mode === "payment") {
          const credits = parseInt(session.metadata?.credits || "0", 10);
          if (credits > 0) {
            await addCredits(user.id, credits, "purchase", session.id);
          }
        }

        if (session.customer) {
          await updateStripeCustomer(user.id, session.customer as string);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const planId = subscription.metadata?.plan_id;
        if (!planId) break;

        const customerId = subscription.customer as string;
        const user = await queryOne<{ id: string }>(
          "SELECT id FROM users WHERE stripe_customer_id = $1",
          [customerId]
        );
        if (!user) break;

        const tier = subscription.status === "active" ? planId : "free";
        await updateSubscription(user.id, tier, subscription.id);

        // Add monthly credits on renewal
        if (subscription.status === "active") {
          const creditMap: Record<string, number> = {
            starter: 20,
            pro: 60,
            unlimited: 200,
          };
          const credits = creditMap[planId] || 0;
          if (credits > 0) {
            await addCredits(user.id, credits, "subscription", subscription.id);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const user = await queryOne<{ id: string }>(
          "SELECT id FROM users WHERE stripe_customer_id = $1",
          [customerId]
        );
        if (user) {
          await updateSubscription(user.id, "free", "");
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
