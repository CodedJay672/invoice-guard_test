import { reportReferenceSchema } from "@workspace/validation";
import { createLogger } from "@workspace/logger";
import type { Express, NextFunction, Request, Response } from "express";

import { sendApiError } from "../http.js";
import type { RequestIdentityResolver } from "../request-context.js";
import { ReportDeliveryService } from "./service.js";
import { InvalidFrozenReportError, ReportNotFoundError } from "./types.js";
import { PdfAccessService, PdfNotReadyError, PdfObjectMissingError } from "./pdf-access.js";

const logger = createLogger({ name: "invoiceguard-report-delivery" });

export function registerReportDeliveryRoutes(
  app: Express,
  service: ReportDeliveryService,
  requestIdentityResolver: RequestIdentityResolver,
  pdfAccessService?: PdfAccessService,
): void {
  app.get(
    "/reports/:reportReference",
    (request: Request, response: Response, next: NextFunction) => {
      void handleReport(request, response, service, requestIdentityResolver).catch(next);
    },
  );
  if (pdfAccessService) {
    app.get(
      "/reports/:reportReference/pdf",
      (request: Request, response: Response, next: NextFunction) => {
        void handlePdfDownload(request, response, pdfAccessService, requestIdentityResolver).catch(
          next,
        );
      },
    );
    app.post(
      "/reports/:reportReference/pdf/retry",
      (request: Request, response: Response, next: NextFunction) => {
        void handlePdfRetry(request, response, pdfAccessService, requestIdentityResolver).catch(
          next,
        );
      },
    );
  }
}

async function handlePdfDownload(
  request: Request,
  response: Response,
  service: PdfAccessService,
  identityResolver: RequestIdentityResolver,
): Promise<void> {
  const input = pdfRequest(request, response, identityResolver);
  if (!input) return;
  try {
    response.json({
      data: { url: await service.createDownloadUrl(input.reference, input.clerkUserId) },
    });
  } catch (error) {
    handlePdfError(error, response);
  }
}

async function handlePdfRetry(
  request: Request,
  response: Response,
  service: PdfAccessService,
  identityResolver: RequestIdentityResolver,
): Promise<void> {
  const input = pdfRequest(request, response, identityResolver);
  if (!input) return;
  try {
    response.json({ data: { state: await service.retry(input.reference, input.clerkUserId) } });
  } catch (error) {
    handlePdfError(error, response);
  }
}

function pdfRequest(
  request: Request,
  response: Response,
  identityResolver: RequestIdentityResolver,
): { reference: string; clerkUserId: string } | undefined {
  const reference = reportReferenceSchema.safeParse(request.params["reportReference"]);
  if (!reference.success) {
    sendApiError(response, 400, "invalid_report_reference", "Report reference is invalid.");
    return undefined;
  }
  const identity = identityResolver(request);
  if (!identity.clerkUserId || !identity.verifiedEmail) {
    sendApiError(response, 401, "authentication_required", "Sign in with a verified email.");
    return undefined;
  }
  return { reference: reference.data, clerkUserId: identity.clerkUserId };
}

function handlePdfError(error: unknown, response: Response): void {
  if (error instanceof ReportNotFoundError) {
    sendApiError(response, 404, "report_not_found", "Report was not found.");
    return;
  }
  if (error instanceof PdfNotReadyError) {
    sendApiError(response, 409, "pdf_not_ready", "The PDF is not ready.");
    return;
  }
  if (error instanceof PdfObjectMissingError) {
    sendApiError(response, 503, "pdf_object_missing", "The PDF is temporarily unavailable.");
    return;
  }
  throw error;
}

async function handleReport(
  request: Request,
  response: Response,
  service: ReportDeliveryService,
  requestIdentityResolver: RequestIdentityResolver,
): Promise<void> {
  const reference = reportReferenceSchema.safeParse(request.params["reportReference"]);
  if (!reference.success) {
    sendApiError(response, 400, "invalid_report_reference", "Report reference is invalid.");
    return;
  }
  const identity = requestIdentityResolver(request);
  if (!identity.clerkUserId || !identity.verifiedEmail) {
    sendApiError(response, 401, "authentication_required", "Sign in with a verified email.");
    return;
  }
  try {
    response.json({ data: await service.getOwnedReport(reference.data, identity.clerkUserId) });
  } catch (error) {
    if (error instanceof ReportNotFoundError) {
      sendApiError(
        response,
        404,
        error.accessDenied ? "report_access_denied" : "report_not_found",
        "Report was not found.",
      );
      return;
    }
    if (error instanceof InvalidFrozenReportError) {
      logger.error(
        { reportReference: error.reportReference },
        "Frozen report failed delivery validation",
      );
      sendApiError(
        response,
        503,
        "report_unavailable",
        "Report delivery is temporarily unavailable.",
      );
      return;
    }
    throw error;
  }
}
