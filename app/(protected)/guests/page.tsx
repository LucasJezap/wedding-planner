import { PageShell } from "@/components/page-shell";
import { GuestManager } from "@/features/guests/components/guest-manager";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";
import { listGuests } from "@/services/guest-service";

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
        viewerRole={session.user.role}
      />
    </PageShell>
  );
}
