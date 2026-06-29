import { notFound } from "next/navigation";

import { loadWebProxyConfig } from "@workspace/config/web";

import { AuthPanel, type AuthPanelState } from "@/components/auth/AuthPanel";
import {
  isAuthPreviewEnabled,
  parseSafeReturnPath,
  resolveAuthFixtureName,
} from "@/components/auth/fixtures";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const environment = loadWebProxyConfig().environment;
  if (!isAuthPreviewEnabled(environment)) notFound();
  const params = await searchParams;
  const fixture = resolveAuthFixtureName(singleValue(params.fixture), environment);
  const returnTo = parseSafeReturnPath(singleValue(params.returnTo));
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <AuthPanel
        initialState={panelState(fixture, "sign-in")}
        fixtureName={fixture}
        returnTo={returnTo}
      />
    </div>
  );
}

function panelState(fixture: string | undefined, fallback: AuthPanelState): AuthPanelState {
  const supported: AuthPanelState[] = [
    "sign-in",
    "sign-up",
    "callback-loading",
    "auth-error",
    "signed-in",
    "signing-out",
    "unverified-email",
  ];
  return supported.some((state) => state === fixture) ? (fixture as AuthPanelState) : fallback;
}

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}
