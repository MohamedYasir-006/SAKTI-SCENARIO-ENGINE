/**
 * Attack strategies placeholder (Phase 1 — declarative stubs only).
 * TODO: define real attack strategies in Phase 2.
 */
import type { AttackCategory } from "@/types/red-team";

export interface AttackStrategy {
  category: AttackCategory;
  name: string;
  description: string;
  enabled: boolean;
}

export const ATTACK_STRATEGIES: AttackStrategy[] = [
  { category: "novelty", name: "Novelty challenge", description: "TODO (Phase 2).", enabled: false },
  { category: "obviousness", name: "Obviousness challenge", description: "TODO (Phase 2).", enabled: false },
  { category: "prior_art", name: "Prior-art surfacing", description: "TODO (Phase 2).", enabled: false },
  { category: "tk_conflict", name: "TK conflict check", description: "TODO (Phase 2).", enabled: false },
  { category: "abs_compliance", name: "ABS compliance probe", description: "TODO (Phase 2).", enabled: false },
  { category: "regulatory_blocker", name: "Regulatory blocker probe", description: "TODO (Phase 2).", enabled: false },
  { category: "claim_overbreadth", name: "Claim overbreadth probe", description: "TODO (Phase 2).", enabled: false },
];
