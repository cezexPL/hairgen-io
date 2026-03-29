import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const GALLERY_ITEMS = [
  { id: 1, style: "French Bob", category: "Hairstyle", description: "Chic chin-length bob with soft bangs" },
  { id: 2, style: "Platinum Blonde", category: "Color", description: "Cool-toned icy blonde transformation" },
  { id: 3, style: "Full Beard", category: "Beard", description: "Thick, well-groomed full beard" },
  { id: 4, style: "Pixie Cut", category: "Hairstyle", description: "Short and edgy with textured layers" },
  { id: 5, style: "Rose Gold", category: "Color", description: "Trendy pink-gold metallic tone" },
  { id: 6, style: "Pompadour", category: "Hairstyle", description: "Classic volume swept back" },
  { id: 7, style: "Beach Waves", category: "Hairstyle", description: "Relaxed tousled sun-kissed waves" },
  { id: 8, style: "Van Dyke", category: "Beard", description: "Sophisticated goatee with mustache" },
  { id: 9, style: "Balayage", category: "Color", description: "Hand-painted gradient highlights" },
  { id: 10, style: "Undercut", category: "Hairstyle", description: "Modern shaved sides with styled top" },
  { id: 11, style: "Curly Afro", category: "Hairstyle", description: "Beautiful natural voluminous curls" },
  { id: 12, style: "Fiery Red", category: "Color", description: "Bold vibrant copper red transformation" },
];

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Style Gallery</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Browse examples of AI-generated hairstyle transformations.
          Each result was created with hairgen.io in under 30 seconds.
        </p>
      </div>

      {/* Filter tags */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {["All", "Hairstyle", "Color", "Beard"].map((tag) => (
          <Badge
            key={tag}
            variant={tag === "All" ? "default" : "outline"}
            className="cursor-pointer px-4 py-1.5"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {GALLERY_ITEMS.map((item) => (
          <Card key={item.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center relative">
              <div className="text-center p-4">
                <Sparkles className="h-10 w-10 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold">{item.style}</p>
              </div>
              <Badge className="absolute top-3 right-3" variant="secondary">
                {item.category}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium">{item.style}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-16 py-12 border-t">
        <h2 className="text-2xl font-bold mb-3">Want to See Yourself?</h2>
        <p className="text-muted-foreground mb-6">
          Upload your photo and try any of these styles — free, no card required.
        </p>
        <Link href="/try">
          <Button size="lg" className="gap-2">
            Try It Free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
