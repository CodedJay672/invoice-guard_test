import type { Express, NextFunction, Request, Response } from "express";

import { sendApiError } from "../http.js";
import type { RequestIdentityResolver } from "../request-context.js";
import { AdminRepository, type AdminCollection } from "./repository.js";

const collections = new Set<AdminCollection>([
  "reports",
  "payments",
  "refunds",
  "providers",
  "searches",
  "alerts",
  "maintenance",
]);

export function registerAdminRoutes(
  app: Express,
  repository: AdminRepository,
  identityResolver: RequestIdentityResolver,
  adminEmail: string,
): void {
  app.get("/admin/overview", (request, response, next) => {
    if (!authorize(request, response, identityResolver, adminEmail)) return;
    void repository
      .overview()
      .then((data) => response.json({ data }))
      .catch(next);
  });
  app.get("/admin/:collection", (request: Request, response: Response, next: NextFunction) => {
    if (!authorize(request, response, identityResolver, adminEmail)) return;
    const collection = request.params["collection"] as AdminCollection;
    const page = Number(request.query["page"] ?? 1);
    const limit = Number(request.query["limit"] ?? 25);
    if (
      !collections.has(collection) ||
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      sendApiError(response, 400, "invalid_admin_query", "Check the collection, page, and limit.");
      return;
    }
    void repository
      .collection(collection, page, limit)
      .then((data) => response.json({ data }))
      .catch(next);
  });
}

function authorize(
  request: Request,
  response: Response,
  identityResolver: RequestIdentityResolver,
  adminEmail: string,
): boolean {
  const identity = identityResolver(request);
  if (!identity.clerkUserId || !identity.verifiedEmail) {
    sendApiError(response, 401, "authentication_required", "Sign in with a verified email.");
    return false;
  }
  if (identity.verifiedEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    sendApiError(response, 403, "admin_required", "Administrator access is required.");
    return false;
  }
  return true;
}
