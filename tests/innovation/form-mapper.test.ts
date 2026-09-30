/**
 * Form-to-model conversion tests (prototype).
 */
import { describe, expect, it } from "vitest";
import {
  formToModelInput,
  type InnovationFormData,
} from "@/lib/innovation/form-mapper";
import { validateInnovationModel } from "@/lib/innovation/model-validator";

function baseForm(): InnovationFormData {
  return {
    ingredients: [
      { name: "Ashwagandha", percentage: 60 },
      { name: "Brahmi", percentage: 40 },
    ],
    extractionMethod: "Decoction (hot-water extraction)",
    intendedUse: "General wellness",
    jurisdiction: "IN",
  };
}

describe("formToModelInput + validateInnovationModel", () => {
  it("converts a valid form into a valid model", () => {
    const result = validateInnovationModel(formToModelInput(baseForm()));
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.ingredients).toHaveLength(2);
      expect(result.value.composition.total.amount).toBe(100);
      expect(result.value.targetJurisdictions).toEqual(["IN"]);
    }
  });

  it("surfaces ratio_sum_mismatch when percentages do not total 100", () => {
    const form = baseForm();
    form.ingredients = [
      { name: "Ashwagandha", percentage: 60 },
      { name: "Brahmi", percentage: 30 },
    ];
    const result = validateInnovationModel(formToModelInput(form));
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.map((e) => e.code)).toContain("ratio_sum_mismatch");
    }
  });

  it("surfaces field errors for an empty ingredient name", () => {
    const form = baseForm();
    form.ingredients = [{ name: "", percentage: 100 }];
    const result = validateInnovationModel(formToModelInput(form));
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.map((e) => e.path)).toContain("ingredients.0.botanicalName");
    }
  });

  it("does not coerce non-numeric percentages", () => {
    const form = baseForm();
    form.ingredients = [{ name: "Ashwagandha", percentage: "sixty" }];
    const result = validateInnovationModel(formToModelInput(form));
    expect(result.valid).toBe(false);
  });
});
