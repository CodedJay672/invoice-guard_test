import { MockRegistryTrustClient } from "./mock-client.js";
import type { RegistryTrustClient, RegistryTrustClientConfig } from "./types.js";

export function createRegistryTrustClient(config: RegistryTrustClientConfig): RegistryTrustClient {
  if (config.mode === "live") {
    throw new Error(
      "Registry Trust live mode is unavailable until its verified production contract is configured.",
    );
  }
  return new MockRegistryTrustClient();
}
