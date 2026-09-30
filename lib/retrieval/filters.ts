/**
 * Retrieval filter types + placeholder applier (Phase 1).
 */

export interface SearchFilters {
  jurisdictionCodes?: string[];
  sourceKinds?: string[];
  strengths?: string[];
  query?: string;
}

export function applyFilters<T>(items: T[], filters?: SearchFilters): T[] {
  // TODO: implement filtering in Phase 2 (temporary: passthrough).
  void filters;
  return items;
}
