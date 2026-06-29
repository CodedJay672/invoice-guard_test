import { SignIn, SignUp } from "@clerk/nextjs";

import { loadWebProxyConfig } from "@workspace/config/web";

import { AuthPanel, type AuthPanelState } from "./AuthPanel";
import { parseSafeReturnPath, resolveAuthFixtureName } from "./fixtures";

type ClerkAuthScreenProps = {
  mode: "sign-in" | "sign-up";
  fixture: string | undefined;
  returnTo: string | undefined;
};

export function ClerkAuthScreen({ mode, fixture, returnTo }: ClerkAuthScreenProps) {
  const environment = loadWebProxyConfig().environment;
  const fixtureName = resolveAuthFixtureName(fixture, environment);
  const safeReturnTo = parseSafeReturnPath(returnTo);

  if (fixtureName) {
    return (
      <AuthPanel
        initialState={panelState(fixtureName, mode)}
        fixtureName={fixtureName}
        returnTo={safeReturnTo}
      />
    );
  }

  return mode === "sign-in" ? (
    <SignIn
      path="/sign-in"
      routing="path"
      fallbackRedirectUrl={safeReturnTo}
      appearance={{
        elements: {
          formButtonPrimary: "text-blue-50"
        }
      }}
      signUpUrl="/sign-up"
    />
  ) : (
    <SignUp
      path="/sign-up"
      routing="path"
      fallbackRedirectUrl={safeReturnTo}
      signInUrl="/sign-in"
    />
  );
}

function panelState(fixture: string, fallback: AuthPanelState): AuthPanelState {
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
