import { PageShell } from "@/components/page-shell";
import { GuestManager } from "@/features/guests/components/guest-manager";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";
import { listGuests, listInvitationGroups } from "@/services/guest-service";

export default async function GuestsPage() {
  const session = await requirePageAccess("guests");
  const { messages } = await getRequestMessages();

  return (
    <PageShell
      eyebrow={messages.pages.guests.eyebrow}
      title={messages.pages.guests.title}
      description={messages.pages.guests.description}
    >
      <GuestManager
        initialGuests={await listGuests()}
        initialGroups={await listInvitationGroups()}
        viewerRole={session.user.role}
      />
    </PageShell>
  );
}
