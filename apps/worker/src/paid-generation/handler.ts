import {
  createProviderFailure,
  createProviderSuccess,
  type CompaniesHouseClient,
  type InsolvencyDisqualifiedOfficersClient,
  type LondonGazetteClient,
  type ProviderName,
  type ProviderResult,
  type RegistryTrustClient,
} from "@workspace/integrations";
import type { AiInterpretationInput } from "@workspace/validation/ai-interpretation";

import {
  AI_INTERPRETATION_MODEL,
  AI_INTERPRETATION_PROMPT_VERSION,
} from "../ai-interpretation/prompt.js";
import { generateAiInterpretation } from "../ai-interpretation/service.js";
import type {
  AiInterpretationArtifact,
  AiInterpretationClient,
} from "../ai-interpretation/types.js";
import type {
  ReportGenerationHandler,
  ReportGenerationResult,
} from "../report-generation/types.js";
import type { GenerationLogger } from "../report-generation/types.js";
import { ReportGenerationError } from "../report-generation/types.js";
import type {
  GeneratingPaidReport,
  PaidGenerationRepository,
  PaidReportSnapshot,
  ProviderAlertPublisher,
} from "./types.js";

const SNAPSHOT_REUSE_MS = 24 * 60 * 60 * 1000;
const REGISTRY_RECHECK_MS = 7 * 24 * 60 * 60 * 1000;

export interface PaidReportGenerationHandlerDependencies {
  repository: PaidGenerationRepository;
  companiesHouse: CompaniesHouseClient;
  registryTrust: RegistryTrustClient;
  londonGazette: LondonGazetteClient;
  insolvencyDisqualifiedOfficers: InsolvencyDisqualifiedOfficersClient;
  ai: AiInterpretationClient;
  alerts: ProviderAlertPublisher;
  logger: GenerationLogger;
  now?: (() => Date) | undefined;
}

export class PaidReportGenerationHandler implements ReportGenerationHandler {
  private readonly now: () => Date;

  constructor(private readonly dependencies: PaidReportGenerationHandlerDependencies) {
    this.now = dependencies.now ?? (() => new Date());
  }

  async generate(reportId: string): Promise<ReportGenerationResult> {
    const report = await this.requireReport(reportId);
    await this.collectEntitledSources(report);
    const snapshots = await this.dependencies.repository.listLatestSnapshots(report.id);
    const retryableFailures = snapshots.filter(
      (snapshot) => snapshot.status === "failed" && snapshot.retryable,
    );
    if (retryableFailures.length > 0) {
      throw new ReportGenerationError("Paid provider collection has retryable failures.", true);
    }
    return this.assemble(report, snapshots);
  }

  async recoverTerminalFailure(
    reportId: string,
    _error?: unknown,
  ): Promise<ReportGenerationResult | undefined> {
    const report = await this.dependencies.repository.findGeneratingReport(reportId);
    if (!report) return undefined;
    const snapshots = await this.dependencies.repository.listLatestSnapshots(report.id);
    return this.assemble(report, snapshots, true);
  }

  private async collectEntitledSources(report: GeneratingPaidReport): Promise<void> {
    const companyNumber = report.companiesHouseNumber;
    await this.execute(report, "companies_house", "profile", 0, () =>
      this.dependencies.companiesHouse.getCompanyProfile({ companyNumber }),
    );
    const foundational = await this.dependencies.repository.listLatestSnapshots(report.id);
    if (
      foundational.some(
        (item) =>
          item.provider === "companies_house" &&
          item.operation === "profile" &&
          item.status === "failed",
      )
    ) {
      return;
    }
    if (report.entitlements.companiesHouse.addressHistory) {
      await this.execute(report, "companies_house", "address_history", 0, () =>
        this.dependencies.companiesHouse.getRegisteredOfficeAddressHistory({ companyNumber }),
      );
    }
    if (report.entitlements.companiesHouse.officers) {
      await this.execute(report, "companies_house", "officers", 0, () =>
        this.dependencies.companiesHouse.getOfficers({ companyNumber }),
      );
    }
    if (report.entitlements.companiesHouse.filingHistory) {
      await this.execute(report, "companies_house", "filing_history", 0, () =>
        this.dependencies.companiesHouse.getFilingHistory({ companyNumber }),
      );
    }
    if (report.entitlements.companiesHouse.charges) {
      await this.execute(report, "companies_house", "charges", 0, () =>
        this.dependencies.companiesHouse.getCharges({ companyNumber }),
      );
    }
    if (report.entitlements.companiesHouse.insolvency) {
      await this.execute(report, "companies_house", "insolvency", 0, () =>
        this.dependencies.companiesHouse.getInsolvency({ companyNumber }),
      );
    }
    if (report.entitlements.registryTrust.enabled) {
      await this.execute(report, "registry_trust", "ccj", null, async () => {
        const result = await this.dependencies.registryTrust.checkCompany({ companyNumber });
        if (result.status === "failed") return result;
        return createProviderSuccess(
          "registry_trust",
          {
            companiesHouseNumber: result.data.companiesHouseNumber,
            judgements: result.data.judgements.map((item) => ({
              judgementId: item.judgementId,
              courtName: item.courtName,
              judgementYear: item.judgementYear,
              amountPence: report.entitlements.registryTrust.includeAmounts
                ? item.amountPence
                : undefined,
              satisfied: report.entitlements.registryTrust.includeSatisfaction
                ? item.satisfied
                : undefined,
            })),
          },
          result.checkedAt,
        );
      });
    }
    if (report.entitlements.londonGazette) {
      await this.execute(report, "london_gazette", "company_notices", 0, () =>
        this.dependencies.londonGazette.checkCompanyNotices({ companyNumber }),
      );
    }
    if (report.entitlements.insolvencyDisqualifiedOfficers) {
      await this.execute(report, "insolvency_disqualified_officers", "company_check", null, () =>
        this.dependencies.insolvencyDisqualifiedOfficers.checkCompany({ companyNumber }),
      );
    }
    if (report.entitlements.fairPaymentCode) {
      await this.execute(report, "fair_payment_code", "internal_lookup", 0, () =>
        this.lookupFairPaymentCode(report),
      );
    }
  }

  private async execute<T>(
    report: GeneratingPaidReport,
    provider: ProviderName,
    operation: string,
    estimatedCostPence: number | null,
    fetch: () => Promise<ProviderResult<T>>,
  ): Promise<void> {
    const cutoff = new Date(this.now().getTime() - SNAPSHOT_REUSE_MS);
    const reusable = await this.dependencies.repository.findReusableSuccess(
      report.id,
      provider,
      operation,
      cutoff,
    );
    if (reusable) return;
    const rawResult = await fetch();
    const result =
      rawResult.status === "success"
        ? createProviderSuccess(provider, toRecord(rawResult.data), rawResult.checkedAt)
        : rawResult;
    await this.dependencies.repository.saveSnapshot({ report, operation, result });
    await this.dependencies.repository.logProviderUsage({
      report,
      provider,
      operation,
      status: result.status,
      estimatedCostPence,
    });
  }

  private async lookupFairPaymentCode(
    report: GeneratingPaidReport,
  ): Promise<ProviderResult<Record<string, unknown>>> {
    const checkedAt = this.now().toISOString();
    const record = await this.dependencies.repository.findFairPaymentCode(
      report.companiesHouseNumber,
    );
    if (!record) {
      return createProviderSuccess("fair_payment_code", { state: "absent" }, checkedAt);
    }
    const stale =
      record.verifiedAt.getTime() < this.now().getTime() - SNAPSHOT_REUSE_MS ||
      (record.expiresAt !== null && record.expiresAt.getTime() <= this.now().getTime());
    if (stale) {
      return createProviderFailure(
        "fair_payment_code",
        {
          code: "integration_provider_error",
          message: "Fair Payment Code status is stale.",
          retryable: false,
        },
        checkedAt,
      );
    }
    return createProviderSuccess(
      "fair_payment_code",
      {
        state: "present",
        statusLabel: record.statusLabel,
        awardLevel: record.awardLevel,
        sourceReference: record.sourceReference,
        verifiedAt: record.verifiedAt.toISOString(),
        expiresAt: record.expiresAt?.toISOString() ?? null,
      },
      checkedAt,
    );
  }

  private async assemble(
    report: GeneratingPaidReport,
    snapshots: PaidReportSnapshot[],
    terminalRecovery = false,
  ): Promise<ReportGenerationResult> {
    const profile = successData(snapshots, "companies_house", "profile");
    const failures = snapshots.filter((snapshot) => snapshot.status === "failed");
    if (!profile) {
      const result = this.frozenResult(report, snapshots, null, "refund_required", failures);
      await this.publishAlert(report, "refund_required", failures);
      return result;
    }

    const input = buildAiInput(snapshots);
    let interpretation: AiInterpretationArtifact;
    let aiPartial = false;
    try {
      const ai = await generateAiInterpretation(this.dependencies.ai, input);
      interpretation = ai.artifact;
      aiPartial = ai.reportOutcome === "partial";
    } catch (error) {
      if (!terminalRecovery) throw error;
      interpretation = unavailableAiArtifact(this.now());
      aiPartial = true;
    }
    const outcome = failures.length > 0 || aiPartial ? "partial" : "ready";
    const result = this.frozenResult(report, snapshots, interpretation, outcome, failures);
    if (outcome === "partial") await this.publishAlert(report, outcome, failures);
    return result;
  }

  private frozenResult(
    report: GeneratingPaidReport,
    snapshots: PaidReportSnapshot[],
    interpretation: AiInterpretationArtifact | null,
    outcome: "ready" | "partial" | "refund_required",
    failures: PaidReportSnapshot[],
  ): ReportGenerationResult {
    const registryFailed = failures.some((item) => item.provider === "registry_trust");
    const generatedAt = this.now().toISOString();
    return {
      outcome,
      providerStatuses: providerStatuses(report, snapshots),
      reportData: {
        schemaVersion: "paid-report-v1",
        reportReference: report.reportReference,
        companyNumber: report.companiesHouseNumber,
        companyName: report.companyName,
        tier: report.reportTier,
        entitlements: report.entitlements,
        generatedAt,
        facts: buildAiInput(snapshots),
        interpretation,
        relatedCompanies: { status: "unavailable", reason: "verified_source_not_configured" },
        evidenceCoverage: report.entitlements.evidenceCoverage
          ? {
              completed: snapshots.filter((item) => item.status === "success").length,
              failed: failures.length,
            }
          : null,
        recovery: registryFailed
          ? report.reportTier === "premium"
            ? { type: "admin_escalation" }
            : {
                type: "free_recheck",
                eligibleUntil: new Date(this.now().getTime() + REGISTRY_RECHECK_MS).toISOString(),
              }
          : null,
      },
    };
  }

  private async publishAlert(
    report: GeneratingPaidReport,
    outcome: "partial" | "refund_required",
    failures: PaidReportSnapshot[],
  ): Promise<void> {
    try {
      await this.dependencies.alerts.publish({
        reportId: report.id,
        reportReference: report.reportReference,
        outcome,
        failures: failures.map((failure) => ({
          provider: failure.provider,
          operation: failure.operation,
          errorCode: failure.errorCode,
        })),
      });
    } catch {
      this.dependencies.logger.warn(
        { reportId: report.id, reportReference: report.reportReference, outcome },
        "Paid report alert could not be enqueued",
      );
    }
  }

  private async requireReport(reportId: string): Promise<GeneratingPaidReport> {
    const report = await this.dependencies.repository.findGeneratingReport(reportId);
    if (!report) throw new ReportGenerationError("Generating paid report was not found.", false);
    return report;
  }
}

function buildAiInput(snapshots: PaidReportSnapshot[]): AiInterpretationInput {
  const profile = successData(snapshots, "companies_house", "profile");
  const address = successData(snapshots, "companies_house", "address_history");
  const officers = successData(snapshots, "companies_house", "officers");
  const charges = successData(snapshots, "companies_house", "charges");
  const filings = successData(snapshots, "companies_house", "filing_history");
  const companiesHouseInsolvency = successData(snapshots, "companies_house", "insolvency");
  const gazette = successData(snapshots, "london_gazette", "company_notices");
  const insolvencyOfficers = successData(
    snapshots,
    "insolvency_disqualified_officers",
    "company_check",
  );
  return {
    overview: profile ? { ...profile, registeredAddress: address } : null,
    charges,
    insolvency:
      companiesHouseInsolvency || gazette || insolvencyOfficers
        ? { companiesHouse: companiesHouseInsolvency, gazette, officers: insolvencyOfficers }
        : null,
    officers,
    filing_history: filings,
    ccj: successData(snapshots, "registry_trust", "ccj"),
    fair_payment_code: successData(snapshots, "fair_payment_code", "internal_lookup"),
  };
}

function successData(
  snapshots: PaidReportSnapshot[],
  provider: ProviderName,
  operation: string,
): Record<string, unknown> | null {
  return (
    snapshots.find(
      (item) =>
        item.provider === provider && item.operation === operation && item.status === "success",
    )?.data ?? null
  );
}

function providerStatuses(
  report: GeneratingPaidReport,
  snapshots: PaidReportSnapshot[],
): Record<string, unknown> {
  return {
    checked: snapshots.map((item) => ({
      provider: item.provider,
      operation: item.operation,
      status: item.status,
      checkedAt: item.checkedAt,
      errorCode: item.errorCode,
    })),
    fairPaymentCode: report.entitlements.fairPaymentCode ? "entitled" : "not_entitled",
    relatedCompanies: "unavailable",
  };
}

function unavailableAiArtifact(now: Date): AiInterpretationArtifact {
  return {
    status: "unavailable",
    model: AI_INTERPRETATION_MODEL,
    promptVersion: AI_INTERPRETATION_PROMPT_VERSION,
    generatedAt: now.toISOString(),
    requestId: null,
    reason: "unavailable",
  };
}

function toRecord<T>(value: T): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { value };
  }
  return { ...value } as Record<string, unknown>;
}
