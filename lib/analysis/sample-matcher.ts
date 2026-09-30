/**
 * Rule-based sample matcher (working prototype, no LLM, no retrieval).
 *
 * Screens an innovation model against the illustrative sample evidence.
 * Per module it returns one AnalysisFinding with a Low/Medium/High level,
 * matched evidence refs, a source fact, and a one-line interpretation.
 * No patentability score is produced.
 */
import type { AnalysisFinding, AnalysisKind, RiskLevel } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import {
  SAMPLE_MATCH_THRESHOLDS,
  SAMPLE_TYPE_BY_MODULE,
} from "@/lib/analysis/rubric.config";

export const NO_MATCH_INTERPRETATION =
  "Insufficient evidence - human review recommended";

export type MatchLevel = "Low" | "Medium" | "High";

const LEVEL_TO_RISK: Record<MatchLevel, RiskLevel> = {
  Low: "low",
  Medium: "medium",
  High: "high",
};

const MODULE_LABEL: Record<AnalysisKind, string> = {
  ip: "IP (prior art)",
  tk: "Traditional Knowledge",
  abs: "ABS / biodiversity",
  regulatory: "Regulatory",
};

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function namesOverlap(a: string, b: string): boolean {
  const left = normalize(a);
  const right = normalize(b);
  return left.length > 0 && right.length > 0 && (left.includes(right) || right.includes(left));
}

export interface EntryMatch {
  entry: SampleEvidence;
  matchedIngredients: string[];
  processHit: boolean;
}

export function matchEntry(
  entry: SampleEvidence,
  model: InnovationModel
): EntryMatch | null {
  if (!model.targetJurisdictions.includes(entry.jurisdiction as (typeof model.targetJurisdictions)[number])) {
    return null;
  }
  const matchedIngredients = model.ingredients
    .filter((ingredient) =>
      entry.relatedIngredients.some(
        (related) =>
          namesOverlap(ingredient.botanicalName, related) ||
          ingredient.synonyms.some((synonym) => namesOverlap(synonym, related))
      )
    )
    .map((ingredient) => ingredient.botanicalName);
  const processHit = model.processSteps.some((step) =>
    entry.relatedProcess.some((related) => namesOverlap(step.action, related))
  );
  if (matchedIngredients.length === 0 && !processHit) {
    return null;
  }
  return { entry, matchedIngredients, processHit };
}

export function levelForCoverage(
  module: AnalysisKind,
  coverage: number
): MatchLevel {
  const thresholds = SAMPLE_MATCH_THRESHOLDS[module];
  if (coverage >= thresholds.highCoverage) return "High";
  if (coverage >= thresholds.mediumCoverage) return "Medium";
  return "Low";
}

export function analyzeModule(
  module: AnalysisKind,
  model: InnovationModel,
  evidence: SampleEvidence[]
): AnalysisFinding {
  const wantedType = SAMPLE_TYPE_BY_MODULE[module];
  const matches: EntryMatch[] = [];
  for (const entry of evidence) {
    if (entry.type !== wantedType) continue;
    const match = matchEntry(entry, model);
    if (match) matches.push(match);
  }

  if (matches.length === 0) {
    return {
      id: `finding-${module}`,
      kind: module,
      title: `${MODULE_LABEL[module]} — no matches`,
      description: "No sample entries matched this innovation.",
      risk: "unknown",
      evidenceIds: [],
      jurisdictionCodes: [...model.targetJurisdictions],
      uncertainty: "insufficient_evidence",
      evidenceRefs: [],
      sourceFact: "No sample entries matched the innovation.",
      interpretation: NO_MATCH_INTERPRETATION,
    };
  }

  const totalIngredients = model.ingredients.length;
  const covered = new Set<string>();
  for (const match of matches) {
    for (const name of match.matchedIngredients) covered.add(normalize(name));
  }
  const coverage = totalIngredients === 0 ? 0 : covered.size / totalIngredients;
  const level = levelForCoverage(module, coverage);

  return {
    id: `finding-${module}`,
    kind: module,
    title: `${MODULE_LABEL[module]} — ${level} (${matches.length} match${matches.length === 1 ? "" : "es"})`,
    description: `${matches.length} sample ${matches.length === 1 ? "entry matches" : "entries match"} this innovation.`,
    risk: LEVEL_TO_RISK[level],
    evidenceIds: matches.map((match) => match.entry.id),
    jurisdictionCodes: [...model.targetJurisdictions],
    uncertainty: "needs_professional_review",
    evidenceRefs: matches.map((match) => ({
      evidenceId: match.entry.id,
      relevance:
        match.matchedIngredients.length > 0
          ? `Matched ${match.matchedIngredients.length} of ${totalIngredients} ingredients in entry ${match.entry.id}`
          : `Process match in entry ${match.entry.id}`,
    })),
    sourceFact: matches
      .map(
        (match) =>
          `Entry ${match.entry.id} ("${match.entry.title}") lists ` +
          `${match.matchedIngredients.length > 0 ? match.matchedIngredients.join(", ") : "no listed ingredient"}` +
          ` for ${match.entry.jurisdiction}.`
      )
      .join(" "),
    interpretation: matches
      .map((match) =>
        match.matchedIngredients.length > 0
          ? `Matched ${match.matchedIngredients.length} of ${totalIngredients} ingredients in entry ${match.entry.id}`
          : `Process-only match in entry ${match.entry.id}`
      )
      .join("; "),
  };
}

/** Run all four module screens. Deterministic for identical input. */
export function runSampleAnalysis(
  model: InnovationModel,
  evidence: SampleEvidence[]
): Record<AnalysisKind, AnalysisFinding> {
  return {
    ip: analyzeModule("ip", model, evidence),
    tk: analyzeModule("tk", model, evidence),
    abs: analyzeModule("abs", model, evidence),
    regulatory: analyzeModule("regulatory", model, evidence),
  };
}
