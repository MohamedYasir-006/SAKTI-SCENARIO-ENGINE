/**
 * Red-team engine placeholder (Phase 1 — signatures only).
 * TODO: implement attack orchestration in Phase 2.
 */
import type { Innovation } from "@/types/innovation";
import type { RedTeamFinding } from "@/types/red-team";

export interface RedTeamRunInput {
  innovationId: string;
  scenarioId?: string;
  categories?: string[];
}

export async function runRedTeam(
  innovation: Innovation,
  input: RedTeamRunInput
): Promise<RedTeamFinding[]> {
  // TODO: implement red-team run.
  void innovation;
  void input;
  throw new Error("Not implemented: runRedTeam (Phase 2).");
}
