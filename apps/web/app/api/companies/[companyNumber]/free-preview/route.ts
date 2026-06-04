import { NextResponse, type NextRequest } from "next/server";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ companyNumber: string }> },
) {
  const { companyNumber } = await context.params;
  const response = await fetch(
    `${apiBaseUrl}/companies/${encodeURIComponent(companyNumber)}/free-preview`,
  );

  return NextResponse.json((await response.json()) as unknown, { status: response.status });
}
