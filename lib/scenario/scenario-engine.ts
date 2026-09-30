/**
 * Scenario engine placeholder (Phase 1 — signatures only).
 * TODO: implement scenario creation / branching in Phase 2.
 */
import type { Innovation } from "@/types/innovation";
import type { Scenario, ScenarioChange } from "@/types/scenario";

export interface CreateScenarioInput {
  baseInnovationId: string;
  name: string;
  changes: ScenarioChange[];
}

export async function createScenario(
  input: CreateScenarioInput
): Promise<Scenario> {
  // TODO: implement scenario creation (apply changes to a base innovation copy).
  throw new Error("Not implemented: createScenario (Phase 2).");
}

export async function applyChangesToInnovation(
  base: Innovation,
  changes: ScenarioChange[]
): Promise<Innovation> {
  // TODO: implement change application + versioning.
  throw new Error("Not implemented: applyChangesToInnovation (Phase 2).");
}
