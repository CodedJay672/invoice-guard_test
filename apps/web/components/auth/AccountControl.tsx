"use client";

import { useEffect, useRef, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";

type AccountControlProps =
  | { state: "signed-out"; signInHref: string }
  | {
      state: "signed-in";
      email?: string;
      verified?: boolean;
      signingOut?: boolean;
    };

export function AccountControl(props: AccountControlProps) {
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (props.state === "signed-out") {
    return (
      <Button asChild variant="outline" className="min-h-11">
        <Link href={props.signInHref}>Sign in</Link>
      </Button>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        className="min-h-11 max-w-56"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((current) => !current)}
      >
        <UserRound data-icon="inline-start" />
        <span className="truncate">{props.email ?? "Verify email"}</span>
        <ChevronDown data-icon="inline-end" />
      </Button>
      {open ? (
        <div
          id="account-menu"
          role="menu"
          aria-label="Account"
          className="absolute top-full right-0 z-10 mt-2 w-72 rounded-lg border border-line bg-surface p-2 shadow-sm"
        >
          <p className="px-2 py-2 text-xs text-content-muted">
            {props.verified !== false ? "Verified account" : "Email verification required"}
          </p>
          <p className="truncate px-2 pb-2 text-sm font-medium text-content">
            {props.email ?? "Complete verification before account checkout."}
          </p>
          <Button
            type="button"
            role="menuitem"
            variant="ghost"
            className="min-h-11 w-full justify-start"
            disabled={props.signingOut}
            onClick={() => {
              setOpen(false);
              void signOut({ redirectUrl: "/" });
            }}
          >
            <LogOut data-icon="inline-start" />
            {props.signingOut ? "Signing out" : "Sign out"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
