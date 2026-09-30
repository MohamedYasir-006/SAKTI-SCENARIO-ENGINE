/**
 * Demo loader (working prototype, no database).
 *
 * Reads demo values from data/demo/ashwabrahm/innovation.json and
 * scenarios.json (never hard-coded here), builds validated models via
 * the existing form mapper + validator, and hands them to localStorage.
 */
import { z } from "zod";
import { formToModelInput } from "@/lib/innovation/form-mapper";
import {
  validateInnovationModel,
  type ModelValidationResult,
} from "@/lib/innovation/model-validator";
import type { InnovationModel } from "@/lib/validation/innovation-model";

const demoFormSchema = z
  .object({
    ingredients: z.array(
      z.object({ name: z.string(), percentage: z.number() })
    ),
    extractionMethod: z.string(),
    intendedUse: z.string(),
    jurisdiction: z.string(),
  })
  .strict();

const demoInnovationFileSchema = z
  .object({
    title: z.string().min(1).optional(),
    form: demoFormSchema,
  })
  .passthrough();

const demoScenariosFileSchema = z
  .object({
    versionB: z
      .object({
        percentages: z.record(z.string(), z.number()),
        extractionMethod: z.string(),
      })
      .strict(),
    versionC: z.object({ jurisdiction: z.string() }).strict(),
  })
  .passthrough();

export type DemoForm = z.infer<typeof demoFormSchema>;
export type DemoScenarioSpec = z.infer<typeof demoScenariosFileSchema>;

export function parseDemoInnovation(input: unknown): {
  valid: boolean;
  title: string | null;
  form: DemoForm | null;
  errors: string[];
} {
  const parsed = demoInnovationFileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      valid: false,
      title: null,
      form: null,
      errors: parsed.error.issues.map((issue) => {
        const at = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        return `${at}: ${issue.message}`;
      }),
    };
  }
  return { valid: true, title: parsed.data.title ?? null, form: parsed.data.form, errors: [] };
}

export function parseDemoScenarios(input: unknown): {
  valid: boolean;
  spec: DemoScenarioSpec | null;
  errors: string[];
} {
  const parsed = demoScenariosFileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      valid: false,
      spec: null,
      errors: parsed.error.issues.map((issue) => {
        const at = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        return `${at}: ${issue.message}`;
      }),
    };
  }
  return { valid: true, spec: parsed.data, errors: [] };
}

/** Build + validate the demo base model from the demo innovation file. */
export function buildDemoModel(demoInnovationJson: unknown): ModelValidationResult {
  const parsed = parseDemoInnovation(demoInnovationJson);
  if (!parsed.valid || !parsed.form) {
    return {
      valid: false,
      value: null,
      errors: parsed.errors.map((message) => ({ path: "(demo file)", code: "invalid_demo", message })),
    };
  }
  return validateInnovationModel(
    formToModelInput(
      {
        ingredients: parsed.form.ingredients.map((row) => ({ ...row })),
        extractionMethod: parsed.form.extractionMethod,
        intendedUse: parsed.form.intendedUse,
        jurisdiction: parsed.form.jurisdiction,
      },
      parsed.title ? { title: parsed.title } : undefined
    )
  );
}

function clone(model: InnovationModel): InnovationModel {
  return JSON.parse(JSON.stringify(model)) as InnovationModel;
}

function applyPercentages(
  model: InnovationModel,
  percentages: Record<string, number>
): { model: InnovationModel; unknown: string[] } {
  const next = clone(model);
  const unknown: string[] = [];
  for (const [name, share] of Object.entries(percentages)) {
    const ingredient = next.ingredients.find((i) => i.botanicalName === name);
    if (!ingredient) {
      unknown.push(name);
      continue;
    }
    ingredient.quantity.amount = share;
    const ratio = next.composition.ratios.find((r) => r.ingredientId === ingredient.id);
    if (ratio) ratio.share = share;
  }
  return { model: next, unknown };
}

export interface DemoVariants {
  versionB: InnovationModel;
  versionC: InnovationModel;
}

/**
 * Build Versions B and C from the base model + demo scenarios file.
 * B applies the spec percentages + method; C copies B and moves jurisdiction.
 */
export function buildDemoVariants(
  base: InnovationModel,
  demoScenariosJson: unknown
): { valid: true; variants: DemoVariants } | { valid: false; errors: string[] } {
  const parsed = parseDemoScenarios(demoScenariosJson);
  if (!parsed.valid || !parsed.spec) return { valid: false, errors: parsed.errors };

  const applied = applyPercentages(base, parsed.spec.versionB.percentages);
  if (applied.unknown.length > 0) {
    return { valid: false, errors: applied.unknown.map((name) => `Unknown ingredient in demo spec: ${name}`) };
  }
  let versionB = applied.model;
  versionB = {
    ...versionB,
    processSteps: versionB.processSteps.map((step, index) =>
      index === 0 ? { ...step, action: parsed.spec?.versionB.extractionMethod ?? step.action } : step
    ),
  };
  const checkedB = validateInnovationModel(versionB);
  if (!checkedB.valid) {
    return {
      valid: false,
      errors: checkedB.errors.map((e) => `Version B: ${e.path} — ${e.message}`),
    };
  }

  const versionC: InnovationModel = {
    ...clone(checkedB.value),
    targetJurisdictions: [
      parsed.spec.versionC.jurisdiction as (typeof base.targetJurisdictions)[number],
    ],
  };
  const checkedC = validateInnovationModel(versionC);
  if (!checkedC.valid) {
    return {
      valid: false,
      errors: checkedC.errors.map((e) => `Version C: ${e.path} — ${e.message}`),
    };
  }
  return { valid: true, variants: { versionB: checkedB.value, versionC: checkedC.value } };
}
