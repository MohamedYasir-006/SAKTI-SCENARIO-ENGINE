/**
 * Red-team output tests (rule-based prototype).
 */
import { describe, expect, it } from "vitest";
import {
  CATEGORY_LABEL,
  generateRedTeamFindings,
  groupFindingsByCategory,
} from "@/lib/redteam/sample-redteam";
import type { AnalysisFinding, AnalysisKind } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import { baseModel, withJurisdiction } from "../scenario/fixtures";

function finding(partial: Partial<AnalysisFinding> & { kind: AnalysisKind }): AnalysisFinding {
  return {
    id: `finding-${partial.kind}`,
    title: `${partial.kind} finding`,
    description: "Illustrative finding.",
    risk: "low",
    evidenceIds: [],
    jurisdictionCodes: ["IN"],
    uncertainty: "needs_professional_review",
    evidenceRefs: [],
    sourceFact: "Illustrative source fact.",
    interpretation: "Illustrative interpretation.",
    ...partial,
  };
}

function baseFindings(): Record<AnalysisKind, AnalysisFinding> {
  return {
    ip: finding({
      kind: "ip",
      risk: "high",
      evidenceIds: ["S-PA-02"],
      evidenceRefs: [{ evidenceId: "S-PA-02", relevance: "Matched 2 of 2 ingredients" }],
      sourceFact: "Entry S-PA-02 lists ashwagandha, brahmi for IN.",
      interpretation: "Matched 2 of 2 ingredients in entry S-PA-02",
    }),
    tk: finding({ kind: "tk" }),
    abs: finding({ kind: "abs", uncertainty: "insufficient_evidence" }),
    regulatory: finding({ kind: "regulatory" }),
  };
}

const NO_EVIDENCE: SampleEvidence[] = [];

describe("generateRedTeamFindings", () => {
  it("flags high-overlap findings with refs and split fact/interpretation", () => {
    const model: InnovationModel = baseModel();
    const results = generateRedTeamFindings("B", model, baseFindings(), NO_EVIDENCE);
    const overlap = results.find((r) => r.id === "rt-B-ip-overlap");
    expect(overlap).toBeDefined();
    expect(overlap?.category).toBe("prior_art");
    expect(overlap?.severity).toBe("high");
    expect(overlap?.evidenceIds).toEqual(["S-PA-02"]);
    expect(overlap?.sourceFact).not.toBe(overlap?.interpretation);
  });

  it("flags missing evidence, unvalidated claims, and jurisdiction gaps", () => {
    const model: InnovationModel = withJurisdiction(baseModel(), "WO");
    const results = generateRedTeamFindings("B", model, baseFindings(), NO_EVIDENCE);
    const categories = results.map((r) => r.category);
    expect(categories).toContain("missing_evidence");
    expect(categories).toContain("claim_overbreadth");
    const jurisdictionGap = results.find((r) => r.id === "rt-B-jurisdiction-WO");
    expect(jurisdictionGap?.uncertainty).toBe("insufficient_evidence");
  });
});

describe("groupFindingsByCategory", () => {
  it("groups findings under stable category labels", () => {
    const results = generateRedTeamFindings("B", baseModel(), baseFindings(), NO_EVIDENCE);
    const groups = groupFindingsByCategory(results);
    const labels = groups.map((g) => g.label);
    expect(labels).toContain(CATEGORY_LABEL.prior_art);
    expect(labels).toContain(CATEGORY_LABEL.missing_evidence);
    expect(groups.flatMap((g) => g.findings)).toHaveLength(results.length);
  });
});
