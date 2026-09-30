/**
 * Analyzer rubric configuration (Phase 2 structure + Phase 3 prototype rules).
 *
 * Per module, the rubric maps evidence attributes to indicator levels.
 * Rules are pure, ordered, and first-match-wins, which makes evaluation
 * deterministic by construction.
 *
 * No thresholds here are validated. EXAMPLE rules and the prototype
 * sample-matching thresholds below are illustrative only.
 */
import type { AnalysisKind } from "@/types/analysis";
import type { SampleEvidenceType } from "@/lib/evidence/sample-evidence";

export const RUBRIC_VERSION = "0.1.0-phase2-example";

export type IndicatorLevel = "high" | "medium" | "low" | "indeterminate";

export interface EvidenceAttributes {
  verifiedSourceCount: number;
  targetJurisdictionSourceCount: number;
  conflictingSourceCount: number;
  totalSourceCount: number;
}

export interface RubricRule {
  id: string;
  module: AnalysisKind;
  description: string;
  /**
   * True only for illustrative rules. Real calibrated rules arrive in a
   * later phase with validation notes attached.
   */
  example: boolean;
  evaluate: (attrs: EvidenceAttributes) => IndicatorLevel | null;
}

export interface RubricModuleConfig {
  module: AnalysisKind;
  version: string;
  rules: RubricRule[];
  notes: string;
}

const EXAMPLE_RULE_ID = "ip.verified-source-present.example";

export const RUBRIC_CONFIG: Record<AnalysisKind, RubricModuleConfig> = {
  ip: {
    module: "ip",
    version: RUBRIC_VERSION,
    notes: "Structure only. Thresholds are placeholders, not validated.",
    rules: [
      {
        id: EXAMPLE_RULE_ID,
        module: "ip",
        description:
          "EXAMPLE RULE (illustrative only, not validated): at least one verified source from a target jurisdiction yields a medium indicator.",
        example: true,
        evaluate: (attrs) =>
          attrs.verifiedSourceCount >= 1 && attrs.targetJurisdictionSourceCount >= 1
            ? "medium"
            : null,
      },
    ],
  },
  tk: {
    module: "tk",
    version: RUBRIC_VERSION,
    notes: "TODO (later phase): define TK indicator rules with validation notes.",
    rules: [],
  },
  abs: {
    module: "abs",
    version: RUBRIC_VERSION,
    notes: "TODO (later phase): define ABS indicator rules with validation notes.",
    rules: [],
  },
  regulatory: {
    module: "regulatory",
    version: RUBRIC_VERSION,
    notes: "TODO (later phase): define regulatory indicator rules with validation notes.",
    rules: [],
  },
};

export interface RubricEvaluation {
  module: AnalysisKind;
  rubricVersion: string;
  level: IndicatorLevel;
  matchedRuleId: string | null;
}

/**
 * Deterministic: same (module, attrs) always yields the same evaluation.
 * Falls back to "indeterminate" when no rule matches.
 */
export function evaluateIndicator(
  module: AnalysisKind,
  attrs: EvidenceAttributes
): RubricEvaluation {
  const config = RUBRIC_CONFIG[module];
  for (const rule of config.rules) {
    const level = rule.evaluate(attrs);
    if (level !== null) {
      return { module, rubricVersion: config.version, level, matchedRuleId: rule.id };
    }
  }
  return { module, rubricVersion: config.version, level: "indeterminate", matchedRuleId: null };
}

// ---------------------------------------------------------------------------
// Prototype sample-matching thresholds (illustrative only, not validated).
// The rule-based sample matcher reads these; components must not hard-code
// matching thresholds.
// ---------------------------------------------------------------------------

/** Which sample evidence type each analyzer module screens. */
export const SAMPLE_TYPE_BY_MODULE: Record<AnalysisKind, SampleEvidenceType> = {
  ip: "prior_art",
  tk: "traditional_knowledge",
  abs: "abs",
  regulatory: "regulatory",
};

export interface SampleMatchThresholds {
  /** Ingredient-coverage fraction at or above which the level is High. */
  highCoverage: number;
  /** Ingredient-coverage fraction at or above which the level is Medium. */
  mediumCoverage: number;
}

export const SAMPLE_MATCH_THRESHOLDS: Record<AnalysisKind, SampleMatchThresholds> = {
  ip: { highCoverage: 1, mediumCoverage: 0.5 },
  tk: { highCoverage: 1, mediumCoverage: 0.5 },
  abs: { highCoverage: 1, mediumCoverage: 0.5 },
  regulatory: { highCoverage: 1, mediumCoverage: 0.5 },
};

/**
 * Prototype range-comparison rules (illustrative only, not validated).
 * A name-matched ingredient counts toward coverage only when no
 * ratioRange applies to it, or when its percentage falls inside the
 * stated band. Percentages are only comparable in "percent" units.
 */
export const SAMPLE_RANGE_RULES = {
  comparableUnit: "percent",
  /** Coverage credit for a name match whose value falls outside the band. */
  outOfRangeCoverageCredit: 0,
} as const;
