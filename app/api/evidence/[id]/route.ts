import { NextResponse } from "next/server";

/** GET /api/evidence/[id] — Phase 1 stub (no retrieval yet). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  void id;
  return NextResponse.json(
    {
      status: "not_implemented",
      message: "Evidence detail service will be implemented in Phase 2.",
    },
    { status: 501 }
  );
}
