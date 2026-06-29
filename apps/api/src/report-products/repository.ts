import { schema, type Database } from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";

export type ReportProductTier = "basic" | "standard" | "premium";

export interface ReportProductSummary {
  tier: ReportProductTier;
  name: string;
  pricePence: number;
  includesPdf: boolean;
  includedItems: string[];
}

export interface ReportProductRepository {
  listActive(): Promise<ReportProductSummary[]>;
  findActiveByTier(tier: ReportProductTier): Promise<ReportProductSummary | undefined>;
}

export const canonicalReportProducts: readonly ReportProductSummary[] = [
  {
    tier: "basic",
    name: "Basic",
    pricePence: 799,
    includesPdf: false,
    includedItems: [
      "Court records check",
      "Director names and appointment dates",
      "Registered address history",
    ],
  },
  {
    tier: "standard",
    name: "Standard",
    pricePence: 1499,
    includesPdf: false,
    includedItems: [
      "Everything in Basic",
      "CCJ amounts and satisfaction status",
      "Recent filings and registered charges",
    ],
  },
  {
    tier: "premium",
    name: "Premium",
    pricePence: 2700,
    includesPdf: true,
    includedItems: [
      "Everything in Standard",
      "Director and insolvency depth checks",
      "Branded PDF and timestamped reference",
    ],
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
        }
      : undefined;
  }
}

function readIncludedItems(entitlements: Record<string, unknown>): string[] {
  const includedItems = entitlements["includedItems"];

  if (!Array.isArray(includedItems) || !includedItems.every((item) => typeof item === "string")) {
    throw new Error("Report product entitlements must include a string includedItems array.");
  }

  return includedItems;
}
