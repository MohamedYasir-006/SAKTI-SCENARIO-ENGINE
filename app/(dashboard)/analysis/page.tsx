import { PageContainer } from "@/components/layout/page-container";
import { AnalysisWorkbench } from "@/components/analysis/analysis-workbench";
import { parseSampleEvidence } from "@/lib/evidence/sample-evidence";
import rawEvidence from "@/data/demo/ashwabrahm/evidence.json";

export default function AnalysisPage(): React.JSX.Element {
  const parsed = parseSampleEvidence(rawEvidence);
  return (
    <PageContainer
      title="Analysis"
      description="Describe an innovation, validate it against the innovation model, and run a rule-based prototype screen against illustrative sample evidence."
    >
      {!parsed.valid ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-base font-semibold text-red-800">Sample evidence failed to load</h2>
          <ul className="mt-2 space-y-1">
            {parsed.errors.map((error) => (
              <li key={error} className="text-sm text-red-700">
                {error}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <AnalysisWorkbench evidence={parsed.items} />
      )}
    </PageContainer>
  );
}
