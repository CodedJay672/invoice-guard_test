import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { PaidReportEntitlements } from "@workspace/validation/paid-report";

export type JsonRecord = Record<string, unknown>;

export const reportTierEnum = pgEnum("report_tier", ["basic", "standard", "premium"]);

export const purchasedReportStatusEnum = pgEnum("purchased_report_status", [
  "pending",
  "generating",
  "ready",
  "partial",
  "failed",
  "refund_required",
  "refunded",
]);

export const providerStatusEnum = pgEnum("provider_status", ["success", "failed"]);

export const reportNotificationStatusEnum = pgEnum("report_notification_status", [
  "queued",
  "sending",
  "sent",
  "failed",
]);

export const reportNotificationTypeEnum = pgEnum("report_notification_type", [
  "owner_report_ready",
]);

export const reportPdfStatusEnum = pgEnum("report_pdf_status", [
  "queued",
  "generating",
  "ready",
  "failed",
]);

export const snapshotSourceContextEnum = pgEnum("snapshot_source_context", [
  "free_preview",
  "paid_report",
]);

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companiesHouseNumber: varchar("companies_house_number", { length: 16 }).notNull(),
    companyName: text("company_name").notNull(),
    companyStatus: varchar("company_status", { length: 64 }).notNull(),
    companyType: varchar("company_type", { length: 64 }),
    incorporationDate: timestamp("incorporation_date", { withTimezone: true }),
    registeredOfficeLocality: text("registered_office_locality"),
    registeredOfficeRegion: text("registered_office_region"),
    registeredOfficeCountry: text("registered_office_country"),
    sicCodes: jsonb("sic_codes")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    industryLabel: text("industry_label"),
    activeDirectorCount: integer("active_director_count"),
    lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companiesHouseNumberUnique: uniqueIndex("companies_companies_house_number_unique").on(
      table.companiesHouseNumber,
    ),
    companyNameIndex: index("companies_company_name_idx").on(table.companyName),
  }),
);

export const companyDataSnapshots = pgTable(
  "company_data_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companiesHouseNumber: varchar("companies_house_number", { length: 16 }).notNull(),
    reportId: uuid("report_id"),
    provider: varchar("provider", { length: 80 }).notNull(),
    operation: varchar("operation", { length: 120 }).notNull().default("legacy"),
    attempt: integer("attempt").notNull().default(1),
    sourceContext: snapshotSourceContextEnum("source_context").notNull(),
    reportTier: reportTierEnum("report_tier"),
    snapshotData: jsonb("snapshot_data")
      .$type<JsonRecord>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    snapshotHash: varchar("snapshot_hash", { length: 128 }).notNull(),
    status: providerStatusEnum("status").notNull(),
    errorCode: varchar("error_code", { length: 120 }),
    errorMessage: text("error_message"),
    retryable: boolean("retryable").notNull().default(false),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyFetchedIndex: index("company_data_snapshots_company_fetched_idx").on(
      table.companiesHouseNumber,
      table.fetchedAt,
    ),
    providerIndex: index("company_data_snapshots_provider_idx").on(table.provider),
    reportIndex: index("company_data_snapshots_report_idx").on(table.reportId),
    reportOperationAttemptUnique: uniqueIndex(
      "company_data_snapshots_report_provider_operation_attempt_unique",
    ).on(table.reportId, table.provider, table.operation, table.attempt),
    snapshotHashIndex: index("company_data_snapshots_hash_idx").on(table.snapshotHash),
  }),
);

export const searchLogs = pgTable(
  "search_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 128 }),
    ipHash: varchar("ip_hash", { length: 128 }),
    query: text("query").notNull(),
    matchedCompaniesCount: integer("matched_companies_count").notNull().default(0),
    selectedCompaniesHouseNumber: varchar("selected_companies_house_number", { length: 16 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    ipAnonymisedAt: timestamp("ip_anonymised_at", { withTimezone: true }),
  },
  (table) => ({
    createdAtIndex: index("search_logs_created_at_idx").on(table.createdAt),
    selectedCompanyIndex: index("search_logs_selected_company_idx").on(
      table.selectedCompaniesHouseNumber,
    ),
  }),
);

export const reportProducts = pgTable(
  "report_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tier: reportTierEnum("tier").notNull(),
    name: text("name").notNull(),
    pricePence: integer("price_pence").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("GBP"),
    includesPdf: boolean("includes_pdf").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    entitlements: jsonb("entitlements")
      .$type<JsonRecord>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tierUnique: uniqueIndex("report_products_tier_unique").on(table.tier),
    activeIndex: index("report_products_active_idx").on(table.isActive),
  }),
);

export const purchasedReports = pgTable(
  "purchased_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportReference: varchar("report_reference", { length: 64 }).notNull(),
    clerkUserId: varchar("clerk_user_id", { length: 128 }).notNull(),
    companiesHouseNumber: varchar("companies_house_number", { length: 16 }).notNull(),
    companyName: text("company_name").notNull(),
    reportTier: reportTierEnum("report_tier").notNull(),
    entitlements: jsonb("entitlements").$type<PaidReportEntitlements>().notNull(),
    stripePaymentId: varchar("stripe_payment_id", { length: 128 }),
    stripeCheckoutSessionId: varchar("stripe_checkout_session_id", { length: 128 }),
    amountPaidPence: integer("amount_paid_pence").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: purchasedReportStatusEnum("status").notNull().default("pending"),
    reportData: jsonb("report_data").$type<JsonRecord>(),
    providerStatuses: jsonb("provider_statuses")
      .$type<JsonRecord>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    pdfStorageUrl: text("pdf_storage_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    reportReferenceUnique: uniqueIndex("purchased_reports_reference_unique").on(
      table.reportReference,
    ),
    stripePaymentUnique: uniqueIndex("purchased_reports_stripe_payment_unique").on(
      table.stripePaymentId,
    ),
    stripeCheckoutSessionUnique: uniqueIndex("purchased_reports_checkout_session_unique").on(
      table.stripeCheckoutSessionId,
    ),
    companyIndex: index("purchased_reports_company_idx").on(table.companiesHouseNumber),
    statusIndex: index("purchased_reports_status_idx").on(table.status),
  }),
);

export const reportNotifications = pgTable(
  "report_notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => purchasedReports.id, { onDelete: "cascade" }),
    type: reportNotificationTypeEnum("type").notNull(),
    status: reportNotificationStatusEnum("status").notNull().default("queued"),
    attemptCount: integer("attempt_count").notNull().default(0),
    postmarkMessageId: varchar("postmark_message_id", { length: 128 }),
    failureCode: varchar("failure_code", { length: 80 }),
    failureKind: varchar("failure_kind", { length: 40 }),
    queuedAt: timestamp("queued_at", { withTimezone: true }).notNull().defaultNow(),
    submissionStartedAt: timestamp("submission_started_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    reportTypeUnique: uniqueIndex("report_notifications_report_type_unique").on(
      table.reportId,
      table.type,
    ),
    statusIndex: index("report_notifications_status_idx").on(table.status),
  }),
);

export const reportPdfArtifacts = pgTable(
  "report_pdf_artifacts",
  {
    reportId: uuid("report_id")
      .primaryKey()
      .references(() => purchasedReports.id, { onDelete: "cascade" }),
    status: reportPdfStatusEnum("status").notNull().default("queued"),
    attemptCount: integer("attempt_count").notNull().default(0),
    objectKey: text("object_key"),
    sha256: varchar("sha256", { length: 64 }),
    byteSize: integer("byte_size"),
    templateVersion: varchar("template_version", { length: 64 }).notNull(),
    complianceVersion: varchar("compliance_version", { length: 64 }).notNull(),
    failureCode: varchar("failure_code", { length: 80 }),
    failureMessage: text("failure_message"),
    generationStartedAt: timestamp("generation_started_at", { withTimezone: true }),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIndex: index("report_pdf_artifacts_status_idx").on(table.status),
    objectKeyUnique: uniqueIndex("report_pdf_artifacts_object_key_unique").on(table.objectKey),
  }),
);

export const fairPaymentCodeStatuses = pgTable(
  "fair_payment_code_statuses",
  {
    companiesHouseNumber: varchar("companies_house_number", { length: 16 }).primaryKey(),
    statusLabel: text("status_label").notNull(),
    awardLevel: text("award_level"),
    sourceReference: text("source_reference"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    verifiedAtIndex: index("fair_payment_code_statuses_verified_at_idx").on(table.verifiedAt),
  }),
);

export const stripeEvents = pgTable(
  "stripe_events",
  {
    id: varchar("id", { length: 128 }).notNull(),
    eventType: varchar("event_type", { length: 128 }).notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    payload: jsonb("payload").$type<JsonRecord>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    primaryKey: primaryKey({ columns: [table.id] }),
    eventTypeIndex: index("stripe_events_event_type_idx").on(table.eventType),
  }),
);

export const providerUsageLogs = pgTable(
  "provider_usage_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 80 }).notNull(),
    operation: varchar("operation", { length: 120 }).notNull(),
    companiesHouseNumber: varchar("companies_house_number", { length: 16 }),
    reportId: uuid("report_id"),
    reportTier: reportTierEnum("report_tier"),
    estimatedCostPence: integer("estimated_cost_pence"),
    status: providerStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerIndex: index("provider_usage_logs_provider_idx").on(table.provider),
    reportIndex: index("provider_usage_logs_report_idx").on(table.reportId),
    createdAtIndex: index("provider_usage_logs_created_at_idx").on(table.createdAt),
  }),
);

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminClerkUserId: varchar("admin_clerk_user_id", { length: 128 }).notNull(),
    action: varchar("action", { length: 120 }).notNull(),
    targetType: varchar("target_type", { length: 80 }).notNull(),
    targetId: varchar("target_id", { length: 128 }).notNull(),
    metadata: jsonb("metadata")
      .$type<JsonRecord>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    adminIndex: index("admin_audit_logs_admin_idx").on(table.adminClerkUserId),
    targetIndex: index("admin_audit_logs_target_idx").on(table.targetType, table.targetId),
    createdAtIndex: index("admin_audit_logs_created_at_idx").on(table.createdAt),
  }),
);
