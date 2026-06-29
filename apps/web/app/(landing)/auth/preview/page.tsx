import { notFound } from "next/navigation";

import { loadWebProxyConfig } from "@workspace/config/web";

import { AccountControl } from "@/components/auth/AccountControl";
import { AuthPanel, type AuthPanelState } from "@/components/auth/AuthPanel";
import { ReportAccessState } from "@/components/auth/ReportAccessState";
import {
  authHref,
  isAuthPreviewEnabled,
  resolveAuthFixtureName,
  type AuthFixtureName,
} from "@/components/auth/fixtures";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const environment = loadWebProxyConfig().environment;
  if (!isAuthPreviewEnabled(environment)) notFound();
  const params = await searchParams;
  const fixture = resolveAuthFixtureName(singleValue(params.fixture), environment) ?? "signed-out";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-brand-teal">Development preview</p>
        <h1 className="text-3xl font-semibold text-brand-navy">Authentication states</h1>
        <p className="mt-2 text-content-muted">
          Deterministic presentation only. Clerk and authorization arrive in AUTH-B.
        </p>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="navigation-preview-heading">
        <h2 id="navigation-preview-heading" className="text-xl font-semibold text-content">
          Account navigation
        </h2>
        <div className="flex min-h-16 items-center justify-end rounded-lg border border-line bg-surface p-3 shadow-sm">
          {fixture === "signed-in" ||
            fixture === "signing-out" ||
            fixture === "owner-access" ||
            fixture === "non-owner-access" ? (
            <AccountControl
              state="signed-in"
              email="verified.buyer@example.com"
              signingOut={fixture === "signing-out"}
            />
          ) : (
            <AccountControl state="signed-out" signInHref={authHref("/sign-in", "/search")} />
          )}
        </div>
      </section>

      {accessProps(fixture) ? (
        <ReportAccessState {...accessProps(fixture)!} />
      ) : (
        <AuthPanel
          initialState={authPanelState(fixture)}
          fixtureName={fixture}
          returnTo="/search"
        />
      )}
    </div>
  );
}

function authPanelState(fixture: AuthFixtureName): AuthPanelState {
  if (fixture === "signed-out") return "sign-in";
  if (fixture === "owner-access" || fixture === "non-owner-access" || fixture === "guest-access") {
    return "sign-in";
  }
  return fixture;
}

function accessProps(fixture: AuthFixtureName) {
  if (fixture === "owner-access")
    return { identity: "signed-in" as const, outcome: "owner" as const };
  if (fixture === "non-owner-access") {
    return { identity: "signed-in" as const, outcome: "non-owner" as const };
  }
  if (fixture === "guest-access")
    return { identity: "signed-out" as const, outcome: "guest" as const };
  return undefined;
}

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}
