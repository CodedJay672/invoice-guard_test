import {
  companiesHouseNumberSchema,
  companySearchQuerySchema,
  freeCompanyTabPaginationQuerySchema,
  freeCompanyTabSchema,
} from "@workspace/validation";
import type { Express, NextFunction, Request, Response } from "express";

import { sendApiError } from "../http.js";
import type { RequestIdentityResolver } from "../request-context.js";

import type { AnonymousSearchRateLimiter } from "./rate-limit.js";
import { CompanyProviderError, CompanyService } from "./service.js";
import type { CompanyTabService } from "./tab-service.js";

export interface CompanyRouteDependencies {
  companyService: CompanyService;
  companyTabService?: CompanyTabService | undefined;
  anonymousSearchRateLimiter: AnonymousSearchRateLimiter;
  requestIdentityResolver: RequestIdentityResolver;
}

export function registerCompanyRoutes(app: Express, dependencies: CompanyRouteDependencies): void {
  app.get("/companies/search", (request: Request, response: Response, next: NextFunction) => {
    void handleCompanySearch(request, response, dependencies).catch(next);
  });

  app.get(
    "/companies/:companyNumber/tabs/:tab",
    (request: Request, response: Response, next: NextFunction) => {
      void handleCompanyTab(request, response, dependencies).catch(next);
    },
  );

  app.get(
    "/companies/:companyNumber/free-preview",
    (request: Request, response: Response, next: NextFunction) => {
      void handleFreePreview(request, response, dependencies).catch(next);
    },
  );

  app.get(
    "/companies/:companyNumber",
    (request: Request, response: Response, next: NextFunction) => {
      void handleCompanyProfile(request, response, dependencies).catch(next);
    },
  );
}

async function handleCompanyTab(
  request: Request,
  response: Response,
  dependencies: CompanyRouteDependencies,
): Promise<void> {
  if (!dependencies.companyTabService) {
    sendApiError(response, 503, "company_tabs_unavailable", "Company tab data is not configured.");
    return;
  }
  const companyNumber = companiesHouseNumberSchema.safeParse(request.params["companyNumber"]);
  const tab = freeCompanyTabSchema.safeParse(request.params["tab"]);
  const pagination = freeCompanyTabPaginationQuerySchema.safeParse(request.query);
  if (!companyNumber.success || !tab.success || !pagination.success) {
    sendApiError(
      response,
      400,
      "invalid_company_tab_request",
      "Enter a valid company number, tab, page, and limit.",
    );
    return;
  }

  const identity = dependencies.requestIdentityResolver(request);
  if (!identity.clerkUserId && identity.ipHash) {
    const result = await dependencies.anonymousSearchRateLimiter.check(identity.ipHash);
    if (!result.allowed) {
      response.status(429).json({
        error: {
          code: "anonymous_search_rate_limited",
          message: "Anonymous search limit reached. Please try again later.",
        },
        meta: { resetAt: result.resetAt },
      });
      return;
    }
  }

  try {
    const payload = await dependencies.companyTabService.getTab(
      companyNumber.data,
      tab.data,
      pagination.data.page,
      pagination.data.limit,
    );
    response.json({ data: { tab: payload } });
  } catch (error) {
    handleCompanyError(error, response);
  }
}

async function handleCompanySearch(
  request: Request,
  response: Response,
  dependencies: CompanyRouteDependencies,
): Promise<void> {
  const parsedQuery = companySearchQuerySchema.safeParse(request.query["q"]);

  if (!parsedQuery.success) {
    sendApiError(response, 400, "invalid_company_search_query", "Enter at least 2 characters.");
    return;
  }

  const identity = dependencies.requestIdentityResolver(request);

  if (!identity.clerkUserId && identity.ipHash) {
    const rateLimitResult = await dependencies.anonymousSearchRateLimiter.check(identity.ipHash);

    if (!rateLimitResult.allowed) {
      response.status(429).json({
        error: {
          code: "anonymous_search_rate_limited",
          message: "Anonymous search limit reached. Please try again later.",
        },
        meta: {
          resetAt: rateLimitResult.resetAt,
        },
      });
      return;
    }
  }

  try {
    const searchResult = await dependencies.companyService.searchCompanies(parsedQuery.data);

    await dependencies.companyService.recordSearch({
      clerkUserId: identity.clerkUserId,
      ipHash: identity.ipHash,
      query: parsedQuery.data,
      matchedCompaniesCount: searchResult.matches.length,
      selectedCompaniesHouseNumber: undefined,
    });

    response.json({
      data: searchResult,
    });
  } catch (error) {
    handleCompanyError(error, response);
  }
}

async function handleFreePreview(
  request: Request,
  response: Response,
  dependencies: CompanyRouteDependencies,
): Promise<void> {
  const parsedCompanyNumber = companiesHouseNumberSchema.safeParse(request.params["companyNumber"]);

  if (!parsedCompanyNumber.success) {
    sendApiError(
      response,
      400,
      "invalid_companies_house_number",
      "Companies House number must be 2-16 letters or numbers.",
    );
    return;
  }

  try {
    const preview = await dependencies.companyService.getFreePreview(parsedCompanyNumber.data);
    const identity = dependencies.requestIdentityResolver(request);

    await dependencies.companyService.recordSearch({
      clerkUserId: identity.clerkUserId,
      ipHash: identity.ipHash,
      query: parsedCompanyNumber.data,
      matchedCompaniesCount: 1,
      selectedCompaniesHouseNumber: preview.company.companiesHouseNumber,
    });

    response.json({
      data: {
        preview,
      },
    });
  } catch (error) {
    handleCompanyError(error, response);
  }
}

async function handleCompanyProfile(
  request: Request,
  response: Response,
  dependencies: CompanyRouteDependencies,
): Promise<void> {
  const parsedCompanyNumber = companiesHouseNumberSchema.safeParse(request.params["companyNumber"]);

  if (!parsedCompanyNumber.success) {
    sendApiError(
      response,
      400,
      "invalid_companies_house_number",
      "Companies House number must be 2-16 letters or numbers.",
    );
    return;
  }

  try {
    const company = await dependencies.companyService.getCompanyProfile(parsedCompanyNumber.data);
    const identity = dependencies.requestIdentityResolver(request);

    await dependencies.companyService.recordSearch({
      clerkUserId: identity.clerkUserId,
      ipHash: identity.ipHash,
      query: parsedCompanyNumber.data,
      matchedCompaniesCount: 1,
      selectedCompaniesHouseNumber: company.companiesHouseNumber,
    });

    response.json({
      data: {
        company,
      },
    });
  } catch (error) {
    handleCompanyError(error, response);
  }
}

function handleCompanyError(error: unknown, response: Response): void {
  if (error instanceof CompanyProviderError) {
    sendApiError(
      response,
      502,
      "companies_house_unavailable",
      "Company data could not be retrieved right now.",
    );
    return;
  }

  throw error;
}
