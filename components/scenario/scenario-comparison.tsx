import type { AnalysisFinding, AnalysisKind } from "@/types/analysis";
import { whyChanged, type VersionAnalysis } from "@/lib/scenario/scenario-analysis";

const MODULE_ROWS: { module: AnalysisKind; label: string }[] = [
  { module: "ip", label: "IP" },
  { module: "tk", label: "TK" },
  { module: "abs", label: "ABS" },
  { module: "regulatory", label: "Regulatory" },
];

const RISK_STYLE: Record<AnalysisFinding["risk"], string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
  critical: "bg-red-200 text-red-900",
  unknown: "bg-slate-100 text-slate-600",
};

function ModuleCell({
  base,
  finding,
}: {
  base: AnalysisFinding;
  finding: AnalysisFinding;
}): React.JSX.Element {
  return (
    <div className="space-y-1">
      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${RISK_STYLE[finding.risk]}`}>
        {finding.risk.toUpperCase()}
      </span>
      <p className="text-xs text-slate-500">{finding.uncertainty.replaceAll("_", " ")}</p>
      <p className="text-xs text-slate-700">{whyChanged(base, finding)}</p>
    </div>
  );
}

/**
 * Version comparison table. Columns: base + variants. Rows: the four
 * modules plus evidence-gap counts. "Why" lines come from matcher
 * outputs only — nothing is invented.
 */
export function ScenarioComparison({
  baseVersion,
  baseFindings,
  baseGaps,
  analyses,
}: {
  baseVersion: string;
  baseFindings: Record<AnalysisKind, AnalysisFinding>;
  baseGaps: number;
  analyses: VersionAnalysis[];
}): React.JSX.Element {
  const columns = [baseVersion, ...analyses.map((a) => a.version)];
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="border-b border-slate-200 p-3 text-left font-medium text-slate-600">Row</th>
            {columns.map((column) => (
              <th key={column} className="border-b border-slate-200 p-3 text-left font-semibold text-primary-900">
                Version {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODULE_ROWS.map((row) => (
            <tr key={row.module} className="align-top">
              <td className="border-b border-slate-100 p-3 font-medium text-slate-700">{row.label}</td>
              <td className="border-b border-slate-100 p-3">
                <ModuleCell base={baseFindings[row.module]} finding={baseFindings[row.module]} />
              </td>
              {analyses.map((analysis) => (
                <td key={analysis.version} className="border-b border-slate-100 p-3">
                  <ModuleCell base={baseFindings[row.module]} finding={analysis.findings[row.module]} />
                </td>
              ))}
            </tr>
          ))}
          <tr className="align-top">
            <td className="p-3 font-medium text-slate-700">Evidence gaps</td>
            <td className="p-3 text-slate-700">{baseGaps}</td>
            {analyses.map((analysis) => (
              <td key={analysis.version} className="p-3 text-slate-700">
                {analysis.gaps}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
