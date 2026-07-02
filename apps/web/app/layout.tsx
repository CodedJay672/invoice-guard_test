import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { Geist_Mono, Inter } from "next/font/google";
import type { ComponentProps } from "react";

import "@clerk/ui/themes/shadcn.css";
import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });
type ClerkAppearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;
const clerkTheme = shadcn as unknown as NonNullable<ClerkAppearance["theme"]>;

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", fontMono.variable, "font-sans", fontSans.variable)}
    >
      <body>
        <ClerkProvider
          dynamic
          appearance={{
            theme: clerkTheme,
            variables: {
              colorPrimary: "var(--ig-brand-navy)",
              colorBackground: "var(--ig-surface)",
              colorForeground: "var(--ig-content)",
              colorMutedForeground: "var(--ig-content-muted)",
              colorBorder: "var(--ig-line)",
              colorRing: "var(--ig-focus)",
              borderRadius: "0.625rem",
              fontFamily: "var(--font-sans)",
            },
          }}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
