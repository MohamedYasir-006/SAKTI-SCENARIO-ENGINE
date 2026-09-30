/**
 * Version diff + dependency map (working prototype).
 *
 * Compares two innovation models field-by-field and maps each changed
 * field to the analyzer modules it affects, so only affected modules
 * are re-run. Pure and deterministic.
 */
import type { AnalysisKind } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";

export type ChangeField =
  | "ingredients"
  | "percentages"
  | "extractionMethod"
  | "jurisdiction"
  | "intendedUse";

export interface FieldChange {
  field: ChangeField;
  /** JSON-style path, e.g. "ingredients.ing-1.percentage". */
  path: string;
  label: string;
  oldValue: string;
  newValue: string;
  /** Extra context for discrimination checks (ingredient name, code…). */
  detail: string;
}

/**
 * Which changed field affects which module.
 * Percentages move IP/TK coverage; jurisdiction gates every match;
 * extraction method feeds IP and regulatory process checks.
 */
export const FIELD_MODULE_MAP: Record<ChangeField, AnalysisKind[]> = {
  ingredients: ["ip", "tk", "abs", "regulatory"],
  percentages: ["ip", "tk"],
  extractionMethod: ["ip", "regulatory"],
  jurisdiction: ["ip", "tk", "abs", "regulatory"],
  intendedUse: ["regulatory"],
};

function formatPercent(value: number): string {
  return `${value}%`;
}

/** List changed fields between two models (old → next). */
export function diffInnovationModels(
  oldModel: InnovationModel,
  nextModel: InnovationModel
): FieldChange[] {
  const changes: FieldChange[] = [];

  const oldById = new Map(oldModel.ingredients.map((i) => [i.id, i]));
  const nextById = new Map(nextModel.ingredients.map((i) => [i.id, i]));

  for (const [id, next] of nextById) {
    const old = oldById.get(id);
    if (!old) {
      changes.push({
        field: "ingredients",
        path: `ingredients.${id}`,
        label: `Ingredient added: ${next.botanicalName}`,
        oldValue: "—",
        newValue: `${next.botanicalName} ${formatPercent(next.quantity.amount)}`,
        detail: next.botanicalName,
      });
      continue;
    }
    if (old.botanicalName !== next.botanicalName) {
      changes.push({
        field: "ingredients",
        path: `ingredients.${id}.name`,
        label: `Ingredient renamed: ${old.botanicalName} → ${next.botanicalName}`,
        oldValue: old.botanicalName,
        newValue: next.botanicalName,
        detail: next.botanicalName,
      });
    }
    if (old.quantity.amount !== next.quantity.amount) {
      changes.push({
        field: "percentages",
        path: `ingredients.${id}.percentage`,
        label: `${next.botanicalName} percentage changed`,
        oldValue: formatPercent(old.quantity.amount),
        newValue: formatPercent(next.quantity.amount),
        detail: next.botanicalName,
      });
    }
  }
  for (const [id, old] of oldById) {
    if (!nextById.has(id)) {
      changes.push({
        field: "ingredients",
        path: `ingredients.${id}`,
        label: `Ingredient removed: ${old.botanicalName}`,
        oldValue: `${old.botanicalName} ${formatPercent(old.quantity.amount)}`,
        newValue: "—",
        detail: old.botanicalName,
      });
    }
  }

  const oldAction = oldModel.processSteps[0]?.action ?? "";
  const nextAction = nextModel.processSteps[0]?.action ?? "";
  if (oldAction !== nextAction) {
    changes.push({
      field: "extractionMethod",
      path: "processSteps.0.action",
      label: "Extraction method changed",
      oldValue: oldAction || "—",
      newValue: nextAction || "—",
      detail: nextAction,
    });
  }

  const oldJurisdiction = oldModel.targetJurisdictions.join(", ");
  const nextJurisdiction = nextModel.targetJurisdictions.join(", ");
  if (oldJurisdiction !== nextJurisdiction) {
    changes.push({
      field: "jurisdiction",
      path: "targetJurisdictions",
      label: "Jurisdiction changed",
      oldValue: oldJurisdiction || "—",
      newValue: nextJurisdiction || "—",
      detail: nextJurisdiction,
    });
  }

  const oldUse = oldModel.intendedUse.join("; ");
  const nextUse = nextModel.intendedUse.join("; ");
  if (oldUse !== nextUse) {
    changes.push({
      field: "intendedUse",
      path: "intendedUse",
      label: "Intended use changed",
      oldValue: oldUse || "—",
      newValue: nextUse || "—",
      detail: nextUse,
    });
  }

  return changes;
}

/** Modules affected by a list of changes (deduped, stable order). */
export function affectedModules(changes: FieldChange[]): AnalysisKind[] {
  const order: AnalysisKind[] = ["ip", "tk", "abs", "regulatory"];
  const affected = new Set<AnalysisKind>();
  for (const change of changes) {
    for (const module of FIELD_MODULE_MAP[change.field]) affected.add(module);
  }
  return order.filter((module) => affected.has(module));
}
