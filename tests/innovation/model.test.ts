/**
 * Innovation model validation tests (Phase 2).
 * Fixtures are illustrative only — no real formulation is asserted.
 */
import { describe, expect, it } from "vitest";
import { validateInnovationModel } from "@/lib/innovation/model-validator";

function validModelFixture(): Record<string, unknown> {
  return {
    id: "demo-ashwabrahm",
    title: "AshwaBrahm Low-Temperature Herbal Formulation (illustrative)",
    ingredients: [
      {
        id: "ing-ashwagandha",
        botanicalName: "Withania somnifera (illustrative)",
        synonyms: ["Ashwagandha"],
        plantPart: "root",
        quantity: { amount: 60, unit: "parts" },
      },
      {
        id: "ing-brahmi",
        botanicalName: "Bacopa monnieri (illustrative)",
        synonyms: ["Brahmi"],
        plantPart: "leaf",
        quantity: { amount: 40, unit: "parts" },
      },
    ],
    composition: {
      total: { amount: 100, unit: "parts" },
      ratios: [
        { ingredientId: "ing-ashwagandha", share: 60 },
        { ingredientId: "ing-brahmi", share: 40 },
      ],
    },
    processSteps: [
      {
        id: "step-dry",
        order: 0,
        action: "Shade-dry raw material (illustrative)",
        temperature: { value: 40, unit: "C" },
        duration: { value: 2, unit: "days" },
      },
    ],
    intendedUse: ["General wellness illustration only"],
    targetJurisdictions: ["IN"],
    proposedClaims: [{ id: "claim-1", text: "Illustrative claim text." }],
  };
}

describe("validateInnovationModel", () => {
  it("accepts a valid model", () => {
    const result = validateInnovationModel(validModelFixture());
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.id).toBe("demo-ashwabrahm");
      expect(result.errors).toEqual([]);
    }
  });

  it("rejects structurally invalid input with field-level errors", () => {
    const fixture = validModelFixture();
    const ingredients = fixture.ingredients as Record<string, unknown>[];
    ingredients[0] = { ...ingredients[0], botanicalName: "" };
    // String amount must NOT be coerced to a number.
    ingredients[1] = {
      ...(ingredients[1] as object),
      quantity: { amount: "40", unit: "parts" },
    };
    const result = validateInnovationModel(fixture);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.value).toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain("ingredients.0.botanicalName");
      expect(paths).toContain("ingredients.1.quantity.amount");
      for (const error of result.errors) {
        expect(error.code.length).toBeGreaterThan(0);
      }
    }
  });

  it("rejects ratio shares that do not sum to the declared total", () => {
    const fixture = validModelFixture();
    (fixture.composition as Record<string, unknown>).ratios = [
      { ingredientId: "ing-ashwagandha", share: 60 },
      { ingredientId: "ing-brahmi", share: 30 },
    ];
    const result = validateInnovationModel(fixture);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      const codes = result.errors.map((e) => e.code);
      expect(codes).toContain("ratio_sum_mismatch");
    }
  });

  it("rejects ratios referencing unknown ingredients", () => {
    const fixture = validModelFixture();
    (fixture.composition as Record<string, unknown>).ratios = [
      { ingredientId: "ing-ashwagandha", share: 60 },
      { ingredientId: "ing-ghost", share: 40 },
    ];
    const result = validateInnovationModel(fixture);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      const codes = result.errors.map((e) => e.code);
      expect(codes).toContain("unknown_ingredient");
    }
  });
});
