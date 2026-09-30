/**
 * Retrieval ranking placeholder (Phase 1 — signatures only).
 * TODO: implement ranking in Phase 2.
 */
import type { Evidence } from "@/types/evidence";

export interface RankedEvidence {
  evidence: Evidence;
  score: number;
}

export function rankEvidence(items: Evidence[]): RankedEvidence[] {
  // TODO: implement ranking (temporary: preserve input order, zero scores).
  return items.map((evidence) => ({ evidence, score: 0 }));
}
