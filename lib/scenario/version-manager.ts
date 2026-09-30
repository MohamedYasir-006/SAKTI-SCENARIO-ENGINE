/**
 * Scenario version manager placeholder (Phase 1 — signatures only).
 * TODO: implement persistence + version history in Phase 2.
 */
import type { Scenario } from "@/types/scenario";

export async function listScenarioVersions(
  baseInnovationId: string
): Promise<Scenario[]> {
  // TODO: implement version listing (temporary: empty history).
  return [];
}

export async function getScenarioVersion(
  scenarioId: string
): Promise<Scenario | null> {
  // TODO: implement version retrieval.
  return null;
}
