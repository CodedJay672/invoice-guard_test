import { NextResponse, type NextRequest } from "next/server";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const response = await fetch(`${apiBaseUrl}/companies/search?q=${encodeURIComponent(query)}`, {
    headers: {
      "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
    },
  });

  return NextResponse.json((await response.json()) as unknown, { status: response.status });
}
