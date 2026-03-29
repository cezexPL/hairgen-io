"use client";

import { useState } from "react";
import { HAIRSTYLE_CATALOG, BEARD_CATALOG, type HairstyleItem, type StyleGender, type StyleLength } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StyleCatalogProps {
  selectedStyleId: string | null;
  onSelectStyle: (style: HairstyleItem) => void;
  className?: string;
}

const GENDER_FILTERS: { label: string; value: StyleGender | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
];

const LENGTH_FILTERS: { label: string; value: StyleLength | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Short", value: "short" },
  { label: "Medium", value: "medium" },
  { label: "Long", value: "long" },
];

function StyleCard({
  style,
  selected,
  onClick,
}: {
  style: HairstyleItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:border-primary/50 hover:bg-primary/5",
        selected ? "border-primary bg-primary/10 shadow-md" : "border-border"
      )}
    >
      <span className="text-4xl">{style.thumbnail}</span>
      <span className="text-sm font-medium text-center">{style.name}</span>
      {style.color && (
        <div
          className="w-6 h-6 rounded-full border"
          style={{ backgroundColor: style.color }}
        />
      )}
    </button>
  );
}

export function StyleCatalog({ selectedStyleId, onSelectStyle, className }: StyleCatalogProps) {
  const [genderFilter, setGenderFilter] = useState<StyleGender | "all">("all");
  const [lengthFilter, setLengthFilter] = useState<StyleLength | "all">("all");

  const filteredHairstyles = HAIRSTYLE_CATALOG.filter((s) => {
    if (s.category === "color") return false;
    if (genderFilter !== "all" && s.gender !== genderFilter && s.gender !== "unisex") return false;
    if (lengthFilter !== "all" && s.length !== lengthFilter) return false;
    return true;
  });

  const colorStyles = HAIRSTYLE_CATALOG.filter((s) => s.category === "color");

  return (
    <div className={cn("w-full", className)}>
      <Tabs defaultValue="hairstyles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hairstyles">Hairstyles</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="beards">Beards</TabsTrigger>
        </TabsList>

        <TabsContent value="hairstyles" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {GENDER_FILTERS.map((f) => (
              <Badge
                key={f.value}
                variant={genderFilter === f.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setGenderFilter(f.value)}
              >
                {f.label}
              </Badge>
            ))}
            <span className="w-px h-6 bg-border" />
            {LENGTH_FILTERS.map((f) => (
              <Badge
                key={f.value}
                variant={lengthFilter === f.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setLengthFilter(f.value)}
              >
                {f.label}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredHairstyles.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                selected={selectedStyleId === style.id}
                onClick={() => onSelectStyle(style)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="colors">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {colorStyles.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                selected={selectedStyleId === style.id}
                onClick={() => onSelectStyle(style)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="beards">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BEARD_CATALOG.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                selected={selectedStyleId === style.id}
                onClick={() => onSelectStyle(style)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
