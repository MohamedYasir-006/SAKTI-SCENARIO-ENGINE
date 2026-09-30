/**
 * Innovation service placeholder (Phase 1 — signatures only).
 * TODO: implement persistence in Phase 2.
 */
import type { Innovation } from "@/types/innovation";

export async function getInnovationById(id: string): Promise<Innovation | null> {
  // TODO: implement lookup.
  void id;
  return null;
}

export async function listInnovations(): Promise<Innovation[]> {
  // TODO: implement listing (temporary: empty).
  return [];
}
