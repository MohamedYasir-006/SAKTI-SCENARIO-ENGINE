/**
 * Evidence service placeholder (Phase 1 — signatures only).
 * TODO: implement persistence + lookup in Phase 2.
 */
import type { Evidence } from "@/types/evidence";

export async function getEvidenceById(id: string): Promise<Evidence | null> {
  // TODO: implement evidence lookup.
  void id;
  return null;
}

export async function listEvidence(): Promise<Evidence[]> {
  // TODO: implement evidence listing (temporary: empty).
  return [];
}
