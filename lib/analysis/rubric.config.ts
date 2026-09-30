/**
 * Analyzer rubric configuration (Phase 2 — structure + labelled example).
 *
 * Per module, the rubric maps evidence attributes to indicator levels.
 * Rules are pure, ordered, and first-match-wins, which makes evaluation
 * deterministic by construction.
 *
 * No thresholds here are validated. The single worked example below is
 * explicitly marked EXAMPLE and exists only to pin the shape of a rule.
 */
import type { AnalysisKind } from "@/types/analysis";

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
