import { NextResponse } from "next/server";
import { innovationDecomposeSchema } from "@/lib/validation/schemas";

/** POST /api/innovation/decompose — Phase 1 stub (validates, does not decompose). */
export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => ({}));
  const parsed = innovationDecomposeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "invalid_request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  return NextResponse.json(
    {
      status: "not_implemented",
      message: "Innovation decomposition service will be implemented in Phase 2.",
    },
    { status: 501 }
  );
}
