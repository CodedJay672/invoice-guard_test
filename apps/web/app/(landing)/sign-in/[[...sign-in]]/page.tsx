import { ClerkAuthScreen } from "@/components/auth/ClerkAuthScreen";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <div className="mx-auto flex max-w-lg justify-center px-4 py-10 sm:px-6 lg:px-8">
      <ClerkAuthScreen
        mode="sign-in"
        fixture={singleValue(params.fixture)}
        returnTo={singleValue(params.returnTo)}
      />
    </div>
  );
}

function singleValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
