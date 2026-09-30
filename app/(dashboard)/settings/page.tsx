import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/common/empty-state";

export default function SettingsPage(): React.JSX.Element {
  return (
    <PageContainer
      title="Settings"
      description="Workspace preferences, jurisdictions, and integrations. Full settings arrive in Phase 2."
    >
      <EmptyState />
    </PageContainer>
  );
}
