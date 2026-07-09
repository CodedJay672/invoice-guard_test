import { LiveCompaniesHouseClient } from "./live-client.js";
import { MockCompaniesHouseClient } from "./mock-client.js";
import type {
  CompaniesHouseClient,
  CompaniesHouseClientConfig,
} from "../../../types/src/companies-house.js";

export function createCompaniesHouseClient(
  config: CompaniesHouseClientConfig,
): CompaniesHouseClient {
  if (config.mode === "live") {
    console.log("Creating live Companies House client with config:", config);
    return new LiveCompaniesHouseClient(config);
  }

  return new MockCompaniesHouseClient();
}
