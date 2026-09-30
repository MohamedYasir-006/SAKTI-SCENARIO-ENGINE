/**
 * Uncertainty as first-class state (Phase 2).
 *
 * Every analyzer shares this type. A finding is never just a risk label:
 * it always declares its epistemic state, points at evidence, and keeps
 * source fact separate from analyzer interpretation.
 */

export type UncertaintyState =
  | "insufficient_evidence"
  | "conflicting_evidence"
  | "not_discriminated_by_corpus"
  | "needs_professional_review";

export const UNCERTAINTY_STATES: readonly UncertaintyState[] = [
  "insufficient_evidence",
  "conflicting_evidence",
  "not_discriminated_by_corpus",
  "needs_professional_review",
] as const;

export interface FindingEvidenceRef {
  evidenceId: string;
  /** Why this evidence is relevant to the finding. */
  relevance: string;
}

export interface FactVsInterpretation {
  /** What the cited source(s) actually state. No inference allowed here. */
  sourceFact: string;
  /** What the analyzer infers from the fact. Must be defeasible. */
  interpretation: string;
}

/**
 * Fields every grounded finding must carry, regardless of module.
 * Spread into module-specific finding interfaces.
 */
export interface GroundedFindingFields {
  uncertainty: UncertaintyState;
  evidenceRefs: FindingEvidenceRef[];
  sourceFact: string;
  interpretation: string;
}
