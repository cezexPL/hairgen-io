import type { BaseProvider } from "./base";
import { FalProvider } from "./fal";

export type ProviderName = "fal";

const providers: Record<ProviderName, () => BaseProvider> = {
  fal: () => new FalProvider(),
};

let currentProvider: BaseProvider | null = null;

export function getProvider(name: ProviderName = "fal"): BaseProvider {
  if (!currentProvider) {
    const factory = providers[name];
    if (!factory) throw new Error(`Unknown provider: ${name}`);
    currentProvider = factory();
  }
  return currentProvider;
}
