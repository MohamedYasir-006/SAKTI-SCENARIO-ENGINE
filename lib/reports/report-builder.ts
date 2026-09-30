/**
 * Report data assembly (working prototype, deterministic).
 *
 * Builds the printable Innovation Intelligence Report from in-memory
 * state: base innovation, module findings, scenario versions, red-team
 * findings, and sample evidence. Evidence gaps and human review points
 * are derived from matcher outputs only — nothing invented.
 */
import type { AnalysisFinding, AnalysisKind } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import type { RedTeamFinding } from "@/types/red-team";
import { generateRedTeamFindings } from "@/lib/redteam/sample-redteam";
import type { FieldChange } from "@/lib/scenario/version-diff";

export const MODULE_ORDER: AnalysisKind[] = ["ip", "tk", "abs", "regulatory"];

export const MODULE_TITLE: Record<AnalysisKind, string> = {
  ip: "IP (prior art)",
  tk: "Traditional Knowledge",
  abs: "ABS / biodiversity",
  regulatory: "Regulatory",
};

export interface ReportVersionData {
  version: string;
  model: InnovationModel;
  changes: FieldChange[];
  findings: Record<AnalysisKind, AnalysisFinding>;
  gaps: number;
}

export interface ReportGap {
  where: string;
  module: AnalysisKind;
  uncertainty: string;
  interpretation: string;
}

export interface CitedEvidence {
  entry: SampleEvidence;
  citations: { where: string; module: AnalysisKind; sourceFact: string; interpretation: string }[];
}

export interface ReportData {
  generatedAt: string;
  innovationTitle: string;
  innovation: InnovationModel;
  baseFindings: Record<AnalysisKind, AnalysisFinding>;
  baseGaps: number;
  versions: ReportVersionData[];
  redTeam: RedTeamFinding[];
  citedEvidence: CitedEvidence[];
  gaps: ReportGap[];
  reviewPoints: string[];
}

function countGaps(findings: Record<AnalysisKind, AnalysisFinding>): number {
  return (Object.values(findings) as AnalysisFinding[]).filter(
    (finding) => finding.uncertainty === "insufficient_evidence"
  ).length;
}

export function buildReportData(args: {
  innovation: InnovationModel;
  baseFindings: Record<AnalysisKind, AnalysisFinding>;
  evidence: SampleEvidence[];
  versions?: ReportVersionData[];
  generatedAt?: string;
}): ReportData {
  const versions = args.versions ?? [];
  const redTeam: RedTeamFinding[] = [
    ...generateRedTeamFindings("A", args.innovation, args.baseFindings, args.evidence),
  ];
  for (const version of versions) {
    redTeam.push(...generateRedTeamFindings(version.version, version.model, version.findings, args.evidence));
  }

  const gaps: ReportGap[] = [];
  const reviewPoints: string[] = [];
  const citedBy = new Map<string, CitedEvidence["citations"]>();

  function ingest(version: string, findings: Record<AnalysisKind, AnalysisFinding>): void {
    for (const module of MODULE_ORDER) {
      const finding = findings[module];
      if (finding.uncertainty === "insufficient_evidence" || finding.uncertainty === "not_discriminated_by_corpus") {
        gaps.push({
          where: `Version ${version} · ${MODULE_TITLE[module]}`,
          module,
          uncertainty: finding.uncertainty,
          interpretation: finding.interpretation,
        });
      }
      if (finding.risk === "high") {
        reviewPoints.push(
          `High overlap in ${MODULE_TITLE[module]} (Version ${version}): narrow the claims or add distinguishing detail; seek professional review.`
        );
      }
      if (finding.uncertainty === "insufficient_evidence") {
        reviewPoints.push(
          `No sample evidence for ${MODULE_TITLE[module]} (Version ${version}): collect evidence before asserting.`
        );
      }
      if (finding.uncertainty === "not_discriminated_by_corpus") {
        reviewPoints.push(
          `Change in Version ${version} not covered by the sample corpus (${MODULE_TITLE[module]}): extend the corpus or record expert judgment.`
        );
      }
      for (const ref of finding.evidenceRefs) {
        const list = citedBy.get(ref.evidenceId) ?? [];
        list.push({
          where: `Version ${version}`,
          module,
          sourceFact: finding.sourceFact,
          interpretation: ref.relevance,
        });
        citedBy.set(ref.evidenceId, list);
      }
    }
  }

  ingest("A", args.baseFindings);
  for (const version of versions) ingest(version.version, version.findings);

  const byId = new Map(args.evidence.map((entry) => [entry.id, entry]));
  const citedEvidence: CitedEvidence[] = [...citedBy.entries()]
    .map(([id, citations]) => ({ entry: byId.get(id), citations }))
    .filter((item): item is CitedEvidence => item.entry !== undefined)
    .sort((a, b) => a.entry.id.localeCompare(b.entry.id));

  if (args.innovation.proposedClaims.length > 0) {
    reviewPoints.push("Tie each proposed claim to supporting evidence before asserting it.");
  }

  return {
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    innovationTitle: args.innovation.title,
    innovation: args.innovation,
    baseFindings: args.baseFindings,
    baseGaps: countGaps(args.baseFindings),
    versions,
    redTeam,
    citedEvidence,
    gaps,
    reviewPoints: [...new Set(reviewPoints)],
  };
}
