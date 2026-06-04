import { LiveInsolvencyDisqualifiedOfficersClient } from "./live-client.js";
import { MockInsolvencyDisqualifiedOfficersClient } from "./mock-client.js";
import type {
  InsolvencyDisqualifiedOfficersClient,
  InsolvencyDisqualifiedOfficersClientConfig,
} from "./types.js";

export function createInsolvencyDisqualifiedOfficersClient(
  config: InsolvencyDisqualifiedOfficersClientConfig,
): InsolvencyDisqualifiedOfficersClient {
  if (config.mode === "live") {
    return new LiveInsolvencyDisqualifiedOfficersClient(config);
  }

  return new MockInsolvencyDisqualifiedOfficersClient();
}
