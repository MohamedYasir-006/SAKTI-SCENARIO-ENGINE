/**
 * Innovation model schemas (Phase 2 — foundations of trust).
 *
 * These Zod schemas are the single source of truth for the innovation
 * model. The TypeScript types below are derived via `z.infer`, so types
 * and schemas cannot drift apart.
 *
 * Discipline: strict objects, no coercion (`z.coerce` is banned here).
 * Unknown input is rejected with field-level errors, never silently
 * reshaped.
 */
import { z } from "zod";

export const JURISDICTION_CODES = ["IN", "US", "EP", "WO"] as const;

export const jurisdictionCodeSchema = z.enum(JURISDICTION_CODES, {
  errorMap: () => ({
    message: `Jurisdiction must be one of: ${JURISDICTION_CODES.join(", ")}.`,
  }),
});

export const PLANT_PARTS = [
  "root",
  "rhizome",
  "stem",
  "bark",
  "leaf",
  "flower",
  "fruit",
  "seed",
  "whole_plant",
  "other",
] as const;

export const plantPartSchema = z.enum(PLANT_PARTS);

export const QUANTITY_UNITS = [
  "mg",
  "g",
  "kg",
  "ml",
  "l",
  "parts",
  "percent",
] as const;

export const quantityUnitSchema = z.enum(QUANTITY_UNITS);

export const TEMPERATURE_UNITS = ["C", "F", "K"] as const;

export const temperatureUnitSchema = z.enum(TEMPERATURE_UNITS);

export const DURATION_UNITS = ["minutes", "hours", "days"] as const;

export const durationUnitSchema = z.enum(DURATION_UNITS);

export const ingredientQuantitySchema = z
  .object({
    amount: z.number({ invalid_type_error: "Quantity amount must be a number." }),
    unit: quantityUnitSchema,
  })
  .strict();

export const modeledIngredientSchema = z
  .object({
    id: z.string().min(1, "Ingredient id is required."),
    botanicalName: z.string().min(1, "Botanical name is required."),
    /** Common / Sanskrit synonyms, e.g. ["Ashwagandha", "अश्वगंधा"]. */
    synonyms: z.array(z.string().min(1)).default([]),
    plantPart: plantPartSchema,
    quantity: ingredientQuantitySchema,
  })
  .strict();

export const compositionRatioSchema = z
  .object({
    ingredientId: z.string().min(1, "Ratio must reference an ingredient id."),
    /** Share of the declared total, expressed in the total's unit. */
    share: z.number({ invalid_type_error: "Ratio share must be a number." }),
  })
  .strict();

export const compositionDeclarationSchema = z
  .object({
    total: ingredientQuantitySchema,
    ratios: z.array(compositionRatioSchema).min(1, "At least one ratio is required."),
  })
  .strict();

export const temperatureSchema = z
  .object({
    value: z.number({ invalid_type_error: "Temperature value must be a number." }),
    unit: temperatureUnitSchema,
  })
  .strict();

export const durationSchema = z
  .object({
    value: z.number({ invalid_type_error: "Duration value must be a number." }),
    unit: durationUnitSchema,
  })
  .strict();

export const solventSchema = z
  .object({
    name: z.string().min(1, "Solvent name is required."),
    quantityMl: z.number().positive("Solvent quantity must be positive.").optional(),
  })
  .strict();

export const processStepSchema = z
  .object({
    id: z.string().min(1, "Process step id is required."),
    order: z.number().int("Process step order must be an integer."),
    action: z.string().min(1, "Process step action is required."),
    temperature: temperatureSchema.optional(),
    duration: durationSchema.optional(),
    solvent: solventSchema.optional(),
  })
  .strict();

export const proposedClaimSchema = z
  .object({
    id: z.string().min(1, "Claim id is required."),
    text: z.string().min(1, "Claim text is required."),
  })
  .strict();

export const innovationModelSchema = z
  .object({
    id: z.string().min(1, "Innovation id is required."),
    title: z.string().min(1, "Innovation title is required."),
    ingredients: z.array(modeledIngredientSchema).min(1, "At least one ingredient is required."),
    composition: compositionDeclarationSchema,
    processSteps: z.array(processStepSchema).min(1, "At least one process step is required."),
    intendedUse: z.array(z.string().min(1)).min(1, "At least one intended use is required."),
    targetJurisdictions: z.array(jurisdictionCodeSchema).min(1, "At least one jurisdiction is required."),
    proposedClaims: z.array(proposedClaimSchema).min(1, "At least one proposed claim is required."),
  })
  .strict();

export type JurisdictionCode = z.infer<typeof jurisdictionCodeSchema>;
export type PlantPart = z.infer<typeof plantPartSchema>;
export type QuantityUnit = z.infer<typeof quantityUnitSchema>;
export type TemperatureUnit = z.infer<typeof temperatureUnitSchema>;
export type DurationUnit = z.infer<typeof durationUnitSchema>;
export type IngredientQuantity = z.infer<typeof ingredientQuantitySchema>;
export type ModeledIngredient = z.infer<typeof modeledIngredientSchema>;
export type CompositionRatio = z.infer<typeof compositionRatioSchema>;
export type CompositionDeclaration = z.infer<typeof compositionDeclarationSchema>;
export type Temperature = z.infer<typeof temperatureSchema>;
export type Duration = z.infer<typeof durationSchema>;
export type Solvent = z.infer<typeof solventSchema>;
export type ProcessStep = z.infer<typeof processStepSchema>;
export type ProposedClaim = z.infer<typeof proposedClaimSchema>;
export type InnovationModel = z.infer<typeof innovationModelSchema>;
