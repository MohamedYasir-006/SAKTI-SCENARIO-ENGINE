"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScenarioComparison } from "@/components/scenario/scenario-comparison";
import { ScenarioEditor } from "@/components/scenario/scenario-editor";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import { validateInnovationModel, type FieldError } from "@/lib/innovation/model-validator";
import { buildDemoVariants, type DemoScenarioSpec } from "@/lib/demo/demo-loader";
import { runSampleAnalysis } from "@/lib/analysis/sample-matcher";
import {
  analyzeVersion,
  type VersionAnalysis,
} from "@/lib/scenario/scenario-analysis";
import {
  loadInnovation,
  saveScenario,
} from "@/lib/scenario/storage";
import type { AnalysisFinding } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";

function clone(model: InnovationModel): InnovationModel {
  return JSON.parse(JSON.stringify(model)) as InnovationModel;
}

export function ScenarioLabWorkbench({
  evidence,
  demoScenarios,
}: {
  evidence: SampleEvidence[];
  demoScenarios?: DemoScenarioSpec | null;
}): React.JSX.Element {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [base, setBase] = useState<InnovationModel | null>(null);
  const [modelB, setModelB] = useState<InnovationModel | null>(null);
  const [modelC, setModelC] = useState<InnovationModel | null>(null);
  const [showC, setShowC] = useState(false);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [analyses, setAnalyses] = useState<VersionAnalysis[] | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = loadInnovation();
    setBase(stored);
    setModelB(stored ? clone(stored) : null);
  }, []);

  if (!mounted) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!base || !modelB) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-primary-900">No base innovation yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter and validate an innovation on the Analysis page first — it becomes Version A here.
        </p>
        <div className="mt-4">
          <Button onClick={() => router.push("/analysis")}>Go to Analysis</Button>
        </div>
      </div>
    );
  }

  const baseFindings = runSampleAnalysis(base, evidence);
  const baseGaps = (Object.values(baseFindings) as AnalysisFinding[]).filter(
    (finding) => finding.uncertainty === "insufficient_evidence"
  ).length;

  function handleCompare(): void {
    if (!base || !modelB) return;
    const variants: { version: string; model: InnovationModel }[] = [
      { version: "B", model: modelB },
    ];
    if (showC && modelC) variants.push({ version: "C", model: modelC });

    const allErrors: FieldError[] = [];
    for (const variant of variants) {
      const result = validateInnovationModel(variant.model);
      if (!result.valid) {
        allErrors.push(
          ...result.errors.map((error) => ({
            ...error,
            path: `Version ${variant.version}: ${error.path}`,
          }))
        );
      }
    }
    if (allErrors.length > 0) {
      setAnalyses(null);
      setErrors(allErrors);
      return;
    }
    setErrors([]);
    const results = variants.map((variant) =>
      analyzeVersion(variant.version, base as InnovationModel, baseFindings, variant.model, evidence)
    );
    setAnalyses(results);
    saveScenario({
      base: base as InnovationModel,
      baseFindings,
      baseGaps,
      variants: variants.map((variant) => ({ version: variant.version, model: variant.model })),
    });
  }
  function handleAttack(): void {
    if (analyses) {
      saveScenario({
        base: base as InnovationModel,
        baseFindings,
        baseGaps,
        variants: analyses.map((analysis) => ({ version: analysis.version, model: analysis.model })),
      });
    }
    router.push("/red-team");
  }

  function handleLoadDemoScenario(): void {
    if (!base || !demoScenarios) return;
    const result = buildDemoVariants(base, { versionB: demoScenarios.versionB, versionC: demoScenarios.versionC });
    if (!result.valid) {
      setAnalyses(null);
      setErrors(result.errors.map((message) => ({ path: "demo scenario", code: "invalid_demo", message })));
      return;
    }
    setErrors([]);
    setAnalyses(null);
    setModelB(result.variants.versionB);
    setModelC(result.variants.versionC);
    setShowC(true);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-primary-900">Version A (base)</h2>
        <p className="mt-1 text-sm text-slate-600">
          {base.title} — {base.ingredients.map((i) => `${i.botanicalName} ${i.quantity.amount}%`).join(", ")} —{" "}
          {base.processSteps[0]?.action} — {base.targetJurisdictions.join(", ")}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ScenarioEditor version="B" model={modelB} onChange={setModelB} />
        {showC && modelC ? (
          <ScenarioEditor version="C" model={modelC} onChange={setModelC} />
        ) : (
          <div className="flex items-start">
            <Button
              variant="outline"
              onClick={() => {
                setModelC(clone(base));
                setShowC(true);
              }}
            >
              Add version C
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-base font-semibold text-red-800">Variant validation failed</h2>
          <ul className="mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                <span className="font-mono text-xs">{error.path}</span> — {error.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCompare}>Compare versions</Button>
        {demoScenarios ? (
          <Button variant="outline" onClick={handleLoadDemoScenario}>
            Load demo scenario
          </Button>
        ) : null}
        <Button variant="outline" onClick={handleAttack}>
          Attack my innovation
        </Button>
      </div>

      {analyses
        ? analyses.map((analysis) => (
            <div key={analysis.version} className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-primary-900">
                Version {analysis.version} changes vs A
              </h3>
              {analysis.changes.length === 0 ? (
                <p className="mt-1 text-sm text-slate-500">No changes.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {analysis.changes.map((change, index) => (
                    <li key={index} className="text-sm text-slate-700">
                      {change.label}: <span className="font-mono text-xs">{change.oldValue}</span> →{" "}
                      <span className="font-mono text-xs">{change.newValue}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Re-ran modules: {analysis.reRan.length > 0 ? analysis.reRan.join(", ").toUpperCase() : "none"}
              </p>
            </div>
          ))
        : null}

      {analyses ? (
        <ScenarioComparison
          baseVersion="A"
          baseFindings={baseFindings}
          baseGaps={baseGaps}
          analyses={analyses}
        />
      ) : null}
    </div>
  );
}

