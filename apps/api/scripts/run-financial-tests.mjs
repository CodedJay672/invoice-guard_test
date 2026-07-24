import { spawnSync } from "node:child_process";

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", "src/checkout/financial.integration.test.ts"],
  {
    env: { ...process.env, REQUIRE_TESTCONTAINERS: "1" },
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);
