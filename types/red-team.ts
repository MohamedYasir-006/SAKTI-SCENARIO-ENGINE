/**
 * Red-team domain types (Phase 1 — shapes only, no logic).
 */
import type { RiskLevel } from "./analysis";

export type AttackCategory =
  | "novelty"
  | "obviousness"
  | "prior_art"
  | "tk_conflict"
  | "abs_compliance"
  | "regulatory_blocker"
  | "claim_overbreadth";

export interface RedTeamFinding {
  id: string;
  category: AttackCategory;
  title: string;
  description: string;
  severity: RiskLevel;
  targetClaimIds: string[];
  evidenceIds: string[];
  suggestedMitigation?: string;
}

export interface ResearchGap {
  id: string;
  title: string;
  description: string;
  relatedFindingIds: string[];
  priority: RiskLevel;
}
