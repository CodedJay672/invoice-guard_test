import process from "node:process";

const requiredValues = [
  "APP_URL",
  "DATABASE_URL",
  "REDIS_URL",
  "WEB_API_SHARED_SECRET",
  "SEARCH_IP_HASH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_ALERT_EMAIL",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "POSTMARK_API_KEY",
  "POSTMARK_FROM_EMAIL",
  "ANTHROPIC_API_KEY",
  "COMPANIES_HOUSE_API_KEY",
  "R2_ENDPOINT",
  "R2_BUCKET",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "PDF_COMPLIANCE_VERSION",
];
const requiredApprovals = [
  "REGISTRY_TRUST_ACCESS_APPROVED",
  "FAIR_PAYMENT_CODE_ACCESS_APPROVED",
  "DISCLAIMER_APPROVED",
  "ISSUE_CONTACT_APPROVED",
  "ICO_CONFIRMED",
  "ALERT_ROUTING_VERIFIED",
  "BACKUP_RESTORE_VERIFIED",
  "BRANCH_PROTECTION_VERIFIED",
  "PAID_LAUNCH_APPROVED",
];

const missingValues = requiredValues.filter((name) => !process.env[name]?.trim());
const missingApprovals = requiredApprovals.filter(
  (name) => process.env[name]?.trim().toLowerCase() !== "true",
);

if (process.env.REGISTRY_TRUST_PROVIDER_MODE !== "live") {
  missingApprovals.push("REGISTRY_TRUST_PROVIDER_MODE=live");
}
if (process.env.COMPANIES_HOUSE_PROVIDER_MODE !== "live") {
  missingApprovals.push("COMPANIES_HOUSE_PROVIDER_MODE=live");
}
if (process.env.PDF_COMPLIANCE_VERSION === "fixture-v1") {
  missingApprovals.push("PDF_COMPLIANCE_VERSION must be approved");
}

if (missingValues.length || missingApprovals.length) {
  console.error("InvoiceGuard launch preflight failed.");
  if (missingValues.length) console.error(`Missing configuration: ${missingValues.join(", ")}`);
  if (missingApprovals.length) console.error(`Missing approvals: ${missingApprovals.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("InvoiceGuard launch preflight passed. Secret values were not printed.");
}
