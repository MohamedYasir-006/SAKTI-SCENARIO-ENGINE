/**
 * Innovation model validator (Phase 2).
 *
 * Validates unknown input against the innovation model schemas and runs
 * cross-field checks (ratio totals, ingredient references, uniqueness).
 * Returns a typed result: either a valid model or a list of field-level
 * errors. Nothing is coerced and nothing fails silently.
 */
import { z } from "zod";
import {
  innovationModelSchema,
  type InnovationModel,
} from "@/lib/validation/innovation-model";

export interface FieldError {
  /** Dot-joined path, e.g. "ingredients.0.quantity.amount". */
  path: string;
  /** Stable machine-readable code, e.g. "ratio_sum_mismatch". */
  code: string;
  message: string;
}

export type ModelValidationResult =
  | { valid: true; value: InnovationModel; errors: [] }
  | { valid: false; value: null; errors: FieldError[] };

function toFieldError(issue: z.ZodIssue): FieldError {
  const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
  if (issue.code === z.ZodIssueCode.custom) {
    const customCode =
      typeof issue.params?.code === "string" ? issue.params.code : "custom";
    return { path, code: customCode, message: issue.message };
  }
  return { path, code: issue.code, message: issue.message };
}

/** Relative tolerance for ratio-sum comparison (float-safe). */
const RATIO_EPSILON = 1e-9;

export function validateInnovationModel(input: unknown): ModelValidationResult {
  const parsed = innovationModelSchema.safeParse(input);
  if (!parsed.success) {
    return { valid: false, value: null, errors: parsed.error.issues.map(toFieldError) };
  }

  const model = parsed.data;
  const errors: FieldError[] = [];

  // Ingredient ids must be unique.
  const seenIngredientIds = new Set<string>();
  for (const ingredient of model.ingredients) {
    if (seenIngredientIds.has(ingredient.id)) {
      errors.push({
        path: "ingredients",
        code: "duplicate_ingredient_id",
        message: `Duplicate ingredient id: "${ingredient.id}".`,
      });
    }
    seenIngredientIds.add(ingredient.id);
  }

  // Ratio shares must be finite, non-negative, reference known ingredients,
  // and sum to the declared total.
  let shareSum = 0;
  model.composition.ratios.forEach((ratio, index) => {
    if (!Number.isFinite(ratio.share) || ratio.share < 0) {
      errors.push({
        path: `composition.ratios.${index}.share`,
        code: "invalid_share",
        message: "Ratio share must be a finite, non-negative number.",
      });
    } else {
      shareSum += ratio.share;
    }
    if (!seenIngredientIds.has(ratio.ingredientId)) {
      errors.push({
        path: `composition.ratios.${index}.ingredientId`,
        code: "unknown_ingredient",
        message: `Ratio references unknown ingredient id: "${ratio.ingredientId}".`,
      });
    }
  });
  const total = model.composition.total.amount;
  if (Number.isFinite(total) && total >= 0) {
    const tolerance = RATIO_EPSILON * Math.max(1, Math.abs(total));
    if (Math.abs(shareSum - total) > tolerance) {
      errors.push({
        path: "composition.ratios",
        code: "ratio_sum_mismatch",
        message: `Ratio shares sum to ${shareSum} but the declared total is ${total}.`,
      });
    }
  }

  // Process step orders must be unique.
  const seenOrders = new Set<number>();
  model.processSteps.forEach((step, index) => {
    if (seenOrders.has(step.order)) {
      errors.push({
        path: `processSteps.${index}.order`,
        code: "duplicate_step_order",
        message: `Duplicate process step order: ${step.order}.`,
      });
    }
    seenOrders.add(step.order);
  });

  if (errors.length > 0) {
    return { valid: false, value: null, errors };
  }
  return { valid: true, value: model, errors: [] };
}
