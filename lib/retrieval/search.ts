/**
 * Retrieval search placeholder (Phase 1 — signatures only).
 * TODO: implement jurisdiction-aware search in Phase 2.
 */
import type { SearchFilters } from "./filters";
import type { RankedEvidence } from "./ranking";

export async function searchEvidence(
  query: string,
  filters?: SearchFilters
): Promise<RankedEvidence[]> {
  // TODO: implement evidence search.
  void query;
  void filters;
  return [];
}
