/**
 * Innovation form → innovation model mapping (working prototype).
 *
 * Converts raw form values into the shape of the Phase 2 innovation
 * model WITHOUT coercion, then hands it to the existing validator
 * (`validateInnovationModel`), which reports field-level errors.
 */
import { JURISDICTION_CODES } from "@/lib/validation/innovation-model";

export const EXTRACTION_METHODS = [
  "Decoction (hot-water extraction)",
  "Cold maceration",
  "Steam distillation",
  "Low-temperature vacuum drying",
] as const;

export interface IngredientRow {
  name: string;
  /** Raw percentage value; passed through untouched (no coercion). */
  percentage: unknown;
}

export interface InnovationFormData {
  ingredients: IngredientRow[];
  extractionMethod: string;
  intendedUse: string;
  jurisdiction: string;
}

export function emptyForm(): InnovationFormData {
  return {
    ingredients: [
      { name: "Ashwagandha", percentage: 60 },
      { name: "Brahmi", percentage: 40 },
    ],
    extractionMethod: EXTRACTION_METHODS[0],
    intendedUse: "General wellness",
    jurisdiction: JURISDICTION_CODES[0],
  };
}

/**
 * Build an innovation-model-shaped object from raw form data.
 * Values are passed through as-is so the validator (not this mapper)
 * decides what is acceptable.
 */
export function formToModelInput(form: InnovationFormData, opts?: { title?: string }): unknown {
  return {
    id: "form-innovation",
    title: opts?.title ?? "Form innovation (prototype)",
    ingredients: form.ingredients.map((row, index) => ({
      id: `ing-${index + 1}`,
      botanicalName: row.name,
      synonyms: [],
      plantPart: "other",
      quantity: { amount: row.percentage, unit: "percent" },
    })),
    composition: {
      total: { amount: 100, unit: "percent" },
      ratios: form.ingredients.map((row, index) => ({
        ingredientId: `ing-${index + 1}`,
        share: row.percentage,
      })),
    },
    processSteps: [
      { id: "step-1", order: 0, action: form.extractionMethod },
    ],
    intendedUse: [form.intendedUse],
    targetJurisdictions: [form.jurisdiction],
    proposedClaims: [
      {
        id: "claim-1",
        text: `Herbal formulation for ${form.intendedUse} (illustrative prototype claim).`,
      },
    ],
  };
}
