"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, LoaderCircle, LogOut, Mail } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";

import type { AuthFixtureName } from "./fixtures";

export type AuthPanelState =
  | "sign-in"
  | "sign-up"
  | "callback-loading"
  | "auth-error"
  | "signed-in"
  | "signing-out"
  | "unverified-email";

type AuthPanelProps = {
  initialState: AuthPanelState;
  returnTo: string;
  fixtureName?: AuthFixtureName | undefined;
};

export function AuthPanel({ initialState, returnTo, fixtureName }: AuthPanelProps) {
  const [state, setState] = useState<AuthPanelState>(initialState);

  useEffect(() => {
    if (!fixtureName && state === "callback-loading") {
      const timer = window.setTimeout(() => setState("signed-in"), 700);
      return () => window.clearTimeout(timer);
    }
    if (!fixtureName && state === "signing-out") {
      const timer = window.setTimeout(() => setState("sign-in"), 700);
      return () => window.clearTimeout(timer);
    }
  }, [fixtureName, state]);

  function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fixtureName) setState("callback-loading");
  }

  if (state === "callback-loading" || state === "signing-out") {
    const signingOut = state === "signing-out";
    return (
      <AuthCard
        title={signingOut ? "Signing you out" : "Completing sign in"}
        description={signingOut ? "Ending this browser session." : "Checking your account session."}
        badge="Please wait"
      >
        <div
          className="flex items-center gap-3 text-sm text-content"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          {signingOut ? "Signing out securely." : "Returning you to InvoiceGuard."}
        </div>
      </AuthCard>
    );
  }

  if (state === "auth-error") {
    return (
      <AuthCard
        title="We could not sign you in"
        description="Your company search and checkout details have not been changed."
        badge="Needs attention"
        badgeVariant="critical"
      >
        <Alert variant="critical">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Authentication was not completed</AlertTitle>
          <AlertDescription>
            Try again. If the problem continues, use guest checkout.
          </AlertDescription>
        </Alert>
        <Button type="button" variant="authoritative" onClick={() => setState("sign-in")}>
          Try sign in again
        </Button>
      </AuthCard>
    );
  }

  if (state === "signed-in") {
    return (
      <AuthCard
        title="You are signed in"
        description="Your verified account email can be used for report delivery."
        badge="Verified"
        badgeVariant="positive"
      >
        <Alert variant="positive">
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>Account verified</AlertTitle>
          <AlertDescription>verified.buyer@example.com</AlertDescription>
        </Alert>
        <Button asChild variant="authoritative">
          <Link href={returnTo}>
            Continue
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!fixtureName) setState("signing-out");
          }}
        >
          <LogOut data-icon="inline-start" />
          Sign out
        </Button>
      </AuthCard>
    );
  }

  if (state === "unverified-email") {
    return (
      <AuthCard
        title="Verify your email"
        description="A verified primary email is required for owned reports and guest-report claims."
        badge="Not verified"
        badgeVariant="caution"
      >
        <Alert variant="caution">
          <Mail aria-hidden="true" />
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription>
            Follow the verification link before using this account email for report ownership.
          </AlertDescription>
        </Alert>
        <Button type="button" variant="outline" onClick={() => setState("sign-in")}>
          Use another account
        </Button>
      </AuthCard>
    );
  }

  const signingUp = state === "sign-up";
  return (
    <AuthCard
      title={signingUp ? "Create your account" : "Sign in to InvoiceGuard"}
      description={
        signingUp
          ? "Use an account to own reports purchased with your verified email."
          : "Continue to your Phase A search, checkout, or report."
      }
      badge={signingUp ? "Create account" : "Account access"}
    >
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-content" htmlFor="auth-email">
            Email address
          </label>
          <Input
            id="auth-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <p className="text-sm text-content-muted">
            AUTH-B will replace this preview with Clerk&apos;s secure in-app component.
          </p>
        </div>
        <Button type="submit" variant="authoritative" className="min-h-11 w-full">
          {signingUp ? "Continue to verification" : "Continue securely"}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </form>
      <p className="text-sm text-content-muted">
        {signingUp ? "Already have an account?" : "New to InvoiceGuard?"}{" "}
        <button
          type="button"
          className="font-medium text-brand-navy underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          onClick={() => setState(signingUp ? "sign-in" : "sign-up")}
        >
          {signingUp ? "Sign in" : "Create an account"}
        </button>
      </p>
    </AuthCard>
  );
}

function AuthCard({
  title,
  description,
  badge,
  badgeVariant = "outline",
  children,
}: {
  title: string;
  description: string;
  badge: string;
  badgeVariant?: "outline" | "positive" | "caution" | "critical";
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle>
              <h1 className="text-2xl font-semibold text-brand-navy">{title}</h1>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">{children}</CardContent>
      <CardFooter>
        <p className="text-xs text-content-muted">
          Accounts are optional. Guest company search and checkout remain available.
        </p>
      </CardFooter>
    </Card>
  );
}
