import { NextResponse } from "next/server";
import { scenarioAnalyzeSchema } from "@/lib/validation/schemas";

/** POST /api/scenario/analyze — Phase 1 stub. */
export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => ({}));
  const parsed = scenarioAnalyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "invalid_request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  return NextResponse.json(
    {
      status: "not_implemented",
      message: "Scenario analysis service will be implemented in Phase 2.",
    },
    { status: 501 }
  );
}
