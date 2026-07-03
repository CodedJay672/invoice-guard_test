import { renderPremiumDocumentHtml } from "@workspace/report-document";

import type { PremiumPdfFixture } from "./fixtures";

export function PremiumPdfDocument({ fixture }: { fixture: PremiumPdfFixture }) {
  const { report } = fixture;
  const sections = report.navigation.flatMap((group) => group.sections);
  const sharedDocument = renderPremiumDocumentHtml({
    companyName: report.companyName,
    companyNumber: report.companyNumber,
    reportReference: report.reportReference,
    generatedAt: report.generatedAt,
    sources: report.sources.map((source) => ({
      label: source.label,
      status: source.status,
      detail: source.detail,
    })),
    sections: sections.map((section) => ({
      title: section.title,
      body: section.facts.map((fact) => `${fact.label}: ${fact.value}`).join("\n"),
    })),
    interpretation:
      report.interpretation.status === "ready" || report.interpretation.status === "partial_source"
        ? report.interpretation.paragraphs.join("\n\n")
        : "Interpretation unavailable for this fixture.",
    disclaimer: report.disclaimer,
    issueUrl: report.issueDisplayUrl,
    complianceVersion: "fixture-v1",
    ...(fixture.flagSummary.enabled ? { flagSummary: fixture.flagSummary } : {}),
  });

  return (
    <main className="premium-pdf-preview bg-page px-4 py-8 print:bg-surface print:p-0">
      <iframe
        title={`Premium PDF preview for ${report.companyName}`}
        srcDoc={sharedDocument}
        className="mx-auto min-h-[1120px] w-full max-w-4xl rounded-lg border border-line bg-surface shadow-sm print:min-h-screen print:max-w-none print:rounded-none print:border-0 print:shadow-none"
      />
    </main>
  );
}
