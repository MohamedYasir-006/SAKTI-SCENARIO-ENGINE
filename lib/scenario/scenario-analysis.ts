/**
 * Scenario analysis orchestration (working prototype).
 *
 * Re-runs only the modules affected by a version's changes (dependency
 * map), flags module cells the sample corpus cannot discriminate, and
 * derives "why it changed" lines strictly from matcher outputs.
 */
import type { AnalysisFinding, AnalysisKind } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import { analyzeModule } from "@/lib/analysis/sample-matcher";
import { SAMPLE_TYPE_BY_MODULE } from "@/lib/analysis/rubric.config";
import {
  affectedModules,
  diffInnovationModels,
  FIELD_MODULE_MAP,
  type FieldChange,
} from "@/lib/scenario/version-diff";

export const NOT_DISCRIMINATED_TEXT =
  "No evidence in the sample corpus discriminates this change.";

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function namesOverlap(a: string, b: string): boolean {
  const left = normalize(a);
  const right = normalize(b);
  return left.length > 0 && right.length > 0 && (left.includes(right) || right.includes(left));
}

/** Whether any sample entry of the module's type speaks to a changed field. */
export function changeDiscriminatedBy(
  change: FieldChange,
  module: AnalysisKind,
  evidence: SampleEvidence[]
): boolean {
  const wantedType = SAMPLE_TYPE_BY_MODULE[module];
  const scoped = evidence.filter((entry) => entry.type === wantedType);
  switch (change.field) {
    case "percentages":
    case "ingredients":
      return scoped.some(
        (entry) =>
          entry.relatedIngredients.some((related) => namesOverlap(change.detail, related)) ||
          (entry.ratioRange !== undefined && namesOverlap(change.detail, entry.ratioRange.ingredient))
      );
    case "extractionMethod":
      return scoped.some(
        (entry) =>
          entry.relatedProcess.some((related) => namesOverlap(change.detail, related)) ||
          (entry.processDetail?.method !== undefined &&
            namesOverlap(change.detail, entry.processDetail.method))
      );
    case "jurisdiction":
      return scoped.some((entry) => normalize(entry.jurisdiction) === normalize(change.detail));
    case "intendedUse":
      return false;
  }
}

export interface VersionAnalysis {
  version: string;
  model: InnovationModel;
  changes: FieldChange[];
  affected: AnalysisKind[];
  reRan: AnalysisKind[];
  findings: Record<AnalysisKind, AnalysisFinding>;
  /** Modules with uncertainty === insufficient_evidence. */
  gaps: number;
}

export function analyzeVersion(
  version: string,
  baseModel: InnovationModel,
  baseFindings: Record<AnalysisKind, AnalysisFinding>,
  variantModel: InnovationModel,
  evidence: SampleEvidence[]
): VersionAnalysis {
  const changes = diffInnovationModels(baseModel, variantModel);
  const affected = affectedModules(changes);
  const findings = { ...baseFindings };
  const reRan: AnalysisKind[] = [];

  for (const module of affected) {
    const finding = analyzeModule(module, variantModel, evidence);
    const moduleChanges = changes.filter((change) =>
      FIELD_MODULE_MAP[change.field].includes(module)
    );
    const discriminated = moduleChanges.some((change) =>
      changeDiscriminatedBy(change, module, evidence)
    );
    findings[module] = discriminated
      ? finding
      : {
          ...finding,
          uncertainty: "not_discriminated_by_corpus",
          interpretation: NOT_DISCRIMINATED_TEXT,
        };
    reRan.push(module);
  }

  const gaps = (Object.values(findings) as AnalysisFinding[]).filter(
    (finding) => finding.uncertainty === "insufficient_evidence"
  ).length;

  return { version, model: variantModel, changes, affected, reRan, findings, gaps };
}

function sortedIds(ids: string[]): string[] {
  return [...ids].sort();
}

/** One-line explanation derived only from the two matcher outputs. */
export function whyChanged(base: AnalysisFinding, next: AnalysisFinding): string {
  const parts: string[] = [];
  if (base.risk !== next.risk) {
    parts.push(`level ${base.risk.toUpperCase()}→${next.risk.toUpperCase()}`);
  }
  const baseIds = sortedIds(base.evidenceIds);
  const nextIds = sortedIds(next.evidenceIds);
  const added = nextIds.filter((id) => !baseIds.includes(id));
  const removed = baseIds.filter((id) => !nextIds.includes(id));
  if (added.length > 0) parts.push(`new evidence: ${added.join(", ")}`);
  if (removed.length > 0) parts.push(`lost evidence: ${removed.join(", ")}`);
  if (base.uncertainty !== next.uncertainty) {
    parts.push(
      `uncertainty ${base.uncertainty.replaceAll("_", " ")}→${next.uncertainty.replaceAll("_", " ")}`
    );
  }
  return parts.length > 0 ? `${parts.join("; ")}.` : "Unchanged from base.";
}
