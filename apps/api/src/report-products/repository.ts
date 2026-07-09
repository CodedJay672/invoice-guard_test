import { schema, type Database } from "@workspace/db";
import {
  entitlementsForTier,
  paidReportEntitlementsSchema,
  type PaidReportEntitlements,
} from "@workspace/validation/paid-report";
import type { ReportProductCode } from "@workspace/types";
import { and, asc, eq } from "drizzle-orm";

export type ReportProductTier = ReportProductCode;

export interface ReportProductSummary {
  tier: ReportProductTier;
  name: string;
  pricePence: number;
  includesPdf: boolean;
  includedItems: string[];
  entitlements: PaidReportEntitlements;
}

export interface ReportProductRepository {
  listActive(): Promise<ReportProductSummary[]>;
  findActiveByTier(tier: ReportProductTier): Promise<ReportProductSummary | undefined>;
}

export const canonicalReportProducts: readonly ReportProductSummary[] = [
  {
    tier: "single_report",
    name: "Single Report",
    pricePence: 2000,
    includesPdf: false,
    includedItems: [
      "All 6 data sources",
      "CCJ registry check",
      "Fair Payment Code status",
      "Full written summary",
      "Instant access",
    ],
    entitlements: entitlementsForTier("single_report"),
  },
  {
    tier: "starter_pack",
    name: "Starter Pack",
    pricePence: 5400,
    includesPdf: false,
    includedItems: [
      "Everything in Single Report",
      "Credits never expire",
      "Use on any companies",
      "Instant access",
    ],
    entitlements: entitlementsForTier("starter_pack"),
  },
  {
    tier: "business_pack",
    name: "Business Pack",
    pricePence: 8000,
    includesPdf: false,
    includedItems: [
      "Everything in Starter Pack",
      "Ideal for monthly checks",
      "Best value under Agency",
      "Priority email support",
    ],
    entitlements: entitlementsForTier("business_pack"),
  },
  {
    tier: "agency_pack",
    name: "Agency Pack",
    pricePence: 14000,
    includesPdf: false,
    includedItems: [
      "Everything in Business Pack",
      "Lowest per-report rate",
      "Team access coming soon",
      "Priority email support",
    ],
    entitlements: entitlementsForTier("agency_pack"),
  },
];

export class InMemoryReportProductRepository implements ReportProductRepository {
  listActive(): Promise<ReportProductSummary[]> {
    return Promise.resolve(canonicalReportProducts.map((product) => ({ ...product })));
  }

  findActiveByTier(tier: ReportProductTier): Promise<ReportProductSummary | undefined> {
    const product = canonicalReportProducts.find((candidate) => candidate.tier === tier);
    return Promise.resolve(product ? { ...product } : undefined);
  }
}

export class DrizzleReportProductRepository implements ReportProductRepository {
  constructor(private readonly db: Database) {}

  async listActive(): Promise<ReportProductSummary[]> {
    const rows = await this.db
      .select()
      .from(schema.reportProducts)
      .where(eq(schema.reportProducts.isActive, true))
      .orderBy(asc(schema.reportProducts.pricePence));

    return rows.map((row) => ({
      tier: row.tier,
      name: row.name,
      pricePence: row.pricePence,
      includesPdf: row.includesPdf,
      includedItems: readIncludedItems(row.entitlements),
      entitlements: readEntitlements(row.entitlements, row.tier),
    }));
  }

  async findActiveByTier(tier: ReportProductTier): Promise<ReportProductSummary | undefined> {
    const rows = await this.db
      .select()
      .from(schema.reportProducts)
      .where(and(eq(schema.reportProducts.tier, tier), eq(schema.reportProducts.isActive, true)))
      .limit(1);
    const row = rows[0];
    return row
      ? {
          tier: row.tier,
          name: row.name,
          pricePence: row.pricePence,
          includesPdf: row.includesPdf,
          includedItems: readIncludedItems(row.entitlements),
          entitlements: readEntitlements(row.entitlements, row.tier),
        }
      : undefined;
  }
}

function readEntitlements(
  value: Record<string, unknown>,
  tier: ReportProductTier,
): PaidReportEntitlements {
  const parsed = paidReportEntitlementsSchema.safeParse(value["paidReport"]);
  return parsed.success ? parsed.data : entitlementsForTier(tier);
}

function readIncludedItems(entitlements: Record<string, unknown>): string[] {
  const includedItems = entitlements["includedItems"];

  if (!Array.isArray(includedItems) || !includedItems.every((item) => typeof item === "string")) {
    throw new Error("Report product entitlements must include a string includedItems array.");
  }

  return includedItems;
}
