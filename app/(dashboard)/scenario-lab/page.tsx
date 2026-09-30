import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/common/empty-state";

export default function ScenarioLabPage(): React.JSX.Element {
  return (
    <PageContainer
      title="Scenario Lab"
      description="What-if simulation: modify an innovation, compare versions, and re-analyse. Engine arrives in Phase 2."
    >
      <EmptyState />
    </PageContainer>
  );
}
