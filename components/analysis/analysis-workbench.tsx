"use client";

import { useEffect, useRef, useState } from "react";
import { AnalysisCard } from "@/components/analysis/analysis-card";
import { InnovationDna } from "@/components/innovation/innovation-dna";
import { InnovationForm } from "@/components/innovation/innovation-form";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import { formToModelInput, type InnovationFormData } from "@/lib/innovation/form-mapper";
import { validateInnovationModel } from "@/lib/innovation/model-validator";
import { runSampleAnalysis } from "@/lib/analysis/sample-matcher";
import { loadInnovation, saveInnovation } from "@/lib/scenario/storage";
import type { AnalysisFinding } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";
import type { FieldError } from "@/lib/innovation/model-validator";

const MODULE_ORDER = ["ip", "tk", "abs", "regulatory"] as const;

export function AnalysisWorkbench({
  evidence,
  autoRun = false,
}: {
  evidence: SampleEvidence[];
  /** When true, run analysis immediately from the stored innovation (demo flow). */
  autoRun?: boolean;
}): React.JSX.Element {
  const [model, setModel] = useState<InnovationModel | null>(null);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [findings, setFindings] = useState<AnalysisFinding[] | null>(null);
  const autoRan = useRef(false);

  function runModel(value: InnovationModel): void {
    setErrors([]);
    setModel(value);
    saveInnovation(value);
    const analysis = runSampleAnalysis(value, evidence);
    setFindings(MODULE_ORDER.map((module) => analysis[module]));
  }

  useEffect(() => {
    if (autoRun && !autoRan.current) {
      autoRan.current = true;
      const stored = loadInnovation();
      if (stored) runModel(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  function handleSubmit(form: InnovationFormData): void {
    const result = validateInnovationModel(formToModelInput(form));
    if (!result.valid) {
      setModel(null);
      setFindings(null);
      setErrors(result.errors);
      return;
    }
    runModel(result.value);
  }

  return (
    <div className="space-y-6">
      <InnovationForm onSubmit={handleSubmit} />

      {errors.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-base font-semibold text-red-800">
            Validation failed ({errors.length} {errors.length === 1 ? "error" : "errors"})
          </h2>
          <ul className="mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                <span className="font-mono text-xs">{error.path}</span>
                {" — "}
                {error.message}
                <span className="font-mono text-xs"> ({error.code})</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {model ? <InnovationDna model={model} /> : null}

      {findings ? (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-primary-900">
            Sample analysis (rule-based prototype, no patentability score)
          </h2>
          {findings.map((finding) => (
            <AnalysisCard key={finding.id} finding={finding} entries={evidence} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
