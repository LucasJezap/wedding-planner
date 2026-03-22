import { PageShell } from "@/components/page-shell";
import { AccessManager } from "@/features/access/components/access-manager";
import { canManageAccess } from "@/lib/access-control";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";
import { listAccountInvitations, listAccounts } from "@/services/auth-service";

export default async function AccessPage() {
  const session = await requirePageAccess("dashboard");
  const { messages } = await getRequestMessages();
  const users = await listAccounts();
  const canManage = canManageAccess(session.user.role);

  return (
    <PageShell
      eyebrow={messages.access.eyebrow}
      title={messages.access.title}
      description={messages.access.description}
    >
      <AccessManager
        initialUsers={users}
        initialInvitations={canManage ? await listAccountInvitations() : []}
        currentUserId={session.user.id}
        viewerRole={session.user.role}
        canManageAccess={canManage}
      />
    </PageShell>
  );
}
