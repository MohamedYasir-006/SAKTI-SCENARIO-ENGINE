import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/common/empty-state";

export default function ReportsPage(): React.JSX.Element {
  return (
    <PageContainer
      title="Reports"
      description="Evidence-grounded reporting with research-gap detection. Generator arrives in Phase 2."
    >
      <EmptyState />
    </PageContainer>
  );
}
