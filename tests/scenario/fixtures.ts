/**
 * Shared scenario test fixtures (illustrative prototype data).
 */
import { formToModelInput, type InnovationFormData } from "@/lib/innovation/form-mapper";
import { validateInnovationModel } from "@/lib/innovation/model-validator";
import type { InnovationModel } from "@/lib/validation/innovation-model";

export function baseModel(): InnovationModel {
  const form: InnovationFormData = {
    ingredients: [
      { name: "Ashwagandha", percentage: 60 },
      { name: "Brahmi", percentage: 40 },
    ],
    extractionMethod: "Decoction (hot-water extraction)",
    intendedUse: "General wellness",
    jurisdiction: "IN",
  };
  const result = validateInnovationModel(formToModelInput(form));
  if (!result.valid) throw new Error("Base fixture should be valid");
  return result.value;
}

export function withPercentage(model: InnovationModel, name: string, percentage: number): InnovationModel {
  const next: InnovationModel = JSON.parse(JSON.stringify(model)) as InnovationModel;
  for (const ingredient of next.ingredients) {
    if (ingredient.botanicalName === name) {
      ingredient.quantity.amount = percentage;
    }
  }
  for (const ratio of next.composition.ratios) {
    const ingredient = next.ingredients.find((i) => i.id === ratio.ingredientId);
    if (ingredient?.botanicalName === name) ratio.share = percentage;
  }
  return next;
}

export function withJurisdiction(model: InnovationModel, code: string): InnovationModel {
  return {
    ...model,
    targetJurisdictions: [code as (typeof model.targetJurisdictions)[number]],
  };
}
