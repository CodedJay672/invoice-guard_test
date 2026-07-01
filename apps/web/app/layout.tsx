import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { Bricolage_Grotesque, DM_Mono, DM_Sans } from "next/font/google";
import type { ComponentProps } from "react";

import "@clerk/ui/themes/shadcn.css";
import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";

const fontSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});
type ClerkAppearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;
const clerkTheme = shadcn as unknown as NonNullable<ClerkAppearance["theme"]>;

const fontMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        fontMono.variable,
        fontDisplay.variable,
        "font-sans",
        fontSans.variable,
      )}
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
