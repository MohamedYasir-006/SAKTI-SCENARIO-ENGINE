import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/common/empty-state";

export default function RedTeamPage(): React.JSX.Element {
  return (
    <PageContainer
      title="Red Team"
      description="AI red-teaming: attack claims, surface weaknesses, and propose mitigations. Engine arrives in Phase 2."
    >
      <EmptyState />
    </PageContainer>
  );
}
