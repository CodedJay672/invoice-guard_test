import {
  browserReportPayloadSchema,
  frozenPaidReportSchema,
  frozenProviderStatusesSchema,
  paidReportEntitlementsSchema,
  type BrowserReportPayload,
  type FrozenPaidReport,
  type FrozenProviderStatuses,
  type PaidReportEntitlements,
  type ReportDeliveryResponse,
} from "@workspace/validation";

import {
  InvalidFrozenReportError,
  ReportNotFoundError,
  type DeliverableReportRecord,
  type ReportDeliveryRepository,
} from "./types.js";

const DISCLAIMER =
  "InvoiceGuard reports information found in the sources identified above. It is not legal or financial advice, a credit decision, or a guarantee of future payment. Verify important decisions independently.";

export class ReportDeliveryService {
  constructor(private readonly repository: ReportDeliveryRepository) {}

  async getOwnedReport(
    reportReference: string,
    clerkUserId: string,
  ): Promise<ReportDeliveryResponse> {
    const row = await this.repository.findByReference(reportReference);
    if (!row) throw new ReportNotFoundError();
    if (row.clerkUserId !== clerkUserId) throw new ReportNotFoundError(true);

    if (row.status === "pending" || row.status === "generating") {
      return { state: "not_ready", status: row.status, reportReference: row.reportReference };
    }
    if (row.status === "failed" || row.status === "refund_required" || row.status === "refunded") {
      return { state: "unavailable", status: row.status, reportReference: row.reportReference };
    }

    const artifact = frozenPaidReportSchema.safeParse(row.reportData);
    const statuses = frozenProviderStatusesSchema.safeParse(row.providerStatuses);
    const storedEntitlements = paidReportEntitlementsSchema.safeParse(row.entitlements);
    if (
      !artifact.success ||
      !statuses.success ||
      !storedEntitlements.success ||
      artifact.data.reportReference !== row.reportReference ||
      artifact.data.tier !== row.reportTier ||
      JSON.stringify(artifact.data.entitlements) !== JSON.stringify(storedEntitlements.data)
    ) {
      throw new InvalidFrozenReportError(row.reportReference);
    }

    const report = buildBrowserPayload(
      artifact.data,
      statuses.data,
      storedEntitlements.data,
      row.status,
      row.pdfArtifact,
      row.notification,
    );
    return { state: "report", report: browserReportPayloadSchema.parse(report) };
  }
}

function buildBrowserPayload(
  artifact: FrozenPaidReport,
  statuses: FrozenProviderStatuses,
  entitlements: PaidReportEntitlements,
  status: "ready" | "partial",
  pdfArtifact: DeliverableReportRecord["pdfArtifact"],
  notification: DeliverableReportRecord["notification"],
): BrowserReportPayload {
  const overview = artifact.facts.overview ?? {};
  const address = record(overview["registeredAddress"]);
  const sections = buildSections(artifact, entitlements);
  const sources = buildSources(statuses, entitlements);

  return {
    tier: artifact.tier,
    tierLabel: titleCase(artifact.tier),
    companyName: artifact.companyName,
    companyNumber: artifact.companyNumber,
    companyStatus: stringValue(overview["companyStatus"], "Not recorded"),
    companyType: stringValue(overview["companyType"], "Not recorded"),
    incorporated: displayDate(overview["incorporationDate"]),
    registeredAddress: addressLabel(address),
    industry: industryLabel(overview),
    reportReference: artifact.reportReference,
    generatedAt: displayDateTime(artifact.generatedAt),
    outcome: status === "ready" ? "complete" : "partial",
    sources,
    sections,
    interpretation: buildInterpretation(artifact, sources),
    disclaimer: DISCLAIMER,
    issueHref: `mailto:hello@invoiceguard.co.uk?subject=${encodeURIComponent(`Issue with report ${artifact.reportReference}`)}`,
    ...(pdfArtifact
      ? {
          pdfState:
            pdfArtifact?.status === "ready"
              ? ("ready" as const)
              : pdfArtifact?.status === "failed"
                ? ("failed" as const)
                : pdfArtifact
                  ? ("generating" as const)
                  : ("available" as const),
          ...(pdfArtifact?.status === "ready" && pdfArtifact.objectKey
            ? {
                pdfDownloadHref: `/api/reports/${encodeURIComponent(artifact.reportReference)}/pdf`,
              }
            : {}),
        }
      : {}),
    ...(notification
      ? {
          notification: {
            state:
              notification.status === "sent"
                ? ("sent" as const)
                : notification.status === "failed"
                  ? ("failed" as const)
                  : notification.status === "queued" && notification.attemptCount > 0
                    ? ("delayed" as const)
                    : ("sending" as const),
            destinationLabel: "your verified account email" as const,
            updatedAt: displayDateTime(notification.updatedAt.toISOString()),
          },
        }
      : {}),
  };
}

function buildSections(
  artifact: FrozenPaidReport,
  entitlements: PaidReportEntitlements,
): BrowserReportPayload["sections"] {
  const sections: BrowserReportPayload["sections"] = [];
  const overview = artifact.facts.overview ?? {};
  sections.push({
    id: "company-overview",
    title: "Company overview",
    description: "Canonical identity and current Companies House position.",
    facts: [
      { label: "Company status", value: stringValue(overview["companyStatus"], "Not recorded") },
      { label: "Incorporated", value: displayDate(overview["incorporationDate"]) },
      { label: "Registered area", value: addressLabel(record(overview["registeredAddress"])) },
      { label: "Industry", value: industryLabel(overview) },
    ],
  });

  if (entitlements.companiesHouse.addressHistory) {
    const address = record(overview["registeredAddress"]);
    sections.push({
      id: "address-history",
      title: "Registered address history",
      description: "Recorded registered-office information.",
      facts: [
        { label: "Current registered area", value: addressLabel(address) },
        { label: "Recorded changes", value: countLabel(address["changeFilings"], "change") },
      ],
    });
  }

  if (entitlements.registryTrust.enabled) {
    const ccj = artifact.facts.ccj ?? {};
    const judgements = arrayValue(ccj["judgements"]);
    const facts = [
      {
        label: "County Court Judgements",
        value: `${judgements.length} record${judgements.length === 1 ? "" : "s"} found`,
      },
      { label: "Court and year", value: judgementCourtYears(judgements) },
    ];
    if (entitlements.registryTrust.includeAmounts) {
      facts.push({ label: "Judgement amount", value: judgementAmounts(judgements) });
    }
    if (entitlements.registryTrust.includeSatisfaction) {
      facts.push({ label: "Satisfaction status", value: judgementSatisfaction(judgements) });
    }
    sections.push({
      id: "court-records",
      title: "Court records",
      description: "Registry Trust records checked after confirmed payment.",
      facts,
    });
  }

  if (entitlements.companiesHouse.officers) {
    const officers = arrayValue((artifact.facts.officers ?? {})["officers"]);
    sections.push({
      id: "directors",
      title: "Directors",
      description: "Companies House appointments included in this report.",
      facts: [
        { label: "Recorded officers", value: String(officers.length) },
        { label: "Appointments", value: officerAppointments(officers) },
      ],
    });
  }

  if (entitlements.companiesHouse.filingHistory) {
    const filings = arrayValue((artifact.facts.filing_history ?? {})["filings"]);
    sections.push({
      id: "filing-compliance",
      title: "Recent filing compliance",
      description: "Recent Companies House filing records.",
      facts: [{ label: "Filings returned", value: String(filings.length) }],
    });
  }

  if (entitlements.companiesHouse.charges) {
    const charges = arrayValue((artifact.facts.charges ?? {})["charges"]);
    sections.push({
      id: "registered-charges",
      title: "Registered charges",
      description: "Charges recorded at Companies House.",
      facts: [{ label: "Charges returned", value: String(charges.length) }],
    });
  }

  if (entitlements.companiesHouse.insolvency) {
    const insolvency = artifact.facts.insolvency ?? {};
    sections.push({
      id: "director-depth",
      title: "Director and insolvency checks",
      description: "Companies House, Gazette, and officer-depth checks.",
      facts: [{ label: "Checks recorded", value: String(Object.keys(insolvency).length) }],
    });
  }

  if (entitlements.fairPaymentCode) {
    const fairPayment = artifact.facts.fair_payment_code ?? {};
    sections.push({
      id: "fair-payment-code",
      title: "Fair Payment Code",
      description: "Small Business Commissioner public status.",
      facts: [
        {
          label: "Status",
          value: stringValue(fairPayment["statusLabel"], "No current award found"),
        },
        { label: "Award level", value: stringValue(fairPayment["awardLevel"], "Not recorded") },
      ],
    });
  }

  if (entitlements.evidenceCoverage && artifact.evidenceCoverage) {
    sections.push({
      id: "confidence-indicator",
      title: "Evidence coverage",
      description: "Completeness of checked sources, not a risk score.",
      facts: [
        {
          label: "Source coverage",
          value: `${artifact.evidenceCoverage.completed} completed; ${artifact.evidenceCoverage.failed} failed`,
        },
      ],
    });
  }
  return sections;
}

function buildSources(
  statuses: FrozenProviderStatuses,
  entitlements: PaidReportEntitlements,
): BrowserReportPayload["sources"] {
  const entitled = new Set<string>(["companies_house"]);
  if (entitlements.registryTrust.enabled) entitled.add("registry_trust");
  if (entitlements.londonGazette) entitled.add("london_gazette");
  if (entitlements.insolvencyDisqualifiedOfficers) entitled.add("insolvency_disqualified_officers");
  if (entitlements.fairPaymentCode) entitled.add("fair_payment_code");

  const grouped = new Map<string, FrozenProviderStatuses["checked"]>();
  for (const check of statuses.checked) {
    if (!entitled.has(check.provider)) continue;
    grouped.set(check.provider, [...(grouped.get(check.provider) ?? []), check]);
  }
  return [...entitled].map((provider) => {
    const checks = grouped.get(provider) ?? [];
    const failed = checks.find((check) => check.status === "failed");
    const latest = checks.at(-1);
    if (!latest) {
      return {
        status: "unavailable" as const,
        label: providerLabel(provider),
        detail: "No frozen source result was recorded.",
      };
    }
    return failed
      ? {
          status: "failed" as const,
          label: providerLabel(provider),
          checkedAt: displayDateTime(failed.checkedAt),
          detail: "The entitled source could not be completed. No clean conclusion is shown.",
        }
      : {
          status: "success" as const,
          label: providerLabel(provider),
          checkedAt: displayDateTime(latest.checkedAt),
          detail: `${checks.length} entitled check${checks.length === 1 ? "" : "s"} completed.`,
        };
  });
}

function buildInterpretation(
  artifact: FrozenPaidReport,
  sources: BrowserReportPayload["sources"],
): BrowserReportPayload["interpretation"] {
  const interpretation = artifact.interpretation;
  if (!interpretation) {
    return {
      status: "unavailable",
      heading: "AI interpretation unavailable",
      message: "No interpretation was stored with this report.",
    };
  }
  if (interpretation.status !== "ready") {
    return interpretation.status === "safety_fallback"
      ? {
          status: "safety_fallback",
          heading: "AI interpretation withheld",
          message:
            "The interpretation did not pass InvoiceGuard's output safeguards. Source facts remain available.",
        }
      : {
          status: "unavailable",
          heading: "AI interpretation unavailable",
          message: "The factual report remains available without an AI interpretation.",
        };
  }
  const paragraphs = [interpretation.output.summary];
  const unavailableSources = sources
    .filter((source) => source.status !== "success")
    .map((source) => source.label);
  return unavailableSources.length
    ? {
        status: "partial_source",
        heading: "AI interpretation",
        generatedAt: displayDateTime(interpretation.generatedAt),
        unavailableSources,
        paragraphs,
      }
    : {
        status: "ready",
        heading: "AI interpretation",
        generatedAt: displayDateTime(interpretation.generatedAt),
        paragraphs,
      };
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function displayDate(value: unknown): string {
  if (typeof value !== "string") return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not recorded"
    : new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Europe/London" }).format(
        date,
      );
}

function displayDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
    timeZoneName: "short",
  }).format(new Date(value));
}

function addressLabel(value: Record<string, unknown>): string {
  const parts = [value["locality"], value["region"], value["country"]].filter(
    (part): part is string => typeof part === "string" && Boolean(part.trim()),
  );
  return parts.join(", ") || "Not recorded";
}

function industryLabel(overview: Record<string, unknown>): string {
  const codes = arrayValue(overview["sicCodes"]).filter(
    (value): value is string => typeof value === "string",
  );
  return codes.length ? `SIC ${codes.join(", ")}` : "Not recorded";
}

function countLabel(value: unknown, singular: string): string {
  const count = arrayValue(value).length;
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function judgementCourtYears(judgements: unknown[]): string {
  const labels = judgements
    .map((item) => {
      const judgement = record(item);
      return [judgement["courtName"], judgement["judgementYear"]]
        .filter((value) => typeof value === "string" || typeof value === "number")
        .join(", ");
    })
    .filter(Boolean);
  return labels.join("; ") || "No records found";
}

function judgementAmounts(judgements: unknown[]): string {
  const amounts = judgements
    .map((item) => record(item)["amountPence"])
    .filter((value): value is number => typeof value === "number")
    .map((value) =>
      new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value / 100),
    );
  return amounts.join("; ") || "Not recorded";
}

function judgementSatisfaction(judgements: unknown[]): string {
  const values = judgements
    .map((item) => record(item)["satisfied"])
    .filter((value): value is boolean => typeof value === "boolean");
  if (!values.length) return "Not recorded";
  return values.every(Boolean) ? "All shown as satisfied" : "One or more not shown as satisfied";
}

function officerAppointments(officers: unknown[]): string {
  const labels = officers.map((item) => {
    const officer = record(item);
    const name = stringValue(officer["name"], "Name not recorded");
    const appointed = displayDate(officer["appointedOn"]);
    return `${name} — ${appointed}`;
  });
  return labels.join("; ") || "No appointments returned";
}

function providerLabel(provider: string): string {
  return (
    (
      {
        companies_house: "Companies House",
        registry_trust: "Registry Trust court records",
        london_gazette: "London Gazette",
        insolvency_disqualified_officers: "Insolvency and disqualified officers",
        fair_payment_code: "Fair Payment Code",
      } as Record<string, string>
    )[provider] ?? provider
  );
}

function titleCase(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
