import Link from "next/link";
import type {
  CompaniesHouseDisqualification,
  CompaniesHouseNaturalDisqualifiedOfficer,
  CompaniesHousePermissionToAct,
  CompaniesHouseRegisteredOfficeAddress,
} from "@workspace/types";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ProviderMetadata } from "@/components/provider-metadata/ProviderMetadata";
import { getNaturalDisqualifiedOfficer } from "@/lib/data/disqualified-officers";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ "officer-id": string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const [{ "officer-id": officerId }, query] = await Promise.all([params, searchParams]);
  const result = await getNaturalDisqualifiedOfficer(officerId);
  const back = query.q
    ? `/search?q=${encodeURIComponent(query.q)}&tab=disqualifications&type=natural&page=${encodeURIComponent(query.page ?? "1")}`
    : "/search?tab=disqualifications&type=natural";
  return (
    <main className="min-h-svh bg-page px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          className="text-sm font-medium text-brand-navy underline decoration-brand-teal underline-offset-4 focus-visible:ring-2 focus-visible:ring-focus"
          href={back}
        >
          Back to people results
        </Link>
        {result.status !== "success" ? (
          <Alert variant="critical">
            <AlertTitle>Officer details could not be retrieved</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        ) : (
          <NaturalOfficerDetails officer={result.data} />
        )}
      </div>
    </main>
  );
}

function NaturalOfficerDetails({ officer }: { officer: CompaniesHouseNaturalDisqualifiedOfficer }) {
  const name = [
    officer.title,
    officer.forename,
    officer.otherForenames,
    officer.surname,
    officer.honours,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <>
      <header>
        <p className="text-sm font-semibold text-brand-teal">Companies House public record</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-navy">{name}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <OptionalFact label="Date of birth" value={officer.dateOfBirth} />
          <OptionalFact label="Nationality" value={officer.nationality} />
          <OptionalFact label="Person number" value={officer.personNumber} />
        </dl>
      </header>
      <Disqualifications items={officer.disqualifications} />
      <Permissions items={officer.permissionsToAct} />
      <ProviderMetadata payload={officer.providerPayload} />
    </>
  );
}

function Disqualifications({ items }: { items: CompaniesHouseDisqualification[] }) {
  return (
    <section aria-labelledby="natural-disqualifications-heading" className="space-y-4">
      <h2 id="natural-disqualifications-heading" className="text-xl font-semibold text-brand-navy">
        Disqualifications
      </h2>
      {items.length ? (
        items.map((item, index) => (
          <Card key={`${item.caseIdentifier ?? "case"}-${index}`}>
            <CardHeader>
              <CardTitle>{item.disqualificationType ?? `Disqualification ${index + 1}`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <OptionalFact label="Disqualified from" value={item.disqualifiedFrom} />
                <OptionalFact label="Disqualified until" value={item.disqualifiedUntil} />
                <OptionalFact label="Case identifier" value={item.caseIdentifier} />
                <OptionalFact label="Court" value={item.courtName} />
                <OptionalFact label="Heard on" value={item.heardOn} />
                <OptionalFact label="Undertaken on" value={item.undertakenOn} />
              </dl>
              {item.address ? <Fact label="Address" value={formatAddress(item.address)} /> : null}
              {item.companyNames.length ? (
                <List label="Company names" values={item.companyNames} />
              ) : null}
              {item.reason ? (
                <dl className="grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
                  <OptionalFact label="Act" value={item.reason.act} />
                  <OptionalFact label="Article" value={item.reason.article} />
                  <OptionalFact label="Section" value={item.reason.section} />
                  <OptionalFact
                    label="Reason identifier"
                    value={item.reason.descriptionIdentifier}
                  />
                </dl>
              ) : null}
              {item.lastVariation.length ? (
                <div>
                  <h3 className="font-semibold text-content">Variation history</h3>
                  {item.lastVariation.map((variation, variationIndex) => (
                    <dl
                      key={variationIndex}
                      className="mt-2 grid gap-2 rounded-md border border-line p-3 text-sm sm:grid-cols-3"
                    >
                      <OptionalFact label="Varied on" value={variation.variedOn} />
                      <OptionalFact label="Court" value={variation.courtName} />
                      <OptionalFact label="Case identifier" value={variation.caseIdentifier} />
                    </dl>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-sm text-content-muted">No disqualification entries were returned.</p>
      )}
    </section>
  );
}

function Permissions({ items }: { items: CompaniesHousePermissionToAct[] }) {
  return (
    <section aria-labelledby="natural-permissions-heading" className="space-y-4">
      <h2 id="natural-permissions-heading" className="text-xl font-semibold text-brand-navy">
        Permissions to act
      </h2>
      {items.length ? (
        items.map((permission, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <OptionalFact label="Court" value={permission.courtName} />
                <OptionalFact label="Granted on" value={permission.grantedOn} />
                <OptionalFact label="Expires on" value={permission.expiresOn} />
              </dl>
              <List label="Company names" values={permission.companyNames} />
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-sm text-content-muted">No permissions to act were returned.</p>
      )}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-content-muted">{label}</dt>
      <dd className="font-medium text-content">{value}</dd>
    </div>
  );
}
function OptionalFact({ label, value }: { label: string; value: string | undefined }) {
  return value ? <Fact label={label} value={value} /> : null;
}
function List({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <h3 className="text-sm text-content-muted">{label}</h3>
      <ul className="mt-1 list-disc pl-5 text-sm text-content">
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </div>
  );
}
function formatAddress(address: Partial<CompaniesHouseRegisteredOfficeAddress>): string {
  return [
    address.premises,
    address.addressLine_1,
    address.addressLine_2,
    address.locality,
    address.region,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}
