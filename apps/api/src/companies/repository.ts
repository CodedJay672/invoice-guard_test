import { schema, type Database } from "@workspace/db";
import {
  CompanyPayload,
  CompanyRepository,
  CompanySearchLogInput,
  SearchLogRepository,
} from "./types.js";
import { toCompanyAddressPayload } from "./types.js";

const { companies, searchLogs } = schema;

export class DrizzleCompanyRepository implements CompanyRepository {
  constructor(private readonly db: Database) {}

  async upsertCompany(
    profile: Parameters<CompanyRepository["upsertCompany"]>[0],
  ): Promise<CompanyPayload> {
    const fetchedAt = new Date();
    const incorporationDate = profile.incorporationDate
      ? new Date(`${profile.incorporationDate}T00:00:00.000Z`)
      : null;
    const cessationDate = profile.cessationDate
      ? new Date(`${profile.cessationDate}T00:00:00.000Z`)
      : null;

    const rows = await this.db
      .insert(companies)
      .values({
        companiesHouseNumber: profile.companiesHouseNumber,
        companyName: profile.companyName,
        companyStatus: profile.companyStatus,
        companyType: profile.companyType,
        incorporationDate,
        registeredOfficeAddress1: profile.registeredOfficeAddress.addressLine_1,
        registeredOfficeAddress2: profile.registeredOfficeAddress.addressLine_2,
        registeredOfficePOBox: profile.registeredOfficeAddress.poBox,
        registeredOfficePostalCode: profile.registeredOfficeAddress.postalCode,
        cessationDate,
        registeredOfficeLocality: profile.registeredOfficeAddress.locality,
        registeredOfficeRegion: profile.registeredOfficeAddress.region,
        registeredOfficeCountry: profile.registeredOfficeAddress.country,
        sicCodes: profile.sicCodes,
        activeDirectorCount: profile.activeDirectorCount,
        lastFetchedAt: fetchedAt,
        updatedAt: fetchedAt,
      })
      .onConflictDoUpdate({
        target: companies.companiesHouseNumber,
        set: {
          companyName: profile.companyName,
          companyStatus: profile.companyStatus,
          companyType: profile.companyType,
          incorporationDate,
          registeredOfficeAddress1: profile.registeredOfficeAddress.addressLine_1,
          registeredOfficeAddress2: profile.registeredOfficeAddress.addressLine_2,
          registeredOfficePOBox: profile.registeredOfficeAddress.poBox,
          registeredOfficePostalCode: profile.registeredOfficeAddress.postalCode,
          cessationDate,
          registeredOfficeLocality: profile.registeredOfficeAddress.locality,
          registeredOfficeRegion: profile.registeredOfficeAddress.region,
          registeredOfficeCountry: profile.registeredOfficeAddress.country,
          sicCodes: profile.sicCodes,
          activeDirectorCount: profile.activeDirectorCount,
          lastFetchedAt: fetchedAt,
          updatedAt: fetchedAt,
        },
      })
      .returning();

    const row = rows[0];

    if (!row) {
      throw new Error("Company upsert did not return a row.");
    }

    return {
      companiesHouseNumber: row.companiesHouseNumber,
      companyName: row.companyName,
      companyStatus: row.companyStatus,
      companyType: row.companyType ?? undefined,
      incorporationDate: row.incorporationDate?.toISOString(),
      cessationDate: row.cessationDate?.toISOString(),
      registeredOfficeAddress: {
        addressLine1: row.registeredOfficeAddress1 ?? undefined,
        addressLine2: row.registeredOfficeAddress2 ?? undefined,
        poBox: row.registeredOfficePOBox ?? undefined,
        postalCode: row.registeredOfficePostalCode ?? undefined,
        locality: row.registeredOfficeLocality ?? undefined,
        region: row.registeredOfficeRegion ?? undefined,
        country: row.registeredOfficeCountry ?? undefined,
      },
      sicCodes: row.sicCodes,
      accounts: profile.accounts,
      industryLabel: row.industryLabel ?? undefined,
      activeDirectorCount: row.activeDirectorCount ?? undefined,
      lastFetchedAt: row.lastFetchedAt?.toISOString(),
    };
  }
}

export class DrizzleSearchLogRepository implements SearchLogRepository {
  constructor(private readonly db: Database) {}

  async recordSearch(input: CompanySearchLogInput): Promise<void> {
    await this.db.insert(searchLogs).values({
      clerkUserId: input.clerkUserId,
      ipHash: input.ipHash,
      query: input.query,
      matchedCompaniesCount: input.matchedCompaniesCount,
      selectedCompaniesHouseNumber: input.selectedCompaniesHouseNumber,
    });
  }
}

export class InMemoryCompanyRepository implements CompanyRepository {
  private readonly companies = new Map<string, CompanyPayload>();

  upsertCompany(
    profile: Parameters<CompanyRepository["upsertCompany"]>[0],
  ): Promise<CompanyPayload> {
    const payload: CompanyPayload = {
      companiesHouseNumber: profile.companiesHouseNumber,
      companyName: profile.companyName,
      companyStatus: profile.companyStatus,
      companyType: profile.companyType,
      incorporationDate: profile.incorporationDate,
      cessationDate: profile.cessationDate,
      registeredOfficeAddress: toCompanyAddressPayload(profile.registeredOfficeAddress),
      sicCodes: profile.sicCodes,
      accounts: profile.accounts,
      industryLabel: undefined,
      activeDirectorCount: profile.activeDirectorCount,
      lastFetchedAt: new Date().toISOString(),
    };

    this.companies.set(profile.companiesHouseNumber, payload);

    return Promise.resolve(payload);
  }
}

export class InMemorySearchLogRepository implements SearchLogRepository {
  readonly entries: CompanySearchLogInput[] = [];

  recordSearch(input: CompanySearchLogInput): Promise<void> {
    this.entries.push(input);

    return Promise.resolve();
  }
}
