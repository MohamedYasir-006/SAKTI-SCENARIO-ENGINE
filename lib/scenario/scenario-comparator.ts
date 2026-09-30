/**
 * Scenario comparator placeholder (Phase 1 — signatures only).
 * TODO: implement diffing in Phase 2.
 */
import type { Scenario } from "@/types/scenario";

export interface ScenarioDiff {
  scenarioAId: string;
  scenarioBId: string;
  changedElementIds: string[];
  summary: string;
}

export async function compareScenarios(
  scenarioA: Scenario,
  scenarioB: Scenario
): Promise<ScenarioDiff> {
  // TODO: implement scenario comparison.
  throw new Error("Not implemented: compareScenarios (Phase 2).");
}
