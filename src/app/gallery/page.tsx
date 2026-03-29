"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const GALLERY_ITEMS = [
  { id: 1,  style: "French Bob",     category: "Hairstyle", description: "Chic chin-length bob with soft bangs",            file: "01" },
  { id: 2,  style: "Platinum Blonde",category: "Color",     description: "Cool-toned icy blonde transformation",            file: "02" },
  { id: 3,  style: "Full Beard",     category: "Beard",     description: "Thick, well-groomed full beard",                  file: "03" },
  { id: 4,  style: "Pixie Cut",      category: "Hairstyle", description: "Short and edgy with textured layers",             file: "04" },
  { id: 5,  style: "Rose Gold",      category: "Color",     description: "Trendy pink-gold metallic tone",                  file: "05" },
  { id: 6,  style: "Pompadour",      category: "Hairstyle", description: "Classic volume swept back",                       file: "06" },
  { id: 7,  style: "Beach Waves",    category: "Hairstyle", description: "Relaxed tousled sun-kissed waves",                file: "07" },
  { id: 8,  style: "Van Dyke",       category: "Beard",     description: "Sophisticated goatee with mustache",              file: "08" },
  { id: 9,  style: "Balayage",       category: "Color",     description: "Hand-painted gradient highlights",                file: "09" },
  { id: 10, style: "Undercut",       category: "Hairstyle", description: "Modern shaved sides with styled top",             file: "10" },
  { id: 11, style: "Curly Afro",     category: "Hairstyle", description: "Beautiful natural voluminous curls",              file: "11" },
  { id: 12, style: "Fiery Red",      category: "Color",     description: "Bold vibrant copper red transformation",          file: "12" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Hairstyle: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Color:     "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Beard:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

function GalleryCard({ item }: { item: typeof GALLERY_ITEMS[0] }) {
  const [showAfter, setShowAfter] = useState(false);

  return (
    <div
      className="group rounded-xl overflow-hidden border border-white/10 bg-zinc-900 hover:border-primary/40 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setShowAfter(true)}
      onMouseLeave={() => setShowAfter(false)}
    >
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* Before */}
        <img
          src={`/gallery/items/before-${item.file}.jpg`}
          alt={`Before: original look`}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${showAfter ? "opacity-0" : "opacity-100"}`}
        />
        {/* After */}
        <img
          src={`/gallery/items/after-${item.file}.jpg`}
          alt={`After: ${item.style}`}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${showAfter ? "opacity-100" : "opacity-0"}`}
        />
        {/* Category badge */}
        <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full border ${CATEGORY_COLORS[item.category]}`}>
          {item.category}
        </span>
        {/* Hover hint */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-3">
          <div className="flex justify-between text-xs text-white/80">
            <span className={`transition-opacity duration-300 ${showAfter ? "opacity-0" : "opacity-100"}`}>Original →</span>
            <span className={`transition-opacity duration-300 ${showAfter ? "opacity-100" : "opacity-0"} absolute left-3`}>← Original</span>
            <span className={`transition-opacity duration-300 ${showAfter ? "opacity-100" : "opacity-0"}`}>After AI</span>
            <span className={`transition-opacity duration-300 ${showAfter ? "opacity-0" : "opacity-100"} absolute right-3`}>hover to see</span>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-4 py-3">
        <h3 className="font-semibold text-sm">{item.style}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? GALLERY_ITEMS : GALLERY_ITEMS.filter(i => i.category === filter);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Style Gallery</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Browse AI-generated hairstyle transformations. Hover any card to see the before → after.
          Each result created in under 30 seconds.
        </p>
      </div>

      {/* Filter tags */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {["All", "Hairstyle", "Color", "Beard"].map((tag) => (
          <Badge
            key={tag}
            variant={tag === filter ? "default" : "outline"}
            className="cursor-pointer px-4 py-1.5 text-sm"
            onClick={() => setFilter(tag)}
          >
            {tag} {tag !== "All" && `(${GALLERY_ITEMS.filter(i => i.category === tag).length})`}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-16 py-12 border-t border-white/10">
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
