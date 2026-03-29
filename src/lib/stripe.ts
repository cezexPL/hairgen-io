import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const CREDIT_PACKS = [
  { id: "try_it", name: "Try It", credits: 10, price: 499, priceDisplay: "$4.99" },
  { id: "explorer", name: "Explorer", credits: 30, price: 999, priceDisplay: "$9.99" },
  { id: "style_pro", name: "Style Pro", credits: 100, price: 2499, priceDisplay: "$24.99" },
  { id: "bulk", name: "Bulk", credits: 300, price: 4999, priceDisplay: "$49.99" },
] as const;

export const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 799,
    priceDisplay: "$7.99/mo",
    credits: 20,
    features: ["20 credits/month", "No watermark", "Standard quality"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 1499,
    priceDisplay: "$14.99/mo",
    credits: 60,
    features: ["60 credits/month", "No watermark", "HD quality", "Text prompts", "Beard editing"],
    popular: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 2999,
    priceDisplay: "$29.99/mo",
    credits: 200,
    features: ["200 credits/month", "No watermark", "HD quality", "All features", "Batch processing", "Priority queue"],
  },
] as const;

export async function createCheckoutSession(params: {
  customerId?: string;
  clerkId: string;
  email: string;
  packId: string;
  credits: number;
  price: number;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: params.customerId || undefined,
    customer_email: params.customerId ? undefined : params.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${params.credits} Credits — hairgen.io`,
            description: `${params.credits} AI hairstyle generation credits`,
          },
          unit_amount: params.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      clerk_id: params.clerkId,
      pack_id: params.packId,
      credits: String(params.credits),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?purchase=cancelled`,
  });
  return session.url!;
}

export async function createSubscriptionSession(params: {
  customerId?: string;
  clerkId: string;
  email: string;
  planId: string;
  stripePriceId: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: params.customerId || undefined,
    customer_email: params.customerId ? undefined : params.email,
    line_items: [{ price: params.stripePriceId, quantity: 1 }],
    metadata: {
      clerk_id: params.clerkId,
      plan_id: params.planId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?subscription=cancelled`,
  });
  return session.url!;
}
