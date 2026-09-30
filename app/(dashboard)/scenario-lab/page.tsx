import { PageContainer } from "@/components/layout/page-container";
import { ScenarioLabWorkbench } from "@/components/scenario/scenario-lab-workbench";
import { parseSampleEvidence } from "@/lib/evidence/sample-evidence";
import rawEvidence from "@/data/demo/ashwabrahm/evidence.json";

export default function ScenarioLabPage(): React.JSX.Element {
  const parsed = parseSampleEvidence(rawEvidence);
  return (
    <PageContainer
      title="Scenario Lab"
      description="What-if simulation: version your innovation, re-run only the affected modules, and compare. Prototype with sample evidence only."
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
        <ScenarioLabWorkbench evidence={parsed.items} />
      )}
    </PageContainer>
  );
}
