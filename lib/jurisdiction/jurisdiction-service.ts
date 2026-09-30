/**
 * Jurisdiction service placeholder (Phase 1 — signatures only).
 * TODO: implement jurisdiction data access in Phase 2.
 */
import type { Jurisdiction } from "@/types/jurisdiction";

export async function listJurisdictions(): Promise<Jurisdiction[]> {
  // TODO: implement listing (temporary: static stub list).
  return [
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "EP", name: "European Patent Organisation" },
    { code: "WO", name: "WIPO (PCT)" },
  ];
}
