import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { AccessManager } from "@/features/access/components/access-manager";
import { canManageAccess } from "@/lib/access-control";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";
import { listAccountInvitations, listAccounts } from "@/services/auth-service";

export default async function AccessPage() {
  const session = await requirePageAccess("dashboard");
  if (!canManageAccess(session.user.role)) {
    redirect("/dashboard");
  }
  const { messages } = await getRequestMessages();

  return (
    <PageShell
      eyebrow={messages.access.eyebrow}
      title={messages.access.title}
      description={messages.access.description}
    >
      <AccessManager
        initialUsers={await listAccounts()}
        initialInvitations={await listAccountInvitations()}
      />
    </PageShell>
  );
}
