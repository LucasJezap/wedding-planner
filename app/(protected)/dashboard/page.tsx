import { PageShell } from "@/components/page-shell";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";
import { getDashboardData } from "@/services/dashboard-service";

export default async function DashboardPage() {
  const session = await requirePageAccess("dashboard");
  const data = await getDashboardData({ viewerRole: session?.user?.role });
  const { messages } = await getRequestMessages();

  return (
    <PageShell
      eyebrow={messages.pages.dashboard.eyebrow}
      title={messages.pages.dashboard.title}
      description={messages.pages.dashboard.description}
    >
      <DashboardOverview data={data} />
    </PageShell>
  );
}
