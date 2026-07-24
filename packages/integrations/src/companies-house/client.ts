import { LiveCompaniesHouseClient } from "./live-client.js";
import { MockCompaniesHouseClient } from "./mock-client.js";
import type { CompaniesHouseClient, CompaniesHouseClientConfig } from "@workspace/types";

export function createCompaniesHouseClient(
  config: CompaniesHouseClientConfig,
): CompaniesHouseClient {
  if (config.mode === "live") {
    return new LiveCompaniesHouseClient(config);
  }

  return new MockCompaniesHouseClient();
}
