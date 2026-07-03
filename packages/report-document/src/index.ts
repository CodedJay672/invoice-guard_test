export interface PremiumDocumentModel {
  companyName: string;
  companyNumber: string;
  reportReference: string;
  generatedAt: string;
  sources: Array<{ label: string; status: string; detail: string }>;
  sections: Array<{ title: string; body: string }>;
  interpretation: string;
  disclaimer: string;
  issueUrl: string;
  complianceVersion: string;
  flagSummary?: { heading: string; paragraphs: string[] } | undefined;
}

export function renderPremiumDocumentHtml(model: PremiumDocumentModel): string {
  const sourceRows = model.sources
    .map(
      (source) =>
        `<li><strong>${escapeHtml(source.label)}</strong><br>${escapeHtml(source.detail)}<br>Status: ${escapeHtml(source.status)}</li>`,
    )
    .join("");
  const sections = model.sections
    .map(
      (section) =>
        `<section><h2>${escapeHtml(section.title)}</h2>${section.body
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join("")}</section>`,
    )
    .join("");
  const flagSummary = model.flagSummary
    ? `<section><h2>${escapeHtml(model.flagSummary.heading)}</h2>${model.flagSummary.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`
    : "";
  const interpretationHtml = model.interpretation
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(model.reportReference)}</title><style>${premiumDocumentCss}</style></head><body><article class="premium-pdf-page premium-pdf-page-one"><header><p class="eyebrow">InvoiceGuard</p><h1>Premium company report</h1><h2>${escapeHtml(model.companyName)}</h2><dl><div><dt>Company number</dt><dd>${escapeHtml(model.companyNumber)}</dd></div><div><dt>Report reference</dt><dd>${escapeHtml(model.reportReference)}</dd></div><div><dt>Generated</dt><dd>${escapeHtml(model.generatedAt)}</dd></div></dl></header><section><h2>Source status</h2><ul>${sourceRows}</ul></section><aside><h2>Important information</h2><p>${escapeHtml(model.disclaimer)}</p><p>Report an issue: ${escapeHtml(model.issueUrl)}</p></aside></article><article class="premium-pdf-page"><section><h2>AI interpretation</h2>${interpretationHtml}</section>${flagSummary}${sections}<footer>Report reference ${escapeHtml(model.reportReference)} · ${escapeHtml(model.complianceVersion)}</footer></article></body></html>`;
}

export const premiumDocumentCss = `
@page { size: A4; margin: 14mm; }
* { box-sizing: border-box; }
body { margin: 0; color: CanvasText; background: Canvas; font: 10pt/1.45 system-ui, sans-serif; }
.premium-pdf-page { break-after: page; min-height: 268mm; display: flex; flex-direction: column; gap: 6mm; padding: 8mm; }
.premium-pdf-page:last-child { break-after: auto; }
h1 { font-size: 24pt; margin: 0 0 2mm; }
h2 { font-size: 14pt; margin: 0 0 2mm; }
.eyebrow, dt { font-size: 8pt; text-transform: uppercase; letter-spacing: .08em; }
dl, ul { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3mm; padding: 0; }
li, section, aside { break-inside: avoid; border: 1px solid GrayText; border-radius: 2mm; padding: 3mm; list-style: none; }
dd { margin: 1mm 0 0; font-weight: 600; }
aside, footer { margin-top: auto; }
footer { border-top: 1px solid GrayText; padding-top: 3mm; font-size: 8pt; }
`;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
