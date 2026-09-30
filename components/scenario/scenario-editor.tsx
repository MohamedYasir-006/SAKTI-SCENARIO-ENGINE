"use client";

import type { InnovationModel } from "@/lib/validation/innovation-model";
import { EXTRACTION_METHODS } from "@/lib/innovation/form-mapper";
import { JURISDICTION_CODES } from "@/lib/validation/innovation-model";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none";

/**
 * Edits a scenario variant: ingredient percentages, extraction method,
 * jurisdiction. Produces a full model; the workbench validates it.
 */
export function ScenarioEditor({
  version,
  model,
  onChange,
}: {
  version: string;
  model: InnovationModel;
  onChange: (model: InnovationModel) => void;
}): React.JSX.Element {
  function setPercentage(id: string, raw: string): void {
    const value = raw === "" ? "" : Number(raw);
    onChange({
      ...model,
      ingredients: model.ingredients.map((ingredient) =>
        ingredient.id === id
          ? {
              ...ingredient,
              quantity: { ...ingredient.quantity, amount: value as unknown as number },
            }
          : ingredient
      ),
      composition: {
        ...model.composition,
        ratios: model.composition.ratios.map((ratio) =>
          ratio.ingredientId === id ? { ...ratio, share: value as unknown as number } : ratio
        ),
      },
    });
  }

  function setMethod(action: string): void {
    onChange({
      ...model,
      processSteps: model.processSteps.map((step, index) =>
        index === 0 ? { ...step, action } : step
      ),
    });
  }

  function setJurisdiction(code: string): void {
    onChange({ ...model, targetJurisdictions: [code as (typeof model.targetJurisdictions)[number]] });
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-base font-semibold text-primary-900">Version {version}</h3>
      <div className="mt-3 space-y-2">
        {model.ingredients.map((ingredient) => (
          <label key={ingredient.id} className="flex items-center gap-2 text-sm text-slate-700">
            <span className="w-40 truncate">{ingredient.botanicalName}</span>
            <input
              aria-label={`${version} ${ingredient.botanicalName} percentage`}
              className={`${inputClass} w-24`}
              inputMode="decimal"
              value={
                typeof ingredient.quantity.amount === "number" &&
                !Number.isNaN(ingredient.quantity.amount)
                  ? String(ingredient.quantity.amount)
                  : ""
              }
              onChange={(event) => setPercentage(ingredient.id, event.target.value)}
            />
            <span className="text-slate-500">%</span>
          </label>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Extraction method
          <select
            className={`${inputClass} mt-1`}
            value={model.processSteps[0]?.action ?? ""}
            onChange={(event) => setMethod(event.target.value)}
          >
            {EXTRACTION_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Jurisdiction
          <select
            className={`${inputClass} mt-1`}
            value={model.targetJurisdictions[0] ?? ""}
            onChange={(event) => setJurisdiction(event.target.value)}
          >
            {JURISDICTION_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
