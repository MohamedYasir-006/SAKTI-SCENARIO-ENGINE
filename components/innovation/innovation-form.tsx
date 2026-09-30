"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EXTRACTION_METHODS,
  emptyForm,
  type IngredientRow,
  type InnovationFormData,
} from "@/lib/innovation/form-mapper";
import { JURISDICTION_CODES } from "@/lib/validation/innovation-model";
import { Plus, Trash2 } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none";

function percentageToText(value: unknown): string {
  return typeof value === "number" && !Number.isNaN(value) ? String(value) : (value as string) ?? "";
}

export function InnovationForm({
  onSubmit,
}: {
  onSubmit: (form: InnovationFormData) => void;
}): React.JSX.Element {
  const [form, setForm] = useState<InnovationFormData>(() => emptyForm());

  function updateRow(index: number, patch: Partial<IngredientRow>): void {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((row, i) =>
        i === index ? { ...row, ...patch } : row
      ),
    }));
  }

  function addRow(): void {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", percentage: "" }],
    }));
  }

  function removeRow(index: number): void {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  }

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <h2 className="text-base font-semibold text-primary-900">Describe your innovation</h2>
      <p className="mt-1 text-sm text-slate-600">
        Percentages should add up to 100. Everything is illustrative prototype data.
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Ingredients</span>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-3 w-3" /> Add row
          </Button>
        </div>
        {form.ingredients.map((row, index) => (
          <div key={index} className="flex gap-2">
            <input
              aria-label={`Ingredient ${index + 1} name`}
              className={inputClass}
              placeholder="Ingredient name (e.g. Ashwagandha)"
              value={row.name}
              onChange={(event) => updateRow(index, { name: event.target.value })}
            />
            <input
              aria-label={`Ingredient ${index + 1} percentage`}
              className={`${inputClass} w-28`}
              placeholder="%"
              inputMode="decimal"
              value={percentageToText(row.percentage)}
              onChange={(event) => {
                const raw = event.target.value;
                // Numeric text becomes a number; anything else passes through
                // untouched so the validator (not the form) rejects it.
                updateRow(index, { percentage: raw === "" ? "" : Number(raw) });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove ingredient ${index + 1}`}
              onClick={() => removeRow(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Extraction method
          <select
            className={`${inputClass} mt-1`}
            value={form.extractionMethod}
            onChange={(event) => setForm((prev) => ({ ...prev, extractionMethod: event.target.value }))}
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
            value={form.jurisdiction}
            onChange={(event) => setForm((prev) => ({ ...prev, jurisdiction: event.target.value }))}
          >
            {JURISDICTION_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Intended use
        <input
          className={`${inputClass} mt-1`}
          placeholder="e.g. General wellness"
          value={form.intendedUse}
          onChange={(event) => setForm((prev) => ({ ...prev, intendedUse: event.target.value }))}
        />
      </label>

      <div className="mt-6">
        <Button type="submit">Validate & analyse</Button>
      </div>
    </form>
  );
}
