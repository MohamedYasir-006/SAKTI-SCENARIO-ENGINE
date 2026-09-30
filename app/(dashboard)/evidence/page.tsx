import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/common/empty-state";

export default function EvidencePage(): React.JSX.Element {
  return (
    <PageContainer
      title="Evidence"
      description="Jurisdiction-aware evidence retrieval and claim-to-evidence mapping. Retrieval arrives in Phase 2."
    >
      <EmptyState />
    </PageContainer>
  );
}
