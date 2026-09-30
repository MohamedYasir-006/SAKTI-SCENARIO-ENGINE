/**
 * Rubric determinism tests (Phase 2).
 * The example rule is illustrative only — thresholds are not validated.
 */
import { describe, expect, it } from "vitest";
import {
  evaluateIndicator,
  RUBRIC_VERSION,
  type EvidenceAttributes,
} from "@/lib/analysis/rubric.config";

const ATTRS: EvidenceAttributes = {
  verifiedSourceCount: 1,
  targetJurisdictionSourceCount: 1,
  conflictingSourceCount: 0,
  totalSourceCount: 2,
};

describe("evaluateIndicator", () => {
  it("is deterministic for identical input", () => {
    const first = evaluateIndicator("ip", ATTRS);
    const second = evaluateIndicator("ip", { ...ATTRS });
    expect(second).toEqual(first);
  });

  it("matches the labelled IP example rule", () => {
    const result = evaluateIndicator("ip", ATTRS);
    expect(result.module).toBe("ip");
    expect(result.rubricVersion).toBe(RUBRIC_VERSION);
    expect(result.level).toBe("medium");
    expect(result.matchedRuleId).toBe("ip.verified-source-present.example");
  });

  it("falls back to indeterminate when no rule matches", () => {
    const result = evaluateIndicator("ip", {
      verifiedSourceCount: 0,
      targetJurisdictionSourceCount: 0,
      conflictingSourceCount: 0,
      totalSourceCount: 0,
    });
    expect(result.level).toBe("indeterminate");
    expect(result.matchedRuleId).toBeNull();
  });

  it("returns indeterminate for modules with no rules yet", () => {
    for (const module of ["tk", "abs", "regulatory"] as const) {
      const result = evaluateIndicator(module, ATTRS);
      expect(result.level).toBe("indeterminate");
    }
  });
});
