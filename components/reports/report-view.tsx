"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnalysisCard } from "@/components/analysis/analysis-card";
import { EvidenceCard } from "@/components/evidence/evidence-card";
import { InnovationDna } from "@/components/innovation/innovation-dna";
import { ScenarioComparison } from "@/components/scenario/scenario-comparison";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import { runSampleAnalysis } from "@/lib/analysis/sample-matcher";
import { groupFindingsByCategory } from "@/lib/redteam/sample-redteam";
import { analyzeVersion } from "@/lib/scenario/scenario-analysis";
import { loadInnovation, loadScenario } from "@/lib/scenario/storage";
import {
  buildReportData,
  MODULE_ORDER,
  MODULE_TITLE,
  type ReportData,
} from "@/lib/reports/report-builder";

export const REPORT_DISCLAIMER =
  "Decision-support prototype using illustrative sample evidence. Not legal advice. Professional IP/regulatory review recommended.";

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="print-section rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-primary-900">
        {number}. {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function ReportView({
  evidence,
}: {
  evidence: SampleEvidence[];
}): React.JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    setMounted(true);
    const innovation = loadInnovation();
    if (!innovation) {
      setReport(null);
      return;
    }
    const baseFindings = runSampleAnalysis(innovation, evidence);
    const scenario = loadScenario();
    const versions =
      scenario && scenario.base.id === innovation.id
        ? scenario.variants.map((variant) => {
            const analysis = analyzeVersion(
              variant.version,
              innovation,
              baseFindings,
              variant.model,
              evidence
            );
            return {
              version: analysis.version,
              model: analysis.model,
              changes: analysis.changes,
              findings: analysis.findings,
              gaps: analysis.gaps,
            };
          })
        : [];
    setReport(buildReportData({ innovation, baseFindings, evidence, versions }));
  }, [evidence]);

  if (!mounted) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!report) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-primary-900">No report yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Run an analysis first — the report is built from your stored innovation and versions.
        </p>
        <div className="mt-4">
          <Link href="/analysis">
            <Button>Go to Analysis</Button>
          </Link>
        </div>
      </div>
    );
  }

  const redGroups = groupFindingsByCategory(report.redTeam);
  const byId = new Map(evidence.map((entry) => [entry.id, entry]));

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">
          Generated {new Date(report.generatedAt).toLocaleString()} from your stored workspace.
        </p>
        <Button onClick={() => window.print()}>Print / Save as PDF</Button>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-900">{REPORT_DISCLAIMER}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-primary-900">Innovation Intelligence Report</h1>
        <p className="mt-1 text-sm text-slate-600">{report.innovationTitle}</p>
      </div>

      <Section number={1} title="Innovation summary">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-700">Title</dt>
            <dd className="text-slate-600">{report.innovation.title}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Intended use</dt>
            <dd className="text-slate-600">{report.innovation.intendedUse.join("; ")}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Jurisdictions</dt>
            <dd className="text-slate-600">{report.innovation.targetJurisdictions.join(", ")}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Ingredients</dt>
            <dd className="text-slate-600">
              {report.innovation.ingredients
                .map((i) => `${i.botanicalName} ${i.quantity.amount}${i.quantity.unit === "percent" ? "%" : ` ${i.quantity.unit}`}`)
                .join(", ")}
            </dd>
          </div>
        </dl>
      </Section>

      <Section number={2} title="Innovation DNA tree">
        <InnovationDna model={report.innovation} />
      </Section>

      <Section number={3} title="Analysis by module">
        {MODULE_ORDER.map((module) => (
          <div key={module}>
            <h3 className="text-sm font-semibold text-slate-700">{MODULE_TITLE[module]}</h3>
            <div className="mt-2">
              <AnalysisCard finding={report.baseFindings[module]} entries={evidence} />
            </div>
          </div>
        ))}
      </Section>

      {report.versions.length > 0 ? (
        <Section number={4} title="Scenario comparison">
          <ScenarioComparison
            baseVersion="A"
            baseFindings={report.baseFindings}
            baseGaps={report.baseGaps}
            analyses={report.versions.map((v) => ({
              version: v.version,
              model: v.model,
              changes: v.changes,
              affected: [],
              reRan: [],
              findings: v.findings,
              gaps: v.gaps,
            }))}
          />
        </Section>
      ) : null}

      <Section number={5} title="Red-team findings">
        {redGroups.length === 0 ? (
          <p className="text-sm text-slate-500">No red-team findings.</p>
        ) : (
          redGroups.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-slate-700">
                {group.label} ({group.findings.length})
              </h3>
              <ul className="mt-2 space-y-2">
                {group.findings.map((finding) => (
                  <li key={finding.id} className="rounded-md border border-slate-200 p-3 text-sm">
                    <p className="font-medium text-slate-900">{finding.title}</p>
                    <p className="mt-1 text-slate-700">{finding.description}</p>
                    <p className="mt-1 text-slate-600">
                      <span className="font-medium">Source fact: </span>
                      {finding.sourceFact}
                    </p>
                    <p className="mt-1 text-slate-600">
                      <span className="font-medium">Interpretation: </span>
                      {finding.interpretation}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </Section>

      <Section number={6} title="Evidence gaps">
        {report.gaps.length === 0 ? (
          <p className="text-sm text-slate-500">No evidence gaps recorded.</p>
        ) : (
          <ul className="space-y-2">
            {report.gaps.map((gap, index) => (
              <li key={index} className="text-sm text-slate-700">
                <span className="font-medium">{gap.where}</span> — {gap.uncertainty.replaceAll("_", " ")}:{" "}
                {gap.interpretation}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section number={7} title="Human review points">
        {report.reviewPoints.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing flagged.</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5">
            {report.reviewPoints.map((point) => (
              <li key={point} className="text-sm text-slate-700">
                {point}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section number={8} title="Evidence list with source-fact vs interpretation">
        {report.citedEvidence.length === 0 ? (
          <p className="text-sm text-slate-500">No evidence cited.</p>
        ) : (
          report.citedEvidence.map((cited) => {
            const entry = byId.get(cited.entry.id);
            return (
              <div key={cited.entry.id} className="space-y-2">
                {entry ? <EvidenceCard entry={entry} /> : null}
                {cited.citations.map((citation, index) => (
                  <div key={index} className="ml-2 border-l-2 border-slate-200 pl-3 text-sm">
                    <p className="font-medium text-slate-700">
                      {citation.where} · {MODULE_TITLE[citation.module]}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium">Source fact: </span>
                      {citation.sourceFact}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium">Interpretation: </span>
                      {citation.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </Section>
    </div>
  );
}
