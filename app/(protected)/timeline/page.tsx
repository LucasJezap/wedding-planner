import { PageShell } from "@/components/page-shell";
import { TimelineManager } from "@/features/timeline/components/timeline-manager";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";
import { listTimelineEvents } from "@/services/timeline-service";

export default async function TimelinePage() {
  const session = await requirePageAccess("timeline");
  const { messages } = await getRequestMessages();

  return (
    <PageShell
      eyebrow={messages.pages.timeline.eyebrow}
      title={messages.pages.timeline.title}
      description={messages.pages.timeline.description}
    >
      <TimelineManager
        initialEvents={await listTimelineEvents()}
        viewerRole={session?.user?.role ?? "ADMIN"}
      />
    </PageShell>
  );
}
