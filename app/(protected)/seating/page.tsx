import { PageShell } from "@/components/page-shell";
import { SeatingPlanner } from "@/features/seating/components/seating-planner";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";
import { getSeatingBoard } from "@/services/seating-service";

export default async function SeatingPage() {
  const session = await requirePageAccess("seating");
  const { messages } = await getRequestMessages();

  return (
    <PageShell
      eyebrow={messages.pages.seating.eyebrow}
      title={messages.pages.seating.title}
      description={messages.pages.seating.description}
    >
      <SeatingPlanner
        initialBoard={await getSeatingBoard()}
        viewerRole={session.user.role}
      />
    </PageShell>
  );
}
