import { reportReferenceSchema } from "@workspace/validation";
import { createLogger } from "@workspace/logger";
import type { Express, NextFunction, Request, Response } from "express";

import { sendApiError } from "../http.js";
import type { RequestIdentityResolver } from "../request-context.js";
import { ReportDeliveryService } from "./service.js";
import { InvalidFrozenReportError, ReportNotFoundError } from "./types.js";

const logger = createLogger({ name: "invoiceguard-report-delivery" });

export function registerReportDeliveryRoutes(
  app: Express,
  service: ReportDeliveryService,
  requestIdentityResolver: RequestIdentityResolver,
): void {
  app.get(
    "/reports/:reportReference",
    (request: Request, response: Response, next: NextFunction) => {
      void handleReport(request, response, service, requestIdentityResolver).catch(next);
    },
  );
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
