import type { BaseProvider } from "./base";
import { FalProvider } from "./fal";
import { GoogleProvider } from "./google";

export type ProviderName = "fal" | "google";

const providers: Record<ProviderName, () => BaseProvider> = {
  fal: () => new FalProvider(),
  google: () => new GoogleProvider(),
};

let currentProvider: BaseProvider | null = null;

/**
 * Returns the active AI provider.
 * Priority: GOOGLE_AI_API_KEY → google, FAL_KEY → fal, else mock via fal.
 */
export function getProvider(name?: ProviderName): BaseProvider {
  if (!currentProvider) {
    // Auto-select based on available keys
    const resolvedName: ProviderName =
      name ??
      (process.env.GOOGLE_AI_API_KEY ? "google" : "fal");

    const factory = providers[resolvedName];
    if (!factory) throw new Error(`Unknown provider: ${resolvedName}`);
    currentProvider = factory();
    console.log(`[provider] Using: ${currentProvider.name}`);
  }
  return currentProvider;
}
