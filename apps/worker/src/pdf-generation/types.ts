import type { FrozenPaidReport, FrozenProviderStatuses } from "@workspace/validation";
import type { ReportProductCode } from "@workspace/types";

export interface PdfArtifactRecord {
  reportId: string;
  reportReference: string;
  reportTier: ReportProductCode;
  reportStatus: "ready" | "partial";
  reportData: unknown;
  providerStatuses: unknown;
  status: "queued" | "generating" | "ready" | "failed";
  attemptCount: number;
  templateVersion: string;
  complianceVersion: string;
}

export interface PdfArtifactRepository {
  ensureQueued(
    reportId: string,
    templateVersion: string,
    complianceVersion: string,
  ): Promise<boolean>;
  findQueuedReportIds(): Promise<string[]>;
  claim(reportId: string): Promise<PdfArtifactRecord | undefined>;
  requeue(reportId: string): Promise<boolean>;
  complete(reportId: string, output: PdfOutput): Promise<void>;
  fail(reportId: string, code: string, message: string): Promise<void>;
}

export interface PdfOutput {
  objectKey: string;
  sha256: string;
  byteSize: number;
  generatedAt: Date;
}

export interface PdfRenderer {
  render(input: {
    report: FrozenPaidReport;
    statuses: FrozenProviderStatuses;
    compliance: ComplianceContent;
  }): Promise<Buffer>;
}

export interface PdfObjectStore {
  put(input: { key: string; body: Buffer; sha256: string }): Promise<void>;
}

export interface ComplianceContent {
  version: string;
  disclaimer: string;
  issueUrl: string;
  flagSummary?: { heading: string; paragraphs: string[] } | undefined;
}

export interface PdfLogger {
  info(context: Record<string, unknown>, message: string): void;
  warn(context: Record<string, unknown>, message: string): void;
  error(context: Record<string, unknown>, message: string): void;
}
