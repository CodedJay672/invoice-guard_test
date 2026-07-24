import { LiveLondonGazetteClient } from "./live-client.js";
import { MockLondonGazetteClient } from "./mock-client.js";
import type { LondonGazetteClient, LondonGazetteClientConfig } from "./types.js";

export function createLondonGazetteClient(config: LondonGazetteClientConfig): LondonGazetteClient {
  if (config.mode === "live") {
    return new LiveLondonGazetteClient(config);
  }

  return new MockLondonGazetteClient();
}
