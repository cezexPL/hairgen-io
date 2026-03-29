import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scissors,
  Sparkles,
  Upload,
  Palette,
  Zap,
  Shield,
  ArrowRight,
  Star,
  CheckCircle,
} from "lucide-react";

const FEATURES = [
  {
    icon: Upload,
    title: "Upload Your Photo",
    description: "Simply upload a clear photo of your face. Our AI works with any angle and lighting.",
  },
  {
    icon: Palette,
    title: "Browse Styles",
    description: "Choose from 24 hairstyles, 8 colors, and 6 beard styles. Or describe your own look.",
  },
  {
    icon: Sparkles,
    title: "AI Generation",
    description: "Our AI creates a photorealistic preview in seconds. See exactly how you'll look.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your photos are auto-deleted in 24h. Full GDPR compliance. Your data, your control.",
  },
];

const TESTIMONIALS = [
  { name: "Sarah M.", text: "Saved me from a bad haircut! I could see exactly how bangs would look before committing.", rating: 5 },
  { name: "Mike T.", text: "The beard styles are amazing. Tried a Van Dyke before growing one — now I'm committed!", rating: 5 },
  { name: "Anna K.", text: "Finally an app that actually looks realistic. Not cartoonish like other tools.", rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              AI-Powered Hairstyle Preview
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              See Your New Look
              <span className="text-primary block mt-2">Before the Salon</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your photo, choose a hairstyle from our catalog or describe your dream look,
              and get a photorealistic AI-generated preview in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/try">
                <Button size="xl" className="w-full sm:w-auto gap-2">
                  <Scissors className="h-5 w-5" />
                  Try Free — 3 Generations
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  View Gallery
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">No credit card required. Results in under 30 seconds.</p>
          </div>
        </div>
      </section>

      {/* Before/After Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Realistic AI Transformations</h2>
            <p className="text-muted-foreground text-lg">See the difference AI can make</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { label: "Hairstyle Change", before: "Original look", after: "French Bob" },
              { label: "Color Transform", before: "Natural brown", after: "Rose Gold" },
              { label: "Beard Styling", before: "Clean shave", after: "Full Beard" },
            ].map((item) => (
              <Card key={item.label} className="overflow-hidden">
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.before} → {item.after}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What Makes Us Different</h2>
            <p className="text-muted-foreground text-lg">Three features no competitor offers together</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Palette, title: "Style Catalog", desc: "Browse 24 curated hairstyles with instant preview — no guessing" },
              { icon: Zap, title: "Custom Prompts", desc: "Describe any hairstyle in your own words for unlimited creativity" },
              { icon: Scissors, title: "Beard Editing", desc: "6 facial hair styles — the only tool that does hair AND beard" },
            ].map((f) => (
              <Card key={f.title} className="text-center p-6">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto mb-4">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {FEATURES.map((feature, i) => (
              <div key={feature.title} className="text-center">
                <div className="relative">
                  <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6">
                <CardContent className="pt-0 space-y-3">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-sm font-medium text-muted-foreground">— {t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg mb-8">Start free, upgrade when you need more</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary" />
              3 free generations
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary" />
              Credit packs from $4.99
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary" />
              Subscriptions from $7.99/mo
            </div>
          </div>
          <div className="mt-8">
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Full Pricing <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to See Your New Look?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands who preview their hairstyles before visiting the salon.
          </p>
          <Link href="/try">
            <Button size="xl" className="gap-2">
              <Scissors className="h-5 w-5" />
              Try It Free Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
