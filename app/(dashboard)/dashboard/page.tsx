import { PageContainer } from "@/components/layout/page-container";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { parseSampleEvidence } from "@/lib/evidence/sample-evidence";
import rawEvidence from "@/data/demo/ashwabrahm/evidence.json";

export default function DashboardPage(): React.JSX.Element {
  const parsed = parseSampleEvidence(rawEvidence);
  return (
    <PageContainer
      title="Dashboard"
      description="Workspace status: current innovation, versions, findings, and gaps."
    >
      {!parsed.valid ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-base font-semibold text-red-800">Sample evidence failed to load</h2>
        </div>
      ) : (
        <DashboardPanel evidence={parsed.items} />
      )}
    </PageContainer>
  );
}
