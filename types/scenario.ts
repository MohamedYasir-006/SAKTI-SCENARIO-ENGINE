/**
 * Scenario domain types (Phase 1 — shapes only, no logic).
 */
import type { Innovation } from "./innovation";

export type ScenarioChangeKind =
  | "add_ingredient"
  | "remove_ingredient"
  | "modify_process"
  | "modify_formulation"
  | "change_jurisdiction"
  | "narrow_claim"
  | "other";

export interface ScenarioChange {
  id: string;
  kind: ScenarioChangeKind;
  description: string;
  targetElementId?: string;
  payload?: Record<string, string>;
}

export interface ScenarioImpact {
  summary?: string;
  ipRiskDelta?: number;
  absRiskDelta?: number;
  regulatoryRiskDelta?: number;
  evidenceCoverageDelta?: number;
}

export interface Scenario {
  id: string;
  name: string;
  baseInnovationId: string;
  changes: ScenarioChange[];
  resultingInnovation?: Innovation;
  impact?: ScenarioImpact;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}
