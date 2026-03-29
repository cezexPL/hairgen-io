"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Crown, Star, CreditCard } from "lucide-react";
import Link from "next/link";

const CREDIT_PACKS = [
  { id: "try_it", name: "Try It", credits: 10, price: "$4.99", icon: Zap },
  { id: "explorer", name: "Explorer", credits: 30, price: "$9.99", icon: Star },
  { id: "style_pro", name: "Style Pro", credits: 100, price: "$24.99", icon: Crown, popular: true },
  { id: "bulk", name: "Bulk", credits: 300, price: "$49.99", icon: CreditCard },
];

const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$7.99",
    period: "/mo",
    credits: 20,
    features: ["20 credits/month", "No watermark", "Standard quality"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$14.99",
    period: "/mo",
    credits: 60,
    features: ["60 credits/month", "No watermark", "HD quality", "Text prompts", "Beard editing"],
    popular: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: "$29.99",
    period: "/mo",
    credits: 200,
    features: ["200 credits/month", "No watermark", "HD quality", "All features", "Batch processing", "Priority queue"],
  },
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground text-lg">
          Start with 3 free generations. Buy credits or subscribe for more.
        </p>
      </div>

      {/* Free tier banner */}
      <div className="max-w-2xl mx-auto mb-12 p-6 rounded-xl border bg-primary/5 text-center">
        <h3 className="text-xl font-bold mb-2">Free Tier</h3>
        <p className="text-muted-foreground mb-1">3 free generations with watermark</p>
        <p className="text-sm text-muted-foreground">No credit card required</p>
        <Link href="/try" className="inline-block mt-4">
          <Button>Try Free Now</Button>
        </Link>
      </div>

      {/* Credit Packs */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Credit Packs</h2>
        <p className="text-center text-muted-foreground mb-8">Buy once, use anytime. No expiration.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {CREDIT_PACKS.map((pack) => (
            <Card key={pack.id} className={`relative ${pack.popular ? "border-primary shadow-lg" : ""}`}>
              {pack.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              )}
              <CardHeader className="text-center">
                <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto mb-2">
                  <pack.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{pack.name}</CardTitle>
                <CardDescription>{pack.credits} credits</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold">{pack.price}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(parseFloat(pack.price.replace("$", "")) / pack.credits).toFixed(2)}/credit
                </p>
              </CardContent>
              <CardFooter>
                {isSignedIn ? (
                  <Button className="w-full" disabled>
                    Coming Soon
                  </Button>
                ) : (
                  <Link href="/sign-up" className="w-full">
                    <Button className="w-full" variant="outline">Sign Up to Buy</Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Subscriptions */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Monthly Subscriptions</h2>
        <p className="text-center text-muted-foreground mb-8">Save more with a monthly plan. Cancel anytime.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Recommended</Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle>{plan.name}</CardTitle>
                <div>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.credits} credits/month</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isSignedIn ? (
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} disabled>
                    Coming Soon
                  </Button>
                ) : (
                  <Link href="/sign-up" className="w-full">
                    <Button className="w-full" variant="outline">Sign Up</Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-16 space-y-6">
        <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
        {[
          {
            q: "What's a credit?",
            a: "One credit = one AI hairstyle generation. Upload a photo and try any style.",
          },
          {
            q: "Do credits expire?",
            a: "Credit packs never expire. Subscription credits refresh monthly.",
          },
          {
            q: "Can I get a refund?",
            a: "Yes, unused credit packs can be refunded within 14 days. Contact support@hairgen.io.",
          },
          {
            q: "What's the difference between free and paid?",
            a: "Free generations have a small watermark. Paid plans remove the watermark and unlock HD quality, text prompts, and beard editing.",
          },
        ].map((faq) => (
          <div key={faq.q} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{faq.q}</h3>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
