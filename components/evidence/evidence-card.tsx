import type { SampleEvidence } from "@/lib/evidence/sample-evidence";

const TYPE_LABEL: Record<SampleEvidence["type"], string> = {
  prior_art: "Prior art",
  traditional_knowledge: "Traditional knowledge",
  abs: "ABS",
  regulatory: "Regulatory",
};

export function EvidenceCard({ entry }: { entry: SampleEvidence }): React.JSX.Element {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
          {entry.label}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {TYPE_LABEL[entry.type]} · {entry.jurisdiction}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-900">
        {entry.id} — {entry.title}
      </p>
      <p className="mt-1 text-sm text-slate-600">{entry.summary}</p>
    </div>
  );
}
