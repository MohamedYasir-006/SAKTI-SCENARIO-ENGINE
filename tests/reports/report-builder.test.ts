/**
 * Report assembly tests (prototype, deterministic).
 */
import { describe, expect, it } from "vitest";
import { runSampleAnalysis } from "@/lib/analysis/sample-matcher";
import { analyzeVersion } from "@/lib/scenario/scenario-analysis";
import { buildReportData } from "@/lib/reports/report-builder";
import { parseSampleEvidence } from "@/lib/evidence/sample-evidence";
import { buildDemoModel } from "@/lib/demo/demo-loader";
import demoInnovationJson from "@/data/demo/ashwabrahm/innovation.json";
import rawEvidence from "@/data/demo/ashwabrahm/evidence.json";
import { baseModel, withJurisdiction } from "../scenario/fixtures";

function evidence() {
  const parsed = parseSampleEvidence(rawEvidence);
  if (!parsed.valid) throw new Error("Sample evidence should parse");
  return parsed.items;
}

describe("buildReportData", () => {
  it("assembles a report without versions", () => {
    const demo = buildDemoModel(demoInnovationJson);
    if (!demo.valid) throw new Error("Demo base should be valid");
    const items = evidence();
    const report = buildReportData({
      innovation: demo.value,
      baseFindings: runSampleAnalysis(demo.value, items),
      evidence: items,
      generatedAt: "2026-09-30T00:00:00.000Z",
    });
    expect(report.innovationTitle).toContain("AshwaBrahm");
    expect(report.versions).toEqual([]);
    expect(report.redTeam.length).toBeGreaterThan(0);
    expect(report.reviewPoints.length).toBeGreaterThan(0);
    for (const cited of report.citedEvidence) {
      expect(cited.entry.label).toBe("Prototype / illustrative evidence");
    }
  });

  it("assembles a report with versions, gaps, and per-version red team", () => {
    const base = baseModel();
    const items = evidence();
    const baseFindings = runSampleAnalysis(base, items);
    const wo = analyzeVersion("C", base, baseFindings, withJurisdiction(base, "WO"), items);
    const report = buildReportData({
      innovation: base,
      baseFindings,
      evidence: items,
      versions: [
        { version: wo.version, model: wo.model, changes: wo.changes, findings: wo.findings, gaps: wo.gaps },
      ],
    });
    expect(report.versions).toHaveLength(1);
    expect(report.gaps.some((g) => g.where.includes("Version C"))).toBe(true);
    expect(report.redTeam.some((f) => f.id.startsWith("rt-C-"))).toBe(true);
    expect(report.reviewPoints.some((p) => p.includes("Version C"))).toBe(true);
  });
});
