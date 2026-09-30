import { NextResponse } from "next/server";

/** GET /api/evidence/search — Phase 1 stub (no retrieval yet). */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: "not_implemented",
      message: "Evidence search service will be implemented in Phase 2.",
      items: [],
    },
    { status: 501 }
  );
}
