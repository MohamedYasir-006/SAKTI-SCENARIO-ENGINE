import { NextResponse } from "next/server";
import { innovationAnalyzeSchema } from "@/lib/validation/schemas";

/** POST /api/innovation/analyze — Phase 1 stub (validates, does not analyze). */
export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => ({}));
  const parsed = innovationAnalyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "invalid_request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  return NextResponse.json(
    {
      status: "not_implemented",
      message: "Innovation analysis service will be implemented in Phase 2.",
    },
    { status: 501 }
  );
}
