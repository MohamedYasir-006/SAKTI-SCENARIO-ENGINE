/**
 * Sample matcher tests (prototype, no LLM).
 */
import { describe, expect, it } from "vitest";
import {
  analyzeModule,
  NO_MATCH_INTERPRETATION,
  runSampleAnalysis,
} from "@/lib/analysis/sample-matcher";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import { formToModelInput, type InnovationFormData } from "@/lib/innovation/form-mapper";
import { validateInnovationModel } from "@/lib/innovation/model-validator";
import type { InnovationModel } from "@/lib/validation/innovation-model";

const LABEL = "Prototype / illustrative evidence" as const;

function entry(partial: Partial<SampleEvidence> & { id: string }): SampleEvidence {
  return {
    title: `Sample ${partial.id}`,
    type: "prior_art",
    jurisdiction: "IN",
    relatedIngredients: [],
    relatedProcess: [],
    summary: "Illustrative summary.",
    label: LABEL,
    ...partial,
  };
}

const EVIDENCE: SampleEvidence[] = [
  entry({
    id: "S-PA-01",
    title: "Ashwagandha decoction note",
    relatedIngredients: ["ashwagandha"],
    relatedProcess: ["Decoction (hot-water extraction)"],
  }),
  entry({
    id: "S-TK-01",
    type: "traditional_knowledge",
    title: "Ashwagandha traditional use note",
    relatedIngredients: ["ashwagandha"],
  }),
];

function validModel(form: InnovationFormData): InnovationModel {
  const result = validateInnovationModel(formToModelInput(form));
  if (!result.valid) throw new Error("Fixture form should be valid");
  return result.value;
}

const MATCHING_FORM: InnovationFormData = {
  ingredients: [
    { name: "Ashwagandha", percentage: 60 },
    { name: "Brahmi", percentage: 40 },
  ],
  extractionMethod: "Decoction (hot-water extraction)",
  intendedUse: "General wellness",
  jurisdiction: "IN",
};

describe("analyzeModule", () => {
  it("returns matched evidence refs and a one-line interpretation", () => {
    const finding = analyzeModule("ip", validModel(MATCHING_FORM), EVIDENCE);
    expect(finding.evidenceIds).toEqual(["S-PA-01"]);
    expect(finding.evidenceRefs).toHaveLength(1);
    expect(finding.sourceFact).toContain("S-PA-01");
    expect(finding.interpretation).toContain("Matched 1 of 2 ingredients in entry S-PA-01");
    expect(finding.uncertainty).toBe("needs_professional_review");
  });

  it("only screens the module's own evidence type", () => {
    const finding = analyzeModule("tk", validModel(MATCHING_FORM), EVIDENCE);
    expect(finding.evidenceIds).toEqual(["S-TK-01"]);
  });

  it("returns insufficient_evidence when nothing matches", () => {
    const form: InnovationFormData = {
      ...MATCHING_FORM,
      ingredients: [{ name: "Moringa", percentage: 100 }],
      extractionMethod: "Steam distillation",
    };
    const finding = analyzeModule("ip", validModel(form), EVIDENCE);
    expect(finding.uncertainty).toBe("insufficient_evidence");
    expect(finding.evidenceIds).toEqual([]);
    expect(finding.interpretation).toBe(NO_MATCH_INTERPRETATION);
  });
});

describe("runSampleAnalysis", () => {
  it("returns one finding per module", () => {
    const results = runSampleAnalysis(validModel(MATCHING_FORM), EVIDENCE);
    expect(Object.keys(results).sort()).toEqual(["abs", "ip", "regulatory", "tk"]);
    for (const finding of Object.values(results)) {
      expect(finding.sourceFact.length).toBeGreaterThan(0);
      expect(finding.interpretation.length).toBeGreaterThan(0);
    }
  });
});
