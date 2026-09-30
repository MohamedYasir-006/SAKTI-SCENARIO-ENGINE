import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/common/empty-state";

export default function AnalysisPage(): React.JSX.Element {
  return (
    <PageContainer
      title="Analysis"
      description="IP, traditional knowledge, ABS, and regulatory analysis. Engines arrive in Phase 2."
    >
      <EmptyState />
    </PageContainer>
  );
}
