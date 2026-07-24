type QueryParamValue = string | number | boolean | null | undefined;

const relativeUrlBase = "http://invoiceguard.local";

function isAbsoluteUrl(url: string): boolean {
  return /^[A-Za-z][A-Za-z\d+.-]*:/.test(url);
}

export function appendQueryParams(url: string, params: Record<string, QueryParamValue>): string {
  const parsedUrl = new URL(url, relativeUrlBase);

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      parsedUrl.searchParams.append(key, String(value));
    }
  }

  if (isAbsoluteUrl(url)) {
    return parsedUrl.toString();
  }

  if (url.startsWith("//")) {
    return `//${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  }

  const path = url.startsWith("/") ? parsedUrl.pathname : parsedUrl.pathname.replace(/^\//, "");

  return `${path}${parsedUrl.search}${parsedUrl.hash}`;
}
