import type { JsonValue, ProviderPayload } from "@workspace/types";

export function hasVisibleProviderValue(value: JsonValue): boolean {
  if (value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasVisibleProviderValue);
  if (typeof value === "object") return Object.values(value).some(hasVisibleProviderValue);
  return true;
}

function label(value: string): string {
  const text = value.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "companieshouse.gov.uk" ||
        url.hostname.endsWith(".companieshouse.gov.uk"))
    );
  } catch {
    return false;
  }
}

function MetadataValue({ value }: { value: JsonValue }) {
  if (Array.isArray(value)) {
    const items = value.filter(hasVisibleProviderValue);
    return (
      <ol className="grid gap-3">
        {items.map((item, index) => (
          <li key={index} className="border-l border-line pl-3">
            <MetadataValue value={item} />
          </li>
        ))}
      </ol>
    );
  }
  if (typeof value === "object" && value !== null) {
    return (
      <dl className="grid gap-3">
        {Object.entries(value)
          .filter(([, item]) => hasVisibleProviderValue(item))
          .map(([key, item]) => (
            <div key={key} className="min-w-0">
              <dt className="text-xs font-medium text-content-muted">{label(key)}</dt>
              <dd className="mt-1 text-sm wrap-break-word text-content">
                <MetadataValue value={item} />
              </dd>
            </div>
          ))}
      </dl>
    );
  }
  if (typeof value === "boolean") return <>{value ? "Yes" : "No"}</>;
  if (typeof value === "string" && isSafeUrl(value))
    return (
      <a
        href={value}
        className="text-brand-teal underline underline-offset-2"
        rel="noreferrer"
        target="_blank"
      >
        {value}
      </a>
    );
  return <>{String(value)}</>;
}

export function ProviderMetadata({ payload }: { payload: ProviderPayload | undefined }) {
  if (!payload || !hasVisibleProviderValue(payload)) return null;
  return (
    <details className="rounded-lg border border-line bg-surface p-4">
      <summary className="cursor-pointer font-semibold text-content focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none">
        Provider metadata
      </summary>
      <div className="mt-4 min-w-0 border-t border-line pt-4">
        <p className="mb-4 text-xs text-content-muted">
          Complete response data returned by Companies House.
        </p>
        <MetadataValue value={payload} />
      </div>
    </details>
  );
}
