import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { ProviderMetadata } from "@/components/provider-metadata/ProviderMetadata";
import { searchDisqualifiedOfficers } from "@/lib/data/disqualified-officers";
import { formatDateWithAge } from "./CompanySearchExperience";

export async function DisqualifiedOfficerResults({
  query,
  page,
  tier,
  subtype,
}: {
  query: string;
  page: number;
  tier?: string;
  subtype: "corporate" | "natural";
}) {
  const result = await searchDisqualifiedOfficers(query, page, subtype);
  if (result.status !== "success")
    return (
      <Alert
        variant={
          result.status === "rate_limited" || result.status === "invalid" ? "caution" : "critical"
        }
      >
        <AlertTitle>
          {result.status === "rate_limited"
            ? "Search limit reached"
            : "Disqualification search needs attention"}
        </AlertTitle>
        <AlertDescription>{result.message}</AlertDescription>
      </Alert>
    );
  const data = result.data;
  if (data.items.length === 0)
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            No matching {subtype === "natural" ? "people" : "corporate disqualified officers"}{" "}
            returned on this page
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-content-muted">
          Try a different{" "}
          {subtype === "natural" ? "person name" : "registered corporate officer name"}. Companies
          House pagination covers mixed record types, so this does not mean that no matching record
          exists.
        </CardContent>
      </Card>
    );
  const totalPages = Math.max(1, Math.ceil(data.totalResults / data.itemsPerPage));
  return (
    <section aria-labelledby="disqualification-results-heading" className="space-y-4">
      <h2 id="disqualification-results-heading" className="text-sm text-content-muted">
        {subtype === "natural" ? "People " : "Corporate "} returned on this Companies House result
        page for &quot;{query}&quot;.
      </h2>
      {data.items.map((officer) => (
        <article
          key={officer.officerId}
          className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm"
        >
          <Link
            className="block p-5 transition hover:border-brand-teal focus-visible:ring-2 focus-visible:ring-focus"
            href={`${subtype === "natural" ? "/disqualified-officers/natural" : "/disqualified-officers"}/${encodeURIComponent(officer.officerId)}?q=${encodeURIComponent(query)}&page=${page}`}
          >
            <h3 className="text-lg font-semibold text-brand-navy underline decoration-brand-teal underline-offset-4">
              {officer.title}
            </h3>
            {officer.description ? (
              <p className="mt-2 text-sm text-content">{officer.description}</p>
            ) : null}
            {officer.addressSnippet ? (
              <p className="mt-2 text-sm text-content-muted">{officer.addressSnippet}</p>
            ) : null}
            {officer.dateOfBirth ? (
              <p className="mt-2 text-xs text-content-muted">
                Date of birth: {formatDateWithAge(officer.dateOfBirth, undefined)}
              </p>
            ) : null}
            {officer.snippet ? (
              <p className="mt-3 border-l-2 border-line pl-3 text-sm text-content-muted">
                {officer.snippet}
              </p>
            ) : null}
          </Link>
          <ProviderMetadata payload={officer.providerPayload} />
        </article>
      ))}
      <nav
        aria-label="Disqualification result pages"
        className="flex items-center justify-between gap-4"
      >
        {page > 1 ? (
          <Button asChild variant="outline">
            <Link href={searchHref(query, page - 1, subtype, tier)}>Previous</Link>
          </Button>
        ) : (
          <span />
        )}
        <span className="text-sm text-content-muted">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Button asChild variant="outline">
            <Link href={searchHref(query, page + 1, subtype, tier)}>Next</Link>
          </Button>
        ) : (
          <span />
        )}
      </nav>
      <ProviderMetadata payload={data.providerPayload} />
    </section>
  );
}
function searchHref(query: string, page: number, subtype: "corporate" | "natural", tier?: string) {
  const params = new URLSearchParams({
    q: query,
    tab: "disqualifications",
    type: subtype,
    page: String(page),
  });
  if (tier) params.set("tier", tier);
  return `/search?${params}`;
}
