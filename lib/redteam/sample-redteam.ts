/**
 * Rule-based sample red team (working prototype, no LLM).
 *
 * Generates RedTeamFinding items strictly from analysis outputs and
 * sample evidence: high-overlap findings, modules with missing evidence,
 * unvalidated claims, and jurisdiction gaps. Nothing is invented beyond
 * what the matcher reported.
 */
import type { AnalysisFinding, AnalysisKind } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import type { AttackCategory, RedTeamFinding } from "@/types/red-team";

const MODULE_CATEGORY: Record<AnalysisKind, AttackCategory> = {
  ip: "prior_art",
  tk: "tk_conflict",
  abs: "abs_compliance",
  regulatory: "regulatory_blocker",
};

export const CATEGORY_LABEL: Record<AttackCategory, string> = {
  novelty: "Novelty",
  obviousness: "Obviousness",
  prior_art: "Prior art",
  tk_conflict: "TK",
  abs_compliance: "ABS",
  regulatory_blocker: "Regulatory",
  claim_overbreadth: "Claims",
  missing_evidence: "Missing evidence",
};

const MITIGATION = "Narrow the claim or add distinguishing detail, then seek professional review.";

/** Generate findings for one analyzed version. Deterministic. */
export function generateRedTeamFindings(
  version: string,
  model: InnovationModel,
  findings: Record<AnalysisKind, AnalysisFinding>,
  evidence: SampleEvidence[]
): RedTeamFinding[] {
  const results: RedTeamFinding[] = [];
  const claimIds = model.proposedClaims.map((claim) => claim.id);

  (Object.keys(findings) as AnalysisKind[]).forEach((module) => {
    const finding = findings[module];
    if (finding.risk === "high") {
      results.push({
        id: `rt-${version}-${module}-overlap`,
        category: MODULE_CATEGORY[module],
        title: `High overlap in ${module.toUpperCase()} screen (${version})`,
        description: `Sample evidence covers the innovation closely: ${finding.evidenceIds.join(", ")}.`,
        severity: "high",
        targetClaimIds: claimIds,
        evidenceIds: [...finding.evidenceIds],
        suggestedMitigation: MITIGATION,
        uncertainty: "needs_professional_review",
        evidenceRefs: finding.evidenceRefs.map((ref) => ({ ...ref })),
        sourceFact: finding.sourceFact,
        interpretation: `Attack: a challenger could cite ${finding.evidenceIds.join(", ")} against this version.`,
      });
    }
    if (finding.uncertainty === "insufficient_evidence") {
      results.push({
        id: `rt-${version}-${module}-missing`,
        category: "missing_evidence",
        title: `No supporting sample evidence for ${module.toUpperCase()} (${version})`,
        description: `The ${module.toUpperCase()} screen found nothing to cite either way.`,
        severity: "medium",
        targetClaimIds: claimIds,
        evidenceIds: [],
        suggestedMitigation: MITIGATION,
        uncertainty: "insufficient_evidence",
        evidenceRefs: [],
        sourceFact: finding.sourceFact,
        interpretation: "Attack: the absence of evidence leaves this flank undefended; collect evidence before asserting.",
      });
    }
  });

  if (claimIds.length > 0) {
    results.push({
      id: `rt-${version}-claims-unvalidated`,
      category: "claim_overbreadth",
      title: `Unvalidated claims (${version})`,
      description: `${claimIds.length} proposed ${claimIds.length === 1 ? "claim has" : "claims have"} no evidence link in this prototype.`,
      severity: "medium",
      targetClaimIds: claimIds,
      evidenceIds: [],
      suggestedMitigation: MITIGATION,
      uncertainty: "insufficient_evidence",
      evidenceRefs: [],
      sourceFact: `The model proposes claims ${claimIds.join(", ")} with no linked evidence.`,
      interpretation: "Attack: broad unlinked claims are the easiest target; tie each claim to evidence or narrow it.",
    });
  }

  for (const jurisdiction of model.targetJurisdictions) {
    const covered = evidence.some((entry) => entry.jurisdiction === jurisdiction);
    if (!covered) {
      results.push({
        id: `rt-${version}-jurisdiction-${jurisdiction}`,
        category: "missing_evidence",
        title: `Jurisdiction gap: ${jurisdiction} (${version})`,
        description: `No sample entries cover jurisdiction ${jurisdiction}.`,
        severity: "medium",
        targetClaimIds: claimIds,
        evidenceIds: [],
        suggestedMitigation: MITIGATION,
        uncertainty: "insufficient_evidence",
        evidenceRefs: [],
        sourceFact: `The sample corpus contains no entries for jurisdiction ${jurisdiction}.`,
        interpretation: "Attack: any jurisdiction-specific argument goes unanswered without covering evidence.",
      });
    }
  }

  return results;
}

/** Group findings by category in stable category order. */
export function groupFindingsByCategory(
  findings: RedTeamFinding[]
): { category: AttackCategory; label: string; findings: RedTeamFinding[] }[] {
  const order: AttackCategory[] = [
    "prior_art",
    "tk_conflict",
    "abs_compliance",
    "regulatory_blocker",
    "claim_overbreadth",
    "missing_evidence",
    "novelty",
    "obviousness",
  ];
  const groups = new Map<AttackCategory, RedTeamFinding[]>();
  for (const finding of findings) {
    const list = groups.get(finding.category) ?? [];
    list.push(finding);
    groups.set(finding.category, list);
  }
  return order
    .filter((category) => groups.has(category))
    .map((category) => ({
      category,
      label: CATEGORY_LABEL[category],
      findings: groups.get(category) ?? [],
    }));
}
