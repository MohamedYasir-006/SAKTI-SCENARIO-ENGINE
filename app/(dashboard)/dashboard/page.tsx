import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/common/empty-state";

export default function DashboardPage(): React.JSX.Element {
  return (
    <PageContainer
      title="Dashboard"
      description="Overview of innovations, scenarios, and evidence coverage. Full widgets arrive in Phase 2."
    >
      <EmptyState />
    </PageContainer>
  );
}
