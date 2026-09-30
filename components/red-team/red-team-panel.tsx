"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import { runSampleAnalysis } from "@/lib/analysis/sample-matcher";
import { loadInnovation, loadScenario } from "@/lib/scenario/storage";
import {
  generateRedTeamFindings,
  groupFindingsByCategory,
} from "@/lib/redteam/sample-redteam";
import type { AnalysisFinding, AnalysisKind } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";

interface VersionOption {
  version: string;
  model: InnovationModel;
  findings: Record<AnalysisKind, AnalysisFinding>;
}

export function RedTeamPanel({
  evidence,
}: {
  evidence: SampleEvidence[];
}): React.JSX.Element {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [options, setOptions] = useState<VersionOption[] | null>(null);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const scenario = loadScenario();
    if (scenario) {
      const opts: VersionOption[] = [
        { version: "A", model: scenario.base, findings: scenario.baseFindings },
        ...scenario.variants.map((variant) => ({
          version: variant.version,
          model: variant.model,
          findings: runSampleAnalysis(variant.model, evidence),
        })),
      ];
      setOptions(opts);
      setSelected(opts[opts.length - 1].version);
      return;
    }
    const innovation = loadInnovation();
    if (innovation) {
      setOptions([{ version: "A", model: innovation, findings: runSampleAnalysis(innovation, evidence) }]);
      setSelected("A");
      return;
    }
    setOptions([]);
  }, [evidence]);

  if (!mounted || options === null) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (options.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-primary-900">Nothing to attack yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Run an analysis or build scenario versions first.
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => router.push("/analysis")}>Go to Analysis</Button>
          <Button variant="outline" onClick={() => router.push("/scenario-lab")}>
            Go to Scenario Lab
          </Button>
        </div>
      </div>
    );
  }

  const current = options.find((option) => option.version === selected) ?? options[0];
  const findings = generateRedTeamFindings(current.version, current.model, current.findings, evidence);
  const groups = groupFindingsByCategory(findings);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5">
        <label className="text-sm font-medium text-slate-700" htmlFor="rt-version">
          Attack version
        </label>
        <select
          id="rt-version"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          value={current.version}
          onChange={(event) => setSelected(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.version} value={option.version}>
              Version {option.version}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">
          Rule-based prototype — no AI, no patentability score.
        </span>
      </div>

      {groups.map((group) => (
        <section key={group.category} className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-primary-900">
            {group.label} ({group.findings.length})
          </h2>
          <div className="mt-3 space-y-3">
            {group.findings.map((finding) => (
              <article key={finding.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{finding.title}</h3>
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                    {finding.severity.toUpperCase()}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {finding.uncertainty.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-medium">Vulnerability: </span>
                  {finding.description}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-medium">Source fact: </span>
                  {finding.sourceFact}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-medium">Interpretation: </span>
                  {finding.interpretation}
                </p>
                {finding.evidenceIds.length > 0 ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Evidence refs: {finding.evidenceIds.join(", ")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
