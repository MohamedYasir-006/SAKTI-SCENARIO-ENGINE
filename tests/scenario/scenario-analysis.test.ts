/**
 * Scenario orchestration tests: selective re-run + not_discriminated case.
 */
import { describe, expect, it } from "vitest";
import { runSampleAnalysis } from "@/lib/analysis/sample-matcher";
import {
  analyzeVersion,
  changeDiscriminatedBy,
  NOT_DISCRIMINATED_TEXT,
  whyChanged,
} from "@/lib/scenario/scenario-analysis";
import { diffInnovationModels } from "@/lib/scenario/version-diff";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import rawEvidence from "@/data/demo/ashwabrahm/evidence.json";
import { parseSampleEvidence } from "@/lib/evidence/sample-evidence";
import { baseModel, withJurisdiction, withPercentage } from "./fixtures";

function sampleEvidence(): SampleEvidence[] {
  const parsed = parseSampleEvidence(rawEvidence);
  if (!parsed.valid) throw new Error("Sample evidence should parse");
  return parsed.items;
}

describe("analyzeVersion", () => {
  it("re-runs only affected modules and reuses the rest", () => {
    const base = baseModel();
    const evidence = sampleEvidence();
    const baseFindings = runSampleAnalysis(base, evidence);
    const variant = withPercentage(base, "Ashwagandha", 70);
    const analysis = analyzeVersion("B", base, baseFindings, variant, evidence);
    expect(analysis.reRan).toEqual(["ip", "tk"]);
    expect(analysis.findings.abs).toBe(baseFindings.abs);
    expect(analysis.findings.regulatory).toBe(baseFindings.regulatory);
    expect(analysis.changes).toHaveLength(1);
  });

  it("marks module cells the corpus cannot discriminate", () => {
    const base = baseModel();
    const evidence = sampleEvidence();
    const baseFindings = runSampleAnalysis(base, evidence);
    // WO has a prior-art entry but no TK/ABS/regulatory entries.
    const analysis = analyzeVersion("B", base, baseFindings, withJurisdiction(base, "WO"), evidence);
    expect(analysis.reRan).toEqual(["ip", "tk", "abs", "regulatory"]);
    expect(analysis.findings.tk.uncertainty).toBe("not_discriminated_by_corpus");
    expect(analysis.findings.tk.interpretation).toBe(NOT_DISCRIMINATED_TEXT);
    expect(analysis.findings.abs.uncertainty).toBe("not_discriminated_by_corpus");
    expect(analysis.findings.regulatory.uncertainty).toBe("not_discriminated_by_corpus");
    // IP is discriminated by the WO prior-art entry: matcher output kept.
    expect(analysis.findings.ip.uncertainty).not.toBe("not_discriminated_by_corpus");
  });

  it("derives why-changed lines from outputs only", () => {
    const base = baseModel();
    const evidence = sampleEvidence();
    const baseFindings = runSampleAnalysis(base, evidence);
    const same = analyzeVersion("B", base, baseFindings, base, evidence);
    expect(same.changes).toEqual([]);
    expect(whyChanged(baseFindings.ip, same.findings.ip)).toBe("Unchanged from base.");
  });
});

describe("changeDiscriminatedBy", () => {
  it("detects ratio-range coverage for a percentage change", () => {
    const evidence = sampleEvidence();
    const [change] = diffInnovationModels(baseModel(), withPercentage(baseModel(), "Ashwagandha", 70));
    expect(changeDiscriminatedBy(change, "ip", evidence)).toBe(true);
    // S-RG-01 lists ashwagandha, so regulatory is also discriminated.
    expect(changeDiscriminatedBy(change, "regulatory", evidence)).toBe(true);
  });

  it("reports false when no entry of the module type covers the change", () => {
    const evidence = sampleEvidence();
    const [change] = diffInnovationModels(baseModel(), withJurisdiction(baseModel(), "WO"));
    expect(changeDiscriminatedBy(change, "ip", evidence)).toBe(true);
    expect(changeDiscriminatedBy(change, "regulatory", evidence)).toBe(false);
  });
});
