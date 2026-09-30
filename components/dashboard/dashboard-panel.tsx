"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import { runSampleAnalysis } from "@/lib/analysis/sample-matcher";
import { generateRedTeamFindings } from "@/lib/redteam/sample-redteam";
import { loadInnovation, loadScenario } from "@/lib/scenario/storage";
import { MODULE_ORDER, MODULE_TITLE } from "@/lib/reports/report-builder";
import type { AnalysisFinding } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";

interface DashboardState {
  innovation: InnovationModel;
  versionCount: number;
  perModule: { module: string; matches: number }[];
  redTeamCount: number;
  gaps: number;
}

function StatCard({
  label,
  value,
  href,
  linkLabel,
}: {
  label: string;
  value: string;
  href: string;
  linkLabel: string;
}): React.JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary-900">{value}</p>
      <Link href={href} className="mt-2 inline-block text-sm font-medium text-primary-700 hover:underline">
        {linkLabel} →
      </Link>
    </div>
  );
}

export function DashboardPanel({
  evidence,
}: {
  evidence: SampleEvidence[];
}): React.JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<DashboardState | null>(null);

  useEffect(() => {
    setMounted(true);
    const innovation = loadInnovation();
    if (!innovation) {
      setState(null);
      return;
    }
    const scenario = loadScenario();
    const versions =
      scenario && scenario.base.id === innovation.id
        ? scenario.variants.map((v) => v.version)
        : [];
    const findings = runSampleAnalysis(innovation, evidence);
    const redTeam = generateRedTeamFindings("A", innovation, findings, evidence);
    const gaps = (Object.values(findings) as AnalysisFinding[]).filter(
      (finding) => finding.uncertainty === "insufficient_evidence"
    ).length;
    setState({
      innovation,
      versionCount: 1 + versions.length,
      perModule: MODULE_ORDER.map((module) => ({
        module: MODULE_TITLE[module],
        matches: findings[module].evidenceIds.length,
      })),
      redTeamCount: redTeam.length,
      gaps,
    });
  }, [evidence]);

  if (!mounted) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!state) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-primary-900">No workspace yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Run an analysis or load the demo to see status cards here.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/analysis">
            <Button>Go to Analysis</Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline">Go to Reports</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Current innovation</p>
        <p className="mt-1 text-xl font-bold text-primary-900">{state.innovation.title}</p>
        <p className="mt-1 text-sm text-slate-600">
          {state.innovation.ingredients.map((i) => `${i.botanicalName} ${i.quantity.amount}%`).join(", ")} —{" "}
          {state.innovation.targetJurisdictions.join(", ")}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Versions" value={String(state.versionCount)} href="/scenario-lab" linkLabel="Open Scenario Lab" />
        <StatCard label="Red-team findings" value={String(state.redTeamCount)} href="/red-team" linkLabel="Open Red Team" />
        <StatCard label="Evidence gaps" value={String(state.gaps)} href="/reports" linkLabel="Open Report" />
        {state.perModule.map((row) => (
          <StatCard
            key={row.module}
            label={`${row.module} matches`}
            value={String(row.matches)}
            href="/analysis"
            linkLabel="Open Analysis"
          />
        ))}
      </div>
    </div>
  );
}
