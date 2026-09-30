import type { AnalysisFinding } from "@/types/analysis";
import type { SampleEvidence } from "@/lib/evidence/sample-evidence";
import { EvidenceCard } from "@/components/evidence/evidence-card";

const RISK_STYLE: Record<AnalysisFinding["risk"], string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
  critical: "bg-red-200 text-red-900",
  unknown: "bg-slate-100 text-slate-600",
};

export function AnalysisCard({
  finding,
  entries,
}: {
  finding: AnalysisFinding;
  entries: SampleEvidence[];
}): React.JSX.Element {
  const matched = new Map(entries.map((entry) => [entry.id, entry]));
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-primary-900">{finding.title}</h3>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${RISK_STYLE[finding.risk]}`}>
          {finding.risk.toUpperCase()}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {finding.uncertainty.replaceAll("_", " ")}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        <span className="font-medium">Source fact: </span>
        {finding.sourceFact}
      </p>
      <p className="mt-1 text-sm text-slate-700">
        <span className="font-medium">Interpretation: </span>
        {finding.interpretation}
      </p>
      <div className="mt-3 space-y-2">
        {finding.evidenceIds.length === 0 ? (
          <p className="text-sm text-slate-500">No evidence matched.</p>
        ) : (
          finding.evidenceIds.map((id) => {
            const entry = matched.get(id);
            return entry ? <EvidenceCard key={id} entry={entry} /> : null;
          })
        )}
      </div>
    </section>
  );
}
