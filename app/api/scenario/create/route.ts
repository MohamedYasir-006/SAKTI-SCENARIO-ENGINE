import { NextResponse } from "next/server";
import { scenarioCreateSchema } from "@/lib/validation/schemas";

/** POST /api/scenario/create — Phase 1 stub. */
export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => ({}));
  const parsed = scenarioCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "invalid_request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  return NextResponse.json(
    {
      status: "not_implemented",
      message: "Scenario creation service will be implemented in Phase 2.",
    },
    { status: 501 }
  );
}
