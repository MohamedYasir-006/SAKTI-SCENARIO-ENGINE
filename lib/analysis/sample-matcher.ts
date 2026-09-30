/**
 * Rule-based sample matcher (working prototype, no LLM, no retrieval).
 *
 * Screens an innovation model against the illustrative sample evidence.
 * Per module it returns one AnalysisFinding with a Low/Medium/High level,
 * matched evidence refs, a source fact, and a one-line interpretation.
 * Entries carrying ratioRange/processDetail are checked against the
 * innovation's values; thresholds live in the rubric config.
 * No patentability score is produced.
 */
import type { AnalysisFinding, AnalysisKind, RiskLevel } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import {
  SAMPLE_MATCH_THRESHOLDS,
  SAMPLE_RANGE_RULES,
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

function toCelsius(value: number, unit: string): number {
  if (unit === "F") return ((value - 32) * 5) / 9;
  if (unit === "K") return value - 273.15;
  return value;
}

export interface EntryMatch {
  entry: SampleEvidence;
  matchedIngredients: string[];
  /** Name matches that also count toward coverage (range check passed or N/A). */
  coveredIngredients: string[];
  processHit: boolean;
  /** Human-readable range/process-detail notes, recorded from the check. */
  rangeNotes: string[];
}

export function matchEntry(
  entry: SampleEvidence,
  model: InnovationModel
): EntryMatch | null {
  if (!model.targetJurisdictions.includes(entry.jurisdiction as (typeof model.targetJurisdictions)[number])) {
    return null;
  }
  const matchedIngredients: string[] = [];
  const coveredIngredients: string[] = [];
  const rangeNotes: string[] = [];

  for (const ingredient of model.ingredients) {
    const nameHit = entry.relatedIngredients.some(
      (related) =>
        namesOverlap(ingredient.botanicalName, related) ||
        ingredient.synonyms.some((synonym) => namesOverlap(synonym, related))
    );
    if (!nameHit) continue;
    matchedIngredients.push(ingredient.botanicalName);

    const range = entry.ratioRange;
    const rangeApplies =
      range !== undefined &&
      (namesOverlap(ingredient.botanicalName, range.ingredient) ||
        ingredient.synonyms.some((synonym) => namesOverlap(synonym, range.ingredient)));
    if (!rangeApplies) {
      coveredIngredients.push(ingredient.botanicalName);
      continue;
    }
    const value = ingredient.quantity.amount;
    const comparable =
      ingredient.quantity.unit === SAMPLE_RANGE_RULES.comparableUnit &&
      Number.isFinite(value);
    if (!comparable) {
      rangeNotes.push(
        `${ingredient.botanicalName} has no comparable percentage; stated band ${range.minPercent}–${range.maxPercent}% cannot be checked`
      );
      continue;
    }
    if (value >= range.minPercent && value <= range.maxPercent) {
      coveredIngredients.push(ingredient.botanicalName);
      rangeNotes.push(
        `${ingredient.botanicalName} ${value}% inside stated ${range.minPercent}–${range.maxPercent}%`
      );
    } else if (SAMPLE_RANGE_RULES.outOfRangeCoverageCredit > 0) {
      coveredIngredients.push(ingredient.botanicalName);
      rangeNotes.push(
        `${ingredient.botanicalName} ${value}% outside stated ${range.minPercent}–${range.maxPercent}%`
      );
    } else {
      rangeNotes.push(
        `${ingredient.botanicalName} ${value}% outside stated ${range.minPercent}–${range.maxPercent}%`
      );
    }
  }

  let processHit = false;
  const detail = entry.processDetail;
  for (const step of model.processSteps) {
    if (entry.relatedProcess.some((related) => namesOverlap(step.action, related))) {
      processHit = true;
    }
    if (detail?.method && namesOverlap(step.action, detail.method)) {
      processHit = true;
      rangeNotes.push(`method matches stated "${detail.method}"`);
    }
    if (detail && (detail.minTempC !== undefined || detail.maxTempC !== undefined)) {
      if (!step.temperature) {
        rangeNotes.push(
          `no temperature stated; cannot check stated ${detail.minTempC ?? "…"}–${detail.maxTempC ?? "…"}°C band`
        );
      } else {
        const tempC = toCelsius(step.temperature.value, step.temperature.unit);
        const lo = detail.minTempC ?? Number.NEGATIVE_INFINITY;
        const hi = detail.maxTempC ?? Number.POSITIVE_INFINITY;
        rangeNotes.push(
          tempC >= lo && tempC <= hi
            ? `temperature ${tempC.toFixed(1)}°C inside stated band`
            : `temperature ${tempC.toFixed(1)}°C outside stated band`
        );
      }
    }
  }

  if (matchedIngredients.length === 0 && !processHit) {
    return null;
  }
  return { entry, matchedIngredients, coveredIngredients, processHit, rangeNotes };
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

function matchInterpretation(
  match: EntryMatch,
  totalIngredients: number
): string {
  const base =
    match.matchedIngredients.length > 0
      ? `Matched ${match.matchedIngredients.length} of ${totalIngredients} ingredients in entry ${match.entry.id}`
      : `Process-only match in entry ${match.entry.id}`;
  return match.rangeNotes.length > 0 ? `${base} (${match.rangeNotes.join("; ")})` : base;
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
    for (const name of match.coveredIngredients) covered.add(normalize(name));
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
      relevance: matchInterpretation(match, totalIngredients),
    })),
    sourceFact: matches
      .map(
        (match) =>
          `Entry ${match.entry.id} ("${match.entry.title}") lists ` +
          `${match.matchedIngredients.length > 0 ? match.matchedIngredients.join(", ") : "no listed ingredient"}` +
          ` for ${match.entry.jurisdiction}.` +
          (match.rangeNotes.length > 0 ? ` Checked: ${match.rangeNotes.join("; ")}.` : "")
      )
      .join(" "),
    interpretation: matches
      .map((match) => matchInterpretation(match, totalIngredients))
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
