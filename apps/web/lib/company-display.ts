import type { CompanyAddressPayload } from "@workspace/types";

export const companiesHouseUnavailable = "";

export function formatCompaniesHouseAddress(address: CompanyAddressPayload): string {
  return (
    [
      address.careOf,
      address.premises,
      address.addressLine1,
      address.addressLine2,
      address.locality,
      address.region,
      address.country,
      address.postalCode,
      address.poBox ? `PO Box ${address.poBox}` : undefined,
    ]
      .filter((part): part is string => Boolean(part?.trim()))
      .filter((part, index, parts) => parts.indexOf(part) === index)
      .join(", ") || companiesHouseUnavailable
  );
}

export function formatCompaniesHouseDate(value: string | undefined): string {
  if (!value) return companiesHouseUnavailable;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return companiesHouseUnavailable;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function companyTypeLabel(value: string | undefined): string {
  if (!value) return companiesHouseUnavailable;
  const labels: Record<string, string> = {
    ltd: "Private limited company",
    plc: "Public limited company",
    "private-limited-guarant-nsc": "Private company limited by guarantee without share capital",
    "limited-partnership": "Limited partnership",
    llp: "Limited liability partnership",
  };
  return labels[value.toLowerCase()] ?? sentenceCase(value.replaceAll("-", " "));
}

export function sentenceCase(value: string | undefined): string {
  if (!value) return companiesHouseUnavailable;
  const readable = value.replaceAll("_", " ").replaceAll("-", " ");
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

export function resolveFilingDescription(
  description: string,
  values?: Record<string, string>,
): string {
  const madeUpDate = values?.made_up_date
    ? formatCompaniesHouseDate(values.made_up_date)
    : undefined;

  if (description === "confirmation-statement-with-no-updates" && madeUpDate) {
    return `Confirmation statement made on ${madeUpDate} with no updates`;
  }

  const accountsType = description.match(/^accounts-with-accounts-type-(.+)$/)?.[1];
  if (accountsType && madeUpDate) {
    const labels: Record<string, string> = {
      "micro-entity": "Micro company accounts",
      small: "Small company accounts",
      full: "Full accounts",
      dormant: "Dormant company accounts",
      "total-exemption-full": "Total exemption full accounts",
    };
    return `${labels[accountsType] ?? `${sentenceCase(accountsType)} accounts`} made up to ${madeUpDate}`;
  }

  let result = description.replaceAll("-", " ");
  for (const [key, value] of Object.entries(values ?? {})) {
    result = result.replaceAll(`{${key}}`, value).replaceAll(`**${key}**`, value);
  }
  return sentenceCase(result);
}

export function filingDescriptionValueLabel(value: string): string {
  return sentenceCase(value.replaceAll("_", " "));
}

export function formatFilingDescriptionValue(key: string, value: string): string {
  return key.toLowerCase().includes("date") ? formatCompaniesHouseDate(value) : value;
}
