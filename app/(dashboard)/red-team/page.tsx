import { PageContainer } from "@/components/layout/page-container";
import { RedTeamPanel } from "@/components/red-team/red-team-panel";
import { parseSampleEvidence } from "@/lib/evidence/sample-evidence";
import rawEvidence from "@/data/demo/ashwabrahm/evidence.json";

export default function RedTeamPage(): React.JSX.Element {
  const parsed = parseSampleEvidence(rawEvidence);
  return (
    <PageContainer
      title="Red Team"
      description="Rule-based attacks on your analyzed versions: high overlaps, missing evidence, unvalidated claims, jurisdiction gaps. Prototype with sample evidence only."
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
        <RedTeamPanel evidence={parsed.items} />
      )}
    </PageContainer>
  );
}
