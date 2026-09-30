/**
 * Retrieval layer types (Phase 1 — shapes only).
 */
import type { SearchFilters } from "./filters";
import type { RankedEvidence } from "./ranking";

export interface RetrievalQuery {
  text: string;
  filters?: SearchFilters;
  limit?: number;
}

export interface RetrievalResult {
  query: RetrievalQuery;
  items: RankedEvidence[];
}
