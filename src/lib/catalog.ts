export type StyleGender = "female" | "male" | "unisex";
export type StyleLength = "short" | "medium" | "long";
export type StyleCategory = "hairstyle" | "beard" | "color";

export interface HairstyleItem {
  id: string;
  name: string;
  prompt: string;
  category: StyleCategory;
  gender: StyleGender;
  length?: StyleLength;
  color?: string;
  thumbnail: string; // emoji placeholder for MVP, can be replaced with real images
}

export const HAIRSTYLE_CATALOG: HairstyleItem[] = [
  // ===== Female Hairstyles =====
  {
    id: "bob-short",
    name: "Short Bob",
    prompt: "short bob haircut, sleek and modern, chin-length, straight hair",
    category: "hairstyle",
    gender: "female",
    length: "short",
    thumbnail: "💇‍♀️",
  },
  {
    id: "pixie-cut",
    name: "Pixie Cut",
    prompt: "pixie cut hairstyle, short and edgy, textured layers",
    category: "hairstyle",
    gender: "female",
    length: "short",
    thumbnail: "✂️",
  },
  {
    id: "long-waves",
    name: "Long Waves",
    prompt: "long wavy hair, soft flowing waves, voluminous and natural",
    category: "hairstyle",
    gender: "female",
    length: "long",
    thumbnail: "🌊",
  },
  {
    id: "beach-waves",
    name: "Beach Waves",
    prompt: "beach waves hairstyle, relaxed tousled waves, sun-kissed texture",
    category: "hairstyle",
    gender: "female",
    length: "medium",
    thumbnail: "🏖️",
  },
  {
    id: "french-bob",
    name: "French Bob",
    prompt: "french bob haircut with bangs, chin-length, chic and elegant",
    category: "hairstyle",
    gender: "female",
    length: "short",
    thumbnail: "🇫🇷",
  },
  {
    id: "balayage-long",
    name: "Balayage Long",
    prompt: "long hair with balayage highlights, sun-kissed gradient, flowing layers",
    category: "hairstyle",
    gender: "female",
    length: "long",
    thumbnail: "🌅",
  },
  {
    id: "curly-afro",
    name: "Curly Afro",
    prompt: "natural curly afro hairstyle, voluminous tight curls, beautiful texture",
    category: "hairstyle",
    gender: "female",
    length: "medium",
    thumbnail: "🌀",
  },
  {
    id: "sleek-straight",
    name: "Sleek Straight",
    prompt: "sleek straight hair, perfectly smooth and glossy, long flowing hair",
    category: "hairstyle",
    gender: "female",
    length: "long",
    thumbnail: "✨",
  },

  // ===== Male Hairstyles =====
  {
    id: "crew-cut",
    name: "Crew Cut",
    prompt: "classic crew cut hairstyle, short and clean, tapered sides",
    category: "hairstyle",
    gender: "male",
    length: "short",
    thumbnail: "💈",
  },
  {
    id: "undercut",
    name: "Undercut",
    prompt: "modern undercut hairstyle, shaved sides with longer top, styled back",
    category: "hairstyle",
    gender: "male",
    length: "short",
    thumbnail: "🔪",
  },
  {
    id: "fade",
    name: "Fade",
    prompt: "clean fade haircut, gradual taper from skin to longer top, modern barber style",
    category: "hairstyle",
    gender: "male",
    length: "short",
    thumbnail: "📐",
  },
  {
    id: "buzz-cut",
    name: "Buzz Cut",
    prompt: "buzz cut, very short uniform length all over, clean and minimal",
    category: "hairstyle",
    gender: "male",
    length: "short",
    thumbnail: "⚡",
  },
  {
    id: "pompadour",
    name: "Pompadour",
    prompt: "classic pompadour hairstyle, volume on top swept back, faded sides",
    category: "hairstyle",
    gender: "male",
    length: "medium",
    thumbnail: "👑",
  },
  {
    id: "slick-back",
    name: "Slick Back",
    prompt: "slicked back hairstyle, glossy smooth hair swept back, clean look",
    category: "hairstyle",
    gender: "male",
    length: "medium",
    thumbnail: "🪮",
  },
  {
    id: "textured-crop",
    name: "Textured Crop",
    prompt: "textured crop haircut, short messy top with texture, cropped fringe",
    category: "hairstyle",
    gender: "male",
    length: "short",
    thumbnail: "🌿",
  },
  {
    id: "long-curly-m",
    name: "Long Curly",
    prompt: "long curly hair for men, flowing natural curls, shoulder length",
    category: "hairstyle",
    gender: "male",
    length: "long",
    thumbnail: "🦁",
  },

  // ===== Hair Colors =====
  {
    id: "color-black",
    name: "Natural Black",
    prompt: "natural black hair color, deep rich black, glossy shine",
    category: "color",
    gender: "unisex",
    color: "#1a1a1a",
    thumbnail: "⬛",
  },
  {
    id: "color-dark-brown",
    name: "Dark Brown",
    prompt: "dark brown hair color, rich chocolate brown, natural looking",
    category: "color",
    gender: "unisex",
    color: "#3d2314",
    thumbnail: "🟫",
  },
  {
    id: "color-chestnut",
    name: "Chestnut",
    prompt: "chestnut hair color, warm reddish-brown, autumn tones",
    category: "color",
    gender: "unisex",
    color: "#954535",
    thumbnail: "🌰",
  },
  {
    id: "color-golden-blonde",
    name: "Golden Blonde",
    prompt: "golden blonde hair color, warm honey blonde, sun-kissed golden tones",
    category: "color",
    gender: "unisex",
    color: "#daa520",
    thumbnail: "🌟",
  },
  {
    id: "color-platinum",
    name: "Platinum Blonde",
    prompt: "platinum blonde hair color, icy white-blonde, cool toned",
    category: "color",
    gender: "unisex",
    color: "#e5e4e2",
    thumbnail: "🤍",
  },
  {
    id: "color-red",
    name: "Fiery Red",
    prompt: "fiery red hair color, vibrant copper red, bold and striking",
    category: "color",
    gender: "unisex",
    color: "#b22222",
    thumbnail: "🔴",
  },
  {
    id: "color-rose-gold",
    name: "Rose Gold",
    prompt: "rose gold hair color, pink-gold metallic tone, trendy and modern",
    category: "color",
    gender: "unisex",
    color: "#b76e79",
    thumbnail: "🩷",
  },
  {
    id: "color-balayage",
    name: "Balayage",
    prompt: "balayage hair color, hand-painted gradient from dark roots to light ends",
    category: "color",
    gender: "unisex",
    color: "#c4a35a",
    thumbnail: "🎨",
  },
];

// ===== Beard Catalog =====
export const BEARD_CATALOG: HairstyleItem[] = [
  {
    id: "beard-clean",
    name: "Clean Shave",
    prompt: "clean shaven face, no facial hair, smooth skin",
    category: "beard",
    gender: "male",
    thumbnail: "🧼",
  },
  {
    id: "beard-shadow",
    name: "5 O'Clock Shadow",
    prompt: "5 o'clock shadow, light stubble, short facial hair growth",
    category: "beard",
    gender: "male",
    thumbnail: "🌑",
  },
  {
    id: "beard-short",
    name: "Short Beard",
    prompt: "short well-trimmed beard, neat and groomed, even length",
    category: "beard",
    gender: "male",
    thumbnail: "🧔",
  },
  {
    id: "beard-full",
    name: "Full Beard",
    prompt: "full thick beard, well-maintained, masculine and strong",
    category: "beard",
    gender: "male",
    thumbnail: "🧔‍♂️",
  },
  {
    id: "beard-vandyke",
    name: "Van Dyke",
    prompt: "Van Dyke beard style, goatee with mustache, disconnected from cheeks",
    category: "beard",
    gender: "male",
    thumbnail: "🎭",
  },
  {
    id: "beard-goatee",
    name: "Goatee",
    prompt: "goatee facial hair, chin beard with mustache connected, clean cheeks",
    category: "beard",
    gender: "male",
    thumbnail: "🐐",
  },
];

export const FULL_CATALOG = [...HAIRSTYLE_CATALOG, ...BEARD_CATALOG];

export function getStyleById(id: string): HairstyleItem | undefined {
  return FULL_CATALOG.find((s) => s.id === id);
}

export function filterCatalog(filters: {
  category?: StyleCategory;
  gender?: StyleGender;
  length?: StyleLength;
}): HairstyleItem[] {
  let items = FULL_CATALOG;
  if (filters.category) items = items.filter((s) => s.category === filters.category);
  if (filters.gender) items = items.filter((s) => s.gender === filters.gender || s.gender === "unisex");
  if (filters.length) items = items.filter((s) => s.length === filters.length);
  return items;
}
