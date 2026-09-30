/**
 * Innovation validators placeholder (Phase 1 — minimal structural checks).
 * TODO: add full schema validation in Phase 2.
 */
import type { Innovation } from "@/types/innovation";

export function validateInnovationShape(innovation: Innovation): string[] {
  const errors: string[] = [];
  if (!innovation.id) errors.push("Innovation id is required.");
  if (!innovation.metadata?.title) errors.push("Innovation title is required.");
  return errors;
}
